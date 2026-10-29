'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, Plus, ScanLine, X } from 'lucide-react'
import { showToast } from '@/components/common/toast-notifications'
import { SimboloCuidado } from '@/components/common/simbolo-cuidado'
import { analizarEtiqueta, guardarCuidado, listarSimbolos, urlMedia } from '@/services/api/prendas'
import type { Fibra, Prenda, Simbolo } from '@/types'

const GRUPOS: Record<Simbolo['grupo'], string> = {
  lavado: 'Lavado', blanqueador: 'Blanqueador', secadora: 'Secadora',
  secado: 'Secado', planchado: 'Planchado', tintoreria: 'Tintorería',
}

const input =
  'w-full rounded-xl border bg-card px-3 py-2.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25'

interface Borrador {
  foto_etiqueta: string | null
  simbolos: string[]
  composicion: Fibra[]
  notas: string
}

export function CuidadoSection({ prenda, onGuardado }: { prenda: Prenda; onGuardado: () => void }) {
  const camara = useRef<HTMLInputElement>(null)
  const [diccionario, setDiccionario] = useState<Simbolo[]>([])
  const [escaneando, setEscaneando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [borrador, setBorrador] = useState<Borrador | null>(null)

  useEffect(() => {
    listarSimbolos().then(setDiccionario).catch(() => {})
  }, [])

  const porCodigo = Object.fromEntries(diccionario.map((s) => [s.codigo, s]))
  const simbolos = prenda.cuidado?.simbolos ?? []
  const composicion = prenda.composicion ?? []

  function editar() {
    setBorrador({
      foto_etiqueta: prenda.foto_etiqueta,
      simbolos: [...simbolos],
      composicion: composicion.length ? composicion.map((f) => ({ ...f })) : [{ fibra: '', porcentaje: null }],
      notas: prenda.cuidado?.notas ?? '',
    })
  }

  async function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setEscaneando(true)
    try {
      const r = await analizarEtiqueta(prenda.id, archivo)
      setBorrador({
        foto_etiqueta: r.foto_etiqueta,
        simbolos: r.cuidado?.simbolos ?? [],
        composicion: r.cuidado?.composicion?.length ? r.cuidado.composicion : [{ fibra: '', porcentaje: null }],
        notas: r.cuidado?.notas ?? '',
      })
      if (!r.cuidado) showToast('No se pudo leer la etiqueta; captúrala a mano', 'warning')
    } catch (err) {
      showToast(`No se pudo analizar: ${(err as Error).message}`, 'error')
    } finally {
      setEscaneando(false)
    }
  }

  async function guardar() {
    if (!borrador) return
    setGuardando(true)
    try {
      await guardarCuidado(prenda.id, {
        ...borrador,
        composicion: borrador.composicion.filter((f) => f.fibra.trim()),
      })
      showToast('Cuidado guardado', 'success')
      setBorrador(null)
      onGuardado()
    } catch (err) {
      showToast(`No se pudo guardar: ${(err as Error).message}`, 'error')
    } finally {
      setGuardando(false)
    }
  }

  const setFibra = (i: number, cambio: Partial<Fibra>) =>
    borrador && setBorrador({ ...borrador, composicion: borrador.composicion.map((f, j) => (j === i ? { ...f, ...cambio } : f)) })

  return (
    <section className="space-y-4 rounded-3xl border bg-card p-5">
      <input ref={camara} type="file" accept="image/*" capture="environment" hidden onChange={onFoto} />
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl">Cuidado</h3>
        {!borrador && !escaneando && (simbolos.length > 0 || composicion.length > 0) && (
          <button onClick={editar} className="text-sm text-muted-foreground underline-offset-4 hover:underline">Editar</button>
        )}
      </div>

      {escaneando && (
        <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-accent" /> Leyendo la etiqueta…
        </div>
      )}

      {/* Vista */}
      {!borrador && !escaneando && (
        <>
          {composicion.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {composicion.map((f) => (
                <span key={f.fibra} className="rounded-full bg-secondary px-3 py-1 text-sm first-letter:uppercase">
                  {f.porcentaje != null ? `${f.porcentaje}% ` : ''}{f.fibra}
                </span>
              ))}
            </div>
          )}
          {simbolos.length > 0 && (
            <ul className="space-y-2">
              {simbolos.map((c) => porCodigo[c] && (
                <li key={c} className="flex items-center gap-3 text-sm">
                  <SimboloCuidado codigo={c} grupo={porCodigo[c].grupo} className="h-7 w-7 shrink-0 text-accent" />
                  {porCodigo[c].descripcion}
                </li>
              ))}
            </ul>
          )}
          {prenda.cuidado?.notas && <p className="text-sm text-muted-foreground">{prenda.cuidado.notas}</p>}
          {simbolos.length === 0 && composicion.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Tómale foto a la etiqueta interior y Stylo guarda la tela y cómo lavarla.
            </p>
          )}
          <button
            onClick={() => camara.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-full border bg-background py-3 text-sm font-medium active:scale-[0.98]"
          >
            <ScanLine className="h-4 w-4" /> {simbolos.length ? 'Volver a escanear etiqueta' : 'Escanear etiqueta'}
          </button>
        </>
      )}

      {/* Revisión / edición */}
      {borrador && (
        <div className="space-y-5">
          {borrador.foto_etiqueta && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={urlMedia(borrador.foto_etiqueta)} alt="Etiqueta" className="max-h-48 w-full rounded-2xl object-contain bg-secondary" />
          )}

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tela</span>
            {borrador.composicion.map((f, i) => (
              <div key={i} className="flex gap-2">
                <input className={input} placeholder="ej. algodón" value={f.fibra} onChange={(e) => setFibra(i, { fibra: e.target.value })} />
                <input
                  className={`${input} w-20`} inputMode="numeric" placeholder="%"
                  value={f.porcentaje ?? ''}
                  onChange={(e) => setFibra(i, { porcentaje: e.target.value ? Number(e.target.value.replace(/\D/g, '')) : null })}
                />
                <button
                  onClick={() => setBorrador({ ...borrador, composicion: borrador.composicion.filter((_, j) => j !== i) })}
                  className="px-1 text-muted-foreground" aria-label="Quitar fibra"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => setBorrador({ ...borrador, composicion: [...borrador.composicion, { fibra: '', porcentaje: null }] })}
              className="flex items-center gap-1 text-sm text-muted-foreground"
            >
              <Plus className="h-4 w-4" /> Agregar fibra
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Símbolos</span>
            <ul className="space-y-2">
              {borrador.simbolos.map((c) => porCodigo[c] && (
                <li key={c} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-sm">
                  <SimboloCuidado codigo={c} grupo={porCodigo[c].grupo} className="h-6 w-6 shrink-0 text-accent" />
                  <span className="flex-1">{porCodigo[c].descripcion}</span>
                  <button
                    onClick={() => setBorrador({ ...borrador, simbolos: borrador.simbolos.filter((x) => x !== c) })}
                    className="text-muted-foreground" aria-label="Quitar símbolo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
            <select
              className={input}
              value=""
              onChange={(e) => {
                const c = e.target.value
                if (!c) return
                // un símbolo por grupo: el nuevo reemplaza al anterior del mismo grupo
                const grupo = porCodigo[c].grupo
                setBorrador({ ...borrador, simbolos: [...borrador.simbolos.filter((x) => porCodigo[x]?.grupo !== grupo), c] })
              }}
            >
              <option value="">+ Agregar o cambiar símbolo…</option>
              {(Object.keys(GRUPOS) as Simbolo['grupo'][]).map((g) => (
                <optgroup key={g} label={GRUPOS[g]}>
                  {diccionario.filter((s) => s.grupo === g).map((s) => (
                    <option key={s.codigo} value={s.codigo}>{s.descripcion}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notas</span>
            <textarea className={input} rows={2} value={borrador.notas} onChange={(e) => setBorrador({ ...borrador, notas: e.target.value })} />
          </label>

          <div className="flex gap-2">
            <button onClick={() => setBorrador(null)} className="flex-1 rounded-full border py-3 text-sm">Cancelar</button>
            <button
              onClick={guardar} disabled={guardando}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {guardando && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
