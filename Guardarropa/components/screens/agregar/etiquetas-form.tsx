'use client'

import { useEffect, useState } from 'react'
import { AJUSTES, CATEGORIAS, OCASIONES, TEMPORADAS } from '@/lib/categorias'
import { obtenerTallas, type EtiquetasPrenda } from '@/services/api/prendas'
import { TallaInput, usaMedidas } from '@/components/common/talla-input'
import type { Categoria, ResumenTallas } from '@/types'

const input =
  'w-full rounded-xl border bg-card px-4 py-3 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25'

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

function Chips({ opciones, valor, onChange }: { opciones: string[]; valor: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map((o) => {
        const activo = valor.includes(o)
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(activo ? valor.filter((x) => x !== o) : [...valor, o])}
            className={`rounded-full border px-4 py-2 text-sm first-letter:uppercase transition ${
              activo ? 'border-primary bg-primary text-primary-foreground' : 'bg-card text-muted-foreground'
            }`}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}

const NIVELES = ['Muy casual', 'Casual', 'Smart casual', 'Formal', 'Muy formal']

export function EtiquetasForm({ valor, onChange }: { valor: EtiquetasPrenda; onChange: (v: EtiquetasPrenda) => void }) {
  const set = <K extends keyof EtiquetasPrenda>(k: K, v: EtiquetasPrenda[K]) => onChange({ ...valor, [k]: v })
  const formalidad = valor.formalidad ?? 3
  // Para autocompletar con lo que ya usas (así "Zara" no queda como "zara" y "ZARA")
  const [resumen, setResumen] = useState<ResumenTallas | null>(null)
  useEffect(() => {
    obtenerTallas().then(setResumen).catch(() => {})
  }, [])
  const tallasCategoria = resumen?.categorias.find((c) => c.categoria === valor.categoria)?.tallas.map((t) => t.valor) ?? []

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Categoría</span>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIAS.map((c) => (
            <button
              key={c.valor}
              type="button"
              onClick={() => set('categoria', c.valor)}
              className={`rounded-xl border px-2 py-2.5 text-sm transition ${
                valor.categoria === c.valor ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <Campo label="Tipo">
        <input className={input} placeholder="ej. camisa oxford" value={valor.subcategoria ?? ''} onChange={(e) => set('subcategoria', e.target.value)} />
      </Campo>
      <Campo label="Colores">
        <input
          className={input}
          placeholder="separados por coma"
          value={valor.colores.join(', ')}
          onChange={(e) => set('colores', e.target.value.split(',').map((c) => c.trim()).filter(Boolean))}
        />
      </Campo>
      <div className="grid grid-cols-2 gap-3">
        <Campo label="Estampado">
          <input className={input} value={valor.estampado ?? ''} onChange={(e) => set('estampado', e.target.value)} />
        </Campo>
        <Campo label="Material">
          <input className={input} value={valor.material ?? ''} onChange={(e) => set('material', e.target.value)} />
        </Campo>
      </div>
      <Campo label="Marca">
        <input
          className={input} list="marcas-conocidas" placeholder="ej. Zara" autoCapitalize="words"
          value={valor.marca ?? ''} onChange={(e) => set('marca', e.target.value)}
        />
        <datalist id="marcas-conocidas">
          {resumen?.marcas.map((m) => <option key={m.marca} value={m.marca} />)}
        </datalist>
      </Campo>
      <TallaInput
        // al cambiar el tipo (ej. de "playera" a "camisa de vestir") se recalcula el modo
        key={`${valor.categoria}-${usaMedidas(valor.categoria as Categoria, valor.subcategoria, valor.formalidad)}`}
        categoria={valor.categoria as Categoria} subcategoria={valor.subcategoria} formalidad={valor.formalidad}
        valor={valor.talla}
        onChange={(v) => set('talla', v)} sugerencias={tallasCategoria}
      />
      <div className="space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cómo te queda</span>
        <div className="grid grid-cols-4 gap-2">
          {AJUSTES.map((a) => (
            <button
              key={a.valor}
              type="button"
              onClick={() => set('ajuste', valor.ajuste === a.valor ? null : a.valor)}
              className={`rounded-xl border px-1 py-2.5 text-sm transition ${
                valor.ajuste === a.valor ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
          <span>Formalidad</span>
          <span className="normal-case tracking-normal text-foreground">{NIVELES[formalidad - 1]}</span>
        </div>
        <input
          type="range" min={1} max={5} className="w-full accent-[var(--accent)]"
          value={formalidad}
          onChange={(e) => set('formalidad', Number(e.target.value))}
        />
      </div>
      <div className="space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Clima</span>
        <Chips opciones={TEMPORADAS} valor={valor.temporada} onChange={(v) => set('temporada', v)} />
      </div>
      <div className="space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Ocasiones</span>
        <Chips opciones={OCASIONES} valor={valor.ocasiones} onChange={(v) => set('ocasiones', v)} />
      </div>
      <Campo label="Descripción">
        <textarea className={input} rows={3} value={valor.descripcion} onChange={(e) => set('descripcion', e.target.value)} />
      </Campo>
    </div>
  )
}
