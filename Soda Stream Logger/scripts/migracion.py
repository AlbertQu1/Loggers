"""
Migra datos reales de Google Sheets (published-to-web CSV) a las tablas de
Soda Stream Logger. Mismo patron que el script de Coffee Logger: borra las
tablas propias y las vuelve a llenar desde cero (idempotente por diseno,
no upsert incremental).

Supuestos de negocio (documentados aqui porque el sheet no los deja
explicitos, igual que el script de cafe documenta "Regalo"/is_annual):

- CONSUMPTION.intensidad='-' (115 de 136 filas): son de la era MANUAL,
  antes del equipo nuevo que trackea shots por intensidad -- NO se migran
  a soda_preparations (esa tabla exige al menos 1 shot, CHECK
  at_least_one_shot, y serian datos inventados). Solo se usan para el
  rango de fechas/rendimiento de cilindros (ver imprimir_rendimiento_cilindros).
  Las 21 filas restantes (con intensidad real) SI se migran completas --
  son del equipo nuevo, de ahi en adelante el rendimiento se puede medir
  mas preciso por shot.
- CONSUMPTION.sabor_id=0 ("Natural") -> flavor_id NULL (sin sabor, igual
  que el toggle "Flavor" apagado en el formulario de la app).
- CONSUMPTION.sabor_id=3 ("Limon") -> fila en soda_flavors "Limón Natural"
  con always_available=true, cost/ml/purchase_date NULL -- no es una
  compra real, es exprimido fresco y no se puede medir/trackear como las
  demas (misma convencion que ya establece la migracion 0005 de la app).
- soda_cylinders: purchase_date/opened_date se infieren del min(fecha) de
  CONSUMPTION para ese tanque (REFILLS no trae fechas). closed_date =
  max(fecha) si NO es el tanque mas reciente; el tanque con la fecha mas
  reciente en todo el dataset queda status=ACTIVE (respeta el indice unico
  one_active_cylinder_idx). Tanques que nunca aparecen en CONSUMPTION
  (ej. el ultimo comprado) quedan PENDING con purchase_date=hoy (default
  de la columna) ya que no hay fecha real que usar.
- MARKET: una fila por (segmento, marca, anio) -- normaliza las columnas
  2025/2026 del sheet a filas, para poder agregar anios nuevos despues sin
  cambiar el schema (UNIQUE en segment+brand+year permite upsert).

Uso:
    python scripts/migracion.py
"""

import os
import re
import unicodedata

import pandas as pd
import psycopg2
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env.local"))

SHEET_ID_PUB = "2PACX-1vSu__j5QoavomkvGHb-KsBJIksa5thdocxT9jypBMipIxRssWD9BSGQD6Y9VLH5bqG0Nm4ncfz1QJ3R"
GID_CONSUMPTION = "1147085087"
GID_REFILLS = "2137771458"
GID_FLAVORS = "262434794"
GID_MARKET = "564576677"
GID_FLAVOR_HISTORY = "1090285920"


def normalize_key(value: object) -> str:
    text_ = str(value).strip()
    text_ = "".join(ch for ch in text_ if ch.isprintable())
    text_ = text_.lower()
    text_ = unicodedata.normalize("NFKD", text_)
    text_ = "".join(ch for ch in text_ if not unicodedata.combining(ch))
    return " ".join(text_.split())


def normalize_flavor_name(value: str) -> str:
    return " ".join(str(value).split()).strip()


def fetch_csv(gid: str, nombre: str) -> pd.DataFrame:
    url = f"https://docs.google.com/spreadsheets/d/e/{SHEET_ID_PUB}/pub?gid={gid}&single=true&output=csv"
    try:
        df = pd.read_csv(url)
        df.columns = [str(c).strip() for c in df.columns]
        return df
    except Exception as exc:
        print(f"Error de red en '{nombre}': {exc}")
        raise


def get_connection():
    return psycopg2.connect(
        host=os.environ["PGHOST"], port=os.environ.get("PGPORT", 5432), dbname=os.environ["PGDATABASE"],
        user=os.environ["PGUSER"], password=os.environ["PGPASSWORD"],
    )


def reset_tables(conn):
    with conn.cursor() as cur:
        cur.execute(
            "TRUNCATE TABLE soda_preparations, soda_cylinders, soda_flavors, "
            "soda_market_benchmarks RESTART IDENTITY CASCADE"
        )
    conn.commit()


