'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, BookOpen, Check, Loader2, Plus, ScanLine, Shirt, X } from 'lucide-react'
import { showToast } from '@/components/common/toast-notifications'
import { SimboloCuidado } from '@/components/common/simbolo-cuidado'
import { analizarEtiqueta, descartarTemporal, estimarCuidado, guardarCuidado, listarSimbolos, obtenerGuia, urlMedia } from '@/services/api/prendas'
import type { Fibra, GuiaCuidado, OrigenCuidado, Prenda, Simbolo } from '@/types'

const GRUPOS: Record<Simbolo['grupo'], string> = {
  lavado: 'Lavado', blanqueador: 'Blanqueador', secadora: 'Secadora',
  secado: 'Secado', planchado: 'Planchado', tintoreria: 'Tintorería',
}
// Estos se suman a los de su grupo en vez de reemplazarlos
const SUELTOS = new Set(['no_exprimir', 'no_vapor'])
const NO_SE = 'desconocida'

const input =
  'w-full rounded-xl border bg-card px-3 py-2.5 text-[15px] outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25'

interface Borrador {
  foto_etiqueta: string | null
  simbolos: string[]
  composicion: Fibra[]
  notas: string
  origen: OrigenCuidado | null
  /** La IA no pudo leer la foto, o leyó la tela pero no los símbolos */
  aviso: 'sin_lectura' | 'sin_simbolos' | null
  telasEstimadas: string[]
  marca: string
  talla: string
}