def parse_intensidad(raw: str) -> tuple[int, int, int] | None:
    """Devuelve (shots_light, shots_medium, shots_strong), o None si no hay
    dato real ('-'/vacio, era manual antes del equipo nuevo -- no se inventa)."""
    if not raw or raw.strip() == "-":
        return None
    light = medium = strong = 0
    for token in raw.split(","):
        token = token.strip().lower()
        if not token:
            continue
        if token[0] == "l":
            light += 1
        elif token[0] == "m":
            medium += 1
        elif token[0] == "s":
            strong += 1
    return (light, medium, strong) if (light + medium + strong) else None


def migrate_flavors(conn, df_history: pd.DataFrame, df_flavors: pd.DataFrame) -> dict[int, int]:
    """Inserta soda_flavors desde FLAVOR_HISTORY + fila sintetica de Limon.
    Regresa {sabor_id del catalogo FLAVORS -> soda_flavors.id insertado}."""
    fechas = pd.to_datetime(df_history["fecha"].str.strip(), dayfirst=True, errors="coerce")
    nombre_a_flavor_id: dict[str, int] = {}

    with conn.cursor() as cur:
        for i, row in df_history.iterrows():
            nombre = normalize_flavor_name(row["Sabor"])
            cur.execute(
                """
                INSERT INTO soda_flavors (flavor_name, brand, cost, ml, purchase_date, always_available)
                VALUES (%s, %s, %s, %s, %s, false)
                RETURNING id
                """,
                (
                    nombre, row["marca"], round(float(row["Costo"])), int(row["ml"]),
                    fechas.iloc[i].date() if pd.notna(fechas.iloc[i]) else None,
                ),
            )
            nombre_a_flavor_id[normalize_key(nombre)] = cur.fetchone()[0]

        # Limon natural: exprimido fresco, sin costo/ml que trackear igual que los demas (ver supuestos arriba)
        cur.execute(
            """
            INSERT INTO soda_flavors (flavor_name, always_available)
            VALUES ('Limón Natural', true)
            RETURNING id
            """
        )
        nombre_a_flavor_id["limon"] = cur.fetchone()[0]
    conn.commit()

    # catalogo FLAVORS: sabor_id (0-3) -> nombre -> soda_flavors.id (o None para "Natural")
    sabor_id_a_flavor_id: dict[int, int | None] = {}
    for _, row in df_flavors.iterrows():
        clave = normalize_key(row["Sabor"])
        sabor_id = int(row["id"])
        if clave == "natural":
            sabor_id_a_flavor_id[sabor_id] = None
        else:
            sabor_id_a_flavor_id[sabor_id] = nombre_a_flavor_id.get(clave)
            if sabor_id_a_flavor_id[sabor_id] is None:
                print(f"  aviso: sabor '{row['Sabor']}' (id={sabor_id}) sin match en FLAVOR_HISTORY, queda NULL")
    return sabor_id_a_flavor_id