export function CuidadoSection({ prenda, onGuardado }: { prenda: Prenda; onGuardado: () => void }) {
  const camara = useRef<HTMLInputElement>(null)
  const notasRef = useRef<HTMLTextAreaElement>(null)
  const [diccionario, setDiccionario] = useState<Simbolo[]>([])
  const [guia, setGuia] = useState<GuiaCuidado | null>(null)
  const [escaneando, setEscaneando] = useState(false)
  const [estimando, setEstimando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [borrador, setBorrador] = useState<Borrador | null>(null)
  const [eligiendoTela, setEligiendoTela] = useState(false)
  const [telasSel, setTelasSel] = useState<string[]>([])
  const [verSimbolos, setVerSimbolos] = useState(false)

  useEffect(() => {
    listarSimbolos().then(setDiccionario).catch(() => {})
    obtenerGuia().then(setGuia).catch(() => {})
  }, [])

  const porCodigo = Object.fromEntries(diccionario.map((s) => [s.codigo, s]))
  const simbolos = prenda.cuidado?.simbolos ?? []
  const composicion = prenda.composicion ?? []
  const vacio: Borrador = {
    foto_etiqueta: prenda.foto_etiqueta, simbolos: [], composicion: [{ fibra: '', porcentaje: null }],
    notas: '', origen: null, aviso: null, telasEstimadas: [],
    marca: prenda.marca ?? '', talla: prenda.talla ?? '',
  }

  function editar() {
    setBorrador({
      ...vacio,
      simbolos: [...simbolos],
      composicion: composicion.length ? composicion.map((f) => ({ ...f })) : vacio.composicion,
      notas: prenda.cuidado?.notas ?? '',
      origen: prenda.cuidado?.origen ?? null,
    })
  }

  async function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setEscaneando(true)
    setEligiendoTela(false)
    try {
      const r = await analizarEtiqueta(prenda.id, archivo)
      descartarTemporal([borrador?.foto_etiqueta]) // si era otra foto sin guardar, ya no sirve
      const c = r.cuidado
      setBorrador({
        ...vacio,
        foto_etiqueta: r.foto_etiqueta,
        simbolos: c?.simbolos ?? [],
        composicion: c?.composicion?.length ? c.composicion : vacio.composicion,
        notas: c?.notas ?? '',
        origen: 'etiqueta',
        // lo que diga la etiqueta gana; si no lo trae, se queda lo que ya tenía la prenda
        marca: c?.marca || vacio.marca,
        talla: c?.talla || vacio.talla,
        aviso: c?.simbolos?.length ? null : c?.composicion?.some((f) => f.fibra.trim()) ? 'sin_simbolos' : 'sin_lectura',
      })
    } catch (err) {
      showToast(`No se pudo analizar: ${(err as Error).message}`, 'error')
    } finally {
      setEscaneando(false)
    }
  }

  /** Cuidado típico según la tela. `fibras` son nombres como vienen (de la etiqueta o de la guía). */
  async function aplicarTelas(fibras: string[], composicionNueva?: Fibra[]) {
    setEstimando(true)
    try {
      const r = await estimarCuidado(fibras)
      setBorrador((b) => {
        const base = b ?? vacio
        const tieneTela = base.composicion.some((f) => f.fibra.trim())
        return {
          ...base,
          simbolos: r.simbolos,
          composicion: tieneTela || !composicionNueva?.length ? base.composicion : composicionNueva,
          origen: 'tela', aviso: null, telasEstimadas: r.telas,
        }
      })
      if (r.no_reconocidas.length) showToast(`No reconozco: ${r.no_reconocidas.join(', ')}`, 'warning')
      setEligiendoTela(false)
      setTelasSel([])
    } catch {
      showToast('No reconozco esa tela; elígela de la lista', 'warning')
      setEligiendoTela(true)
    } finally {
      setEstimando(false)
    }
  }

  function usarTelaDelBorrador() {
    const fibras = (borrador?.composicion ?? []).map((f) => f.fibra.trim()).filter(Boolean)
    if (fibras.length) aplicarTelas(fibras)
    else setEligiendoTela(true)
  }

  function confirmarTelas() {
    if (!guia) return
    const elegidas = guia.telas.filter((t) => telasSel.includes(t.id))
    const composicionNueva = elegidas.filter((t) => t.id !== NO_SE).map((t) => ({ fibra: t.nombre.split(' /')[0].toLowerCase(), porcentaje: null }))
    aplicarTelas(elegidas.map((t) => t.id), composicionNueva)
  }

  function toggleSimbolo(c: string) {
    if (!borrador) return
    const actuales = borrador.simbolos
    let nuevos: string[]
    if (actuales.includes(c)) nuevos = actuales.filter((x) => x !== c)
    else if (SUELTOS.has(c)) nuevos = [...actuales, c]
    else {
      // un símbolo por grupo: el nuevo reemplaza al anterior del mismo grupo
      const grupo = porCodigo[c].grupo
      nuevos = [...actuales.filter((x) => SUELTOS.has(x) || porCodigo[x]?.grupo !== grupo), c]
    }
    setBorrador({ ...borrador, simbolos: nuevos, origen: borrador.origen ?? 'manual', aviso: null })
  }

  async function guardar() {
    if (!borrador) return
    setGuardando(true)
    try {
      await guardarCuidado(prenda.id, {
        foto_etiqueta: borrador.foto_etiqueta,
        simbolos: borrador.simbolos,
        composicion: borrador.composicion.filter((f) => f.fibra.trim()),
        notas: borrador.notas,
        origen: borrador.simbolos.length ? borrador.origen ?? 'manual' : null,
        marca: borrador.marca,
        talla: borrador.talla,
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

  const fibrasBorrador = (borrador?.composicion ?? []).map((f) => f.fibra.trim()).filter(Boolean)

  return (
    <section className="space-y-4 rounded-3xl border bg-card p-5">
      <input ref={camara} type="file" accept="image/*" capture="environment" hidden onChange={onFoto} />
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl">Cuidado</h3>
        {!borrador && !escaneando && !eligiendoTela && (simbolos.length > 0 || composicion.length > 0) && (
          <button onClick={editar} className="text-sm text-muted-foreground underline-offset-4 hover:underline">Editar</button>
        )}
      </div>

      {escaneando && (
        <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin text-accent" /> Leyendo la etiqueta…
        </div>
      )}

      {/* Elegir tela: sin etiqueta, ilegible o la IA no la entendió */}
      {eligiendoTela && !escaneando && (
        <div className="space-y-4">
          <div>
            <p className="font-medium">¿De qué tela es?</p>
            <p className="text-sm text-muted-foreground">
              Elige una o varias. Stylo usa el cuidado típico de esa tela; si es mezcla, gana el más delicado.
            </p>
          </div>
          {!guia ? (
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {guia.telas.map((t) => {
                const sel = telasSel.includes(t.id)
                return (
                  <button
                    key={t.id}
                    onClick={() => setTelasSel((s) => (sel ? s.filter((x) => x !== t.id) : [...s, t.id]))}
                    className={`flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition ${
                      sel ? 'border-primary bg-primary text-primary-foreground' : 'bg-background'
                    } ${t.id === NO_SE ? 'border-dashed' : ''}`}
                  >
                    {sel && <Check className="h-3.5 w-3.5" />} {t.nombre}
                  </button>
                )
              })}
            </div>
          )}
          <Link href="/lavanderia/guia?tab=telas" className="flex items-center gap-1.5 text-sm text-muted-foreground underline-offset-4 hover:underline">
            <BookOpen className="h-4 w-4" /> ¿Cómo distingo las telas? Ver la guía
          </Link>
          <div className="flex gap-2">
            <button onClick={() => { setEligiendoTela(false); setTelasSel([]) }} className="flex-1 rounded-full border py-3 text-sm">Cancelar</button>
            <button
              onClick={confirmarTelas} disabled={!telasSel.length || estimando}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {estimando && <Loader2 className="h-4 w-4 animate-spin" />} Usar ese cuidado
            </button>
          </div>
        </div>
      )}

      {/* Vista */}
      {!borrador && !escaneando && !eligiendoTela && (
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
          {prenda.cuidado?.origen === 'tela' && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shirt className="h-3.5 w-3.5" /> Cuidado típico de la tela, no de la etiqueta.
            </p>
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
          {simbolos.length === 0 && (
            <button onClick={() => setEligiendoTela(true)} className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline">
              No tiene etiqueta o no se lee: elegir la tela
            </button>
          )}
        </>
      )}

      {/* Revisión / edición */}
      {borrador && !eligiendoTela && !escaneando && (
        <div className="space-y-5">
          {borrador.foto_etiqueta && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={urlMedia(borrador.foto_etiqueta)} alt="Etiqueta" className="max-h-48 w-full rounded-2xl object-contain bg-secondary" />
          )}

          {borrador.aviso && (
            <div className="space-y-3 rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm">
              <p className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {borrador.aviso === 'sin_lectura'
                  ? 'No pude leer la etiqueta. Prueba otra foto más cerca y con luz, o usa el cuidado típico de la tela.'
                  : `Leí la tela${fibrasBorrador.length ? ` (${fibrasBorrador.join(', ')})` : ''} pero no los símbolos.`}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={usarTelaDelBorrador} disabled={estimando}
                  className="flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  {estimando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shirt className="h-3.5 w-3.5" />}
                  {fibrasBorrador.length ? 'Usar el cuidado de esa tela' : 'Elegir la tela'}
                </button>
                <button onClick={() => camara.current?.click()} className="flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-2 text-sm">
                  <ScanLine className="h-3.5 w-3.5" /> Otra foto
                </button>
              </div>
            </div>
          )}

          {borrador.origen === 'tela' && borrador.telasEstimadas.length > 0 && (
            <p className="flex gap-2 rounded-2xl bg-secondary p-3 text-sm text-muted-foreground">
              <Shirt className="mt-0.5 h-4 w-4 shrink-0" />
              Cuidado típico de {borrador.telasEstimadas.join(' + ')}. Ajústalo si sabes algo más.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Marca</span>
              <input className={input} value={borrador.marca} placeholder="—" onChange={(e) => setBorrador({ ...borrador, marca: e.target.value })} />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Talla</span>
              <input className={input} value={borrador.talla} placeholder="—" onChange={(e) => setBorrador({ ...borrador, talla: e.target.value })} />
            </label>
          </div>

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
            {borrador.simbolos.length === 0 && !borrador.aviso && (
              <p className="text-sm text-muted-foreground">Sin símbolos todavía.</p>
            )}
            <ul className="space-y-2">
              {borrador.simbolos.map((c) => porCodigo[c] && (
                <li key={c} className="flex items-center gap-3 rounded-xl bg-secondary px-3 py-2 text-sm">
                  <SimboloCuidado codigo={c} grupo={porCodigo[c].grupo} className="h-6 w-6 shrink-0 text-accent" />
                  <span className="flex-1">{porCodigo[c].descripcion}</span>
                  <button onClick={() => toggleSimbolo(c)} className="text-muted-foreground" aria-label="Quitar símbolo">
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>

            <button
              onClick={() => setVerSimbolos((v) => !v)}
              className="flex w-full items-center justify-center gap-1.5 rounded-full border bg-background py-2.5 text-sm"
            >
              {verSimbolos ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {verSimbolos ? 'Cerrar símbolos' : 'Agregar o corregir símbolos'}
            </button>

            {verSimbolos && (
              <div className="space-y-4 rounded-2xl bg-secondary/60 p-3">
                <p className="text-xs text-muted-foreground">Toca el que se parezca al de tu etiqueta. Uno por grupo: el nuevo reemplaza al anterior.</p>
                {(Object.keys(GRUPOS) as Simbolo['grupo'][]).map((g) => (
                  <div key={g} className="space-y-1.5">
                    <span className="text-xs font-medium text-muted-foreground">{GRUPOS[g]}</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {diccionario.filter((s) => s.grupo === g).map((s) => {
                        const sel = borrador.simbolos.includes(s.codigo)
                        return (
                          <button
                            key={s.codigo} onClick={() => toggleSimbolo(s.codigo)}
                            className={`flex items-center gap-2 rounded-xl border px-2 py-1.5 text-left text-xs leading-tight transition ${
                              sel ? 'border-primary bg-primary text-primary-foreground' : 'bg-card'
                            }`}
                          >
                            <SimboloCuidado codigo={s.codigo} grupo={s.grupo} className="h-7 w-7 shrink-0" />
                            {s.descripcion}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  ¿No está tu símbolo?{' '}
                  <button onClick={() => notasRef.current?.focus()} className="text-accent underline underline-offset-4">Descríbelo en notas</button>
                  {' '}o{' '}
                  <button onClick={usarTelaDelBorrador} className="text-accent underline underline-offset-4">usa el cuidado de la tela</button>.
                </p>
              </div>
            )}
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Notas</span>
            <textarea
              ref={notasRef} className={input} rows={2} value={borrador.notas}
              placeholder="ej. símbolo de un cuadro con tres puntos; lavar al revés"
              onChange={(e) => setBorrador({ ...borrador, notas: e.target.value })}
            />
          </label>

          <div className="flex gap-2">
            <button
              onClick={() => { descartarTemporal([borrador.foto_etiqueta]); setBorrador(null); setVerSimbolos(false) }}
              className="flex-1 rounded-full border py-3 text-sm"
            >
              Cancelar
            </button>
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