def migrate_cylinders(conn, df_refills: pd.DataFrame, df_consumption: pd.DataFrame) -> dict[str, int]:
    fechas_consumo = pd.to_datetime(df_consumption["fecha"], dayfirst=True, errors="coerce")
    por_tanque: dict[str, list] = {}
    for fecha, tanque in zip(fechas_consumo, df_consumption["cilindro_id"]):
        if pd.notna(fecha):
            por_tanque.setdefault(tanque, []).append(fecha)

    tanque_mas_reciente = max(por_tanque, key=lambda t: max(por_tanque[t])) if por_tanque else None

    label_a_id: dict[str, int] = {}
    with conn.cursor() as cur:
        for _, row in df_refills.iterrows():
            tanque = row["Tanque"]
            precio = round(float(row["Costo"]))
            fechas_tanque = por_tanque.get(tanque)

            if fechas_tanque is None:
                # nunca aparece en consumo -- comprado pero sin abrir (PENDING)
                cur.execute(
                    """
                    INSERT INTO soda_cylinders (label, price, status)
                    VALUES (%s, %s, 'PENDING')
                    RETURNING id
                    """,
                    (tanque, precio),
                )
            else:
                purchase_date = min(fechas_tanque).date()
                es_activo = tanque == tanque_mas_reciente
                closed_date = None if es_activo else max(fechas_tanque).date()
                status = "ACTIVE" if es_activo else "CLOSED"
                cur.execute(
                    """
                    INSERT INTO soda_cylinders (label, price, purchase_date, opened_date, closed_date, status)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (tanque, precio, purchase_date, purchase_date, closed_date, status),
                )
            label_a_id[tanque] = cur.fetchone()[0]
    conn.commit()
    return label_a_id


def migrate_preparations(conn, df: pd.DataFrame, label_a_cylinder_id: dict, sabor_id_a_flavor_id: dict):
    """Solo migra filas con intensidad real (equipo nuevo) -- las de la era
    manual ('-') no se insertan aqui, se usan solo para rendimiento de
    cilindros (ver imprimir_rendimiento_cilindros)."""
    fechas = pd.to_datetime(df["fecha"], dayfirst=True, errors="coerce")
    migradas = saltadas = 0
    with conn.cursor() as cur:
        for i, row in df.iterrows():
            fecha = fechas.iloc[i]
            if pd.isna(fecha):
                continue
            shots = parse_intensidad(str(row.get("intensidad", "")))
            if shots is None:
                saltadas += 1
                continue
            light, medium, strong = shots
            ml = int(row["ml"]) if pd.notna(row["ml"]) and int(row["ml"]) > 0 else None
            flavor_id = sabor_id_a_flavor_id.get(int(row["sabor_id"]))
            cur.execute(
                """
                INSERT INTO soda_preparations
                    (prepared_timestamp, cylinder_id, flavor_id, ml,
                     shots_light, shots_medium, shots_strong, bottles_prepared)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    fecha + pd.Timedelta(hours=12),
                    label_a_cylinder_id[row["cilindro_id"]],
                    flavor_id, ml, light, medium, strong, int(row["consumo"]),
                ),
            )
            migradas += 1
    conn.commit()
    print(f"  {migradas} preparaciones migradas (equipo nuevo, con shots reales)")
    print(f"  {saltadas} filas de la era manual NO migradas a soda_preparations (sin shots reales)")


def imprimir_rendimiento_cilindros(df: pd.DataFrame, label_a_cylinder_id: dict):
    """Botellas totales por cilindro usando TODAS las filas de CONSUMPTION
    (era manual + equipo nuevo) -- para saber cuanto rindio cada tanque,
    aunque la era manual no quedo en soda_preparations."""
    resumen = df.groupby("cilindro_id")["consumo"].sum().to_dict()
    print("  Botellas totales por cilindro (para calcular rendimiento/litros):")
    for label, total in sorted(resumen.items()):
        print(f"    {label}: {total} botellas")


def migrate_market(conn, df: pd.DataFrame):
    anios = [c for c in df.columns if re.fullmatch(r"\d{4}", str(c))]
    with conn.cursor() as cur:
        for _, row in df.iterrows():
            for anio in anios:
                if pd.isna(row[anio]):
                    continue
                cur.execute(
                    """
                    INSERT INTO soda_market_benchmarks (segment, brand, year, price)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (segment, brand, year) DO UPDATE SET price = EXCLUDED.price
                    """,
                    (row["Segmento"], row["Marca"], int(anio), float(row[anio])),
                )
    conn.commit()


if __name__ == "__main__":
    conn = get_connection()

    print("Descargando pestañas del sheet...")
    df_consumption = fetch_csv(GID_CONSUMPTION, "Consumption")
    df_refills = fetch_csv(GID_REFILLS, "Refills")
    df_flavors = fetch_csv(GID_FLAVORS, "Flavors")
    df_market = fetch_csv(GID_MARKET, "Market")
    df_flavor_history = fetch_csv(GID_FLAVOR_HISTORY, "Flavor History")

    print("Borrando tablas propias de Soda Stream...")
    reset_tables(conn)

    print("Migrando sabores (FLAVOR_HISTORY + Limon sintetico)...")
    sabor_id_a_flavor_id = migrate_flavors(conn, df_flavor_history, df_flavors)
    print("  mapeo sabor_id -> soda_flavors.id:", sabor_id_a_flavor_id)

    print("Migrando cilindros (REFILLS + fechas inferidas de CONSUMPTION)...")
    label_a_cylinder_id = migrate_cylinders(conn, df_refills, df_consumption)
    print("  mapeo label -> soda_cylinders.id:", label_a_cylinder_id)

    print("Migrando preparaciones...")
    migrate_preparations(conn, df_consumption, label_a_cylinder_id, sabor_id_a_flavor_id)
    imprimir_rendimiento_cilindros(df_consumption, label_a_cylinder_id)

    print("Migrando benchmarks de mercado...")
    migrate_market(conn, df_market)

    conn.close()
    print("\nMigracion completa.")
