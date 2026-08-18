'use client'

import { useEffect, useState } from 'react'
import { FileText, Trash2, Eye, Loader2, Check, X, UserCheck, Calendar } from 'lucide-react'
import { DOC_TYPES, TIPOS_FECHA, TipoFecha, PersonaPendiente, FechaPendiente } from '@/types'
import { getPendientes, confirmarPendiente, descartarPendiente, urlVerPendiente } from '@/services/api/pendientes'
import {
  getPersonasPendientes,
  confirmarPersonaPendiente,
  rechazarPersonaPendiente,
  getFechasPendientes,
  confirmarFechaPendiente,
  rechazarFechaPendiente,
} from '@/services/api/personas'
import { showToast } from '@/components/common/toast-notifications'

const DOC_TYPE_LABELS: Record<string, string> = {
  trabajo: 'Trabajo',
  escuela: 'Escuela',
  receta: 'Receta',
  manual: 'Manual',
  diario: 'Diario',
  concierto: 'Concierto',
  viaje: 'Viaje',
  otro: 'Otro',
}

const TIPO_FECHA_LABELS: Record<TipoFecha, string> = {
  cumpleanos: 'Cumpleaños',
  aniversario: 'Aniversario',
  otra: 'Otra fecha importante',
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

type ItemPendiente =
  | { tipo: 'documento'; key: string; nombre: string }
  | { tipo: 'persona'; key: string; data: PersonaPendiente }
  | { tipo: 'fecha'; key: string; data: FechaPendiente }

export function PendientesScreen() {
  const [documentos, setDocumentos] = useState<string[]>([])
  const [personas, setPersonas] = useState<PersonaPendiente[]>([])
  const [fechas, setFechas] = useState<FechaPendiente[]>([])
  const [activo, setActivo] = useState<ItemPendiente | null>(null)
  const [procesando, setProcesando] = useState(false)

  // form state: documento
  const [docType, setDocType] = useState('otro')
  const [comentario, setComentario] = useState('')
  const [venue, setVenue] = useState('')
  const [artista, setArtista] = useState('')
  const [destino, setDestino] = useState('')

  // form state: persona
  const [relacion, setRelacion] = useState('')

  // form state: fecha
  const [tipoFecha, setTipoFecha] = useState<TipoFecha>('cumpleanos')

  function cargarTodo() {
    getPendientes().catch(() => []).then(setDocumentos)
    getPersonasPendientes().catch(() => []).then(setPersonas)
    getFechasPendientes().catch(() => []).then(setFechas)
  }

  useEffect(() => {
    cargarTodo()
  }, [])

  function limpiarForm() {
    setActivo(null)
    setDocType('otro')
    setComentario('')
    setVenue('')
    setArtista('')
    setDestino('')
    setRelacion('')
    setTipoFecha('cumpleanos')
  }

  function seleccionar(item: ItemPendiente) {
    limpiarForm()
    setActivo(item)
  }

  async function handleDescartarDocumento(nombre: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`¿Quitar "${nombre}" de pendientes sin indexarlo?`)) return
    try {
      await descartarPendiente(nombre)
      if (activo?.tipo === 'documento' && activo.nombre === nombre) limpiarForm()
      cargarTodo()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo descartar', 'error')
    }
  }

  async function handleConfirmarDocumento(e: React.FormEvent) {
    e.preventDefault()
    if (!activo || activo.tipo !== 'documento') return
    setProcesando(true)
    try {
      const result = await confirmarPendiente({
        archivoNombre: activo.nombre,
        docType,
        comentario: comentario || undefined,
        venue: docType === 'concierto' ? venue || undefined : undefined,
        artista: docType === 'concierto' ? artista || undefined : undefined,
        destino: docType === 'viaje' ? destino || undefined : undefined,
      })
      showToast(`✓ Indexado: ${result.chunks_indexados ?? 0} fragmentos`, 'success')
      limpiarForm()
      cargarTodo()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo indexar el archivo', 'error')
    } finally {
      setProcesando(false)
    }
  }

  async function handleConfirmarPersona(e: React.FormEvent) {
    e.preventDefault()
    if (!activo || activo.tipo !== 'persona') return
    setProcesando(true)
    try {
      await confirmarPersonaPendiente(activo.data.id, relacion || undefined)
      showToast('✓ Confirmado', 'success')
      limpiarForm()
      cargarTodo()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo confirmar', 'error')
    } finally {
      setProcesando(false)
    }
  }

  async function handleRechazarPersona() {
    if (!activo || activo.tipo !== 'persona') return
    setProcesando(true)
    try {
      await rechazarPersonaPendiente(activo.data.id)
      showToast('Descartado', 'info')
      limpiarForm()
      cargarTodo()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo descartar', 'error')
    } finally {
      setProcesando(false)
    }
  }

  async function handleConfirmarFecha(e: React.FormEvent) {
    e.preventDefault()
    if (!activo || activo.tipo !== 'fecha') return
    setProcesando(true)
    try {
      await confirmarFechaPendiente(activo.data.id, tipoFecha)
      showToast('✓ Fecha guardada', 'success')
      limpiarForm()
      cargarTodo()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo confirmar', 'error')
    } finally {
      setProcesando(false)
    }
  }

  async function handleRechazarFecha() {
    if (!activo || activo.tipo !== 'fecha') return
    setProcesando(true)
    try {
      await rechazarFechaPendiente(activo.data.id)
      showToast('Descartado', 'info')
      limpiarForm()
      cargarTodo()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo descartar', 'error')
    } finally {
      setProcesando(false)
    }
  }

  const items: ItemPendiente[] = [
    ...documentos.map((nombre): ItemPendiente => ({ tipo: 'documento', key: `doc-${nombre}`, nombre })),
    ...personas.map((p): ItemPendiente => ({ tipo: 'persona', key: `per-${p.id}`, data: p })),
    ...fechas.map((f): ItemPendiente => ({ tipo: 'fecha', key: `fec-${f.id}`, data: f })),
  ]

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-5">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center mt-8">
          No hay nada esperando confirmación. Documentos nuevos, nombres ambiguos y fechas detectadas en tus notas
          aparecerán aquí juntos.
        </p>
      ) : (
        <div className="rounded-lg border bg-card p-3">
          <p className="text-sm font-medium mb-2">
            {items.length} pendiente{items.length > 1 ? 's' : ''} por resolver
          </p>
          <div className="flex flex-col gap-2">
            {items.map((item) => {
              const isActivo =
                activo?.tipo === item.tipo &&
                ((item.tipo === 'documento' && activo.tipo === 'documento' && activo.nombre === item.nombre) ||
                  (item.tipo === 'persona' && activo.tipo === 'persona' && activo.data.id === item.data.id) ||
                  (item.tipo === 'fecha' && activo.tipo === 'fecha' && activo.data.id === item.data.id))

              return (
                <div key={item.key} className={`flex items-center gap-2 rounded-md border ${isActivo ? 'border-primary bg-accent' : ''}`}>
                  <button
                    type="button"
                    onClick={() => seleccionar(item)}
                    className="flex-1 flex items-center gap-2 text-left text-sm px-3 py-2 min-w-0"
                  >
                    {item.tipo === 'documento' && (
                      <>
                        <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{item.nombre}</span>
                      </>
                    )}
                    {item.tipo === 'persona' && (
                      <>
                        <UserCheck className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">
                          &quot;{item.data.nombre_mencionado}&quot; → ¿{item.data.candidato_nombre}?
                        </span>
                      </>
                    )}
                    {item.tipo === 'fecha' && (
                      <>
                        <Calendar className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">
                          {item.data.persona} — {item.data.dia} de {MESES[item.data.mes - 1]}
                        </span>
                      </>
                    )}
                  </button>
                  {item.tipo === 'documento' && (
                    <>
                      <button
                        type="button"
                        onClick={() => window.open(urlVerPendiente(item.nombre), '_blank')}
                        className="px-2 py-2 text-muted-foreground hover:text-primary shrink-0"
                        aria-label="Ver archivo"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDescartarDocumento(item.nombre, e)}
                        className="px-2 py-2 text-muted-foreground hover:text-red-500 shrink-0"
                        aria-label="Descartar sin indexar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Formulario: documento */}
      {activo?.tipo === 'documento' && (
        <form onSubmit={handleConfirmarDocumento} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Archivo</label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{activo.nombre}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {DOC_TYPES.map((dt) => (
                <option key={dt} value={dt}>
                  {DOC_TYPE_LABELS[dt] ?? dt}
                </option>
              ))}
            </select>
          </div>

          {docType === 'concierto' && (
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium">Venue</label>
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="ej. Lunario"
                  className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium">Artista</label>
                <input
                  value={artista}
                  onChange={(e) => setArtista(e.target.value)}
                  placeholder="ej. Cafe Quijano"
                  className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          )}

          {docType === 'viaje' && (
            <div>
              <label className="text-sm font-medium">Destino</label>
              <input
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="ej. La Redonda"
                className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium">Comentario (opcional)</label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="ej. la receta que me pasaron en línea"
              rows={2}
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={procesando}
            className="rounded-full bg-primary text-primary-foreground py-2.5 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {procesando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Indexando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" /> Confirmar e indexar
              </>
            )}
          </button>
        </form>
      )}

      {/* Formulario: persona ambigua */}
      {activo?.tipo === 'persona' && (
        <form onSubmit={handleConfirmarPersona} className="flex flex-col gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm">
              Mencionaste a <span className="font-semibold">&quot;{activo.data.nombre_mencionado}&quot;</span> — ¿es{' '}
              <span className="font-semibold">{activo.data.candidato_nombre}</span>
              {activo.data.candidato_grupo_social && ` (grupo ${activo.data.candidato_grupo_social})`}?
            </p>
            <p className="text-xs text-muted-foreground truncate mt-1">Nota: {activo.data.nota_source}</p>
          </div>

          <div>
            <label className="text-sm font-medium">Relación con esta persona (opcional)</label>
            <input
              value={relacion}
              onChange={(e) => setRelacion(e.target.value)}
              placeholder="ej. amigo, prima, tía"
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={procesando}
              className="flex-1 rounded-full bg-primary text-primary-foreground py-2 text-sm flex items-center justify-center gap-1 disabled:opacity-40"
            >
              <Check className="w-4 h-4" /> Sí, es la misma
            </button>
            <button
              type="button"
              onClick={handleRechazarPersona}
              disabled={procesando}
              className="flex-1 rounded-full border py-2 text-sm flex items-center justify-center gap-1 disabled:opacity-40"
            >
              <X className="w-4 h-4" /> No, es otra
            </button>
          </div>
        </form>
      )}

      {/* Formulario: fecha detectada */}
      {activo?.tipo === 'fecha' && (
        <form onSubmit={handleConfirmarFecha} className="flex flex-col gap-4">
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm">
              Detecté una fecha para <span className="font-semibold">{activo.data.persona}</span>:{' '}
              <span className="font-semibold">
                {activo.data.dia} de {MESES[activo.data.mes - 1]}
                {activo.data.ano ? ` de ${activo.data.ano}` : ''}
              </span>
            </p>
            {activo.data.contexto && (
              <p className="text-xs text-muted-foreground mt-1">
                Certeza detectada: {activo.data.contexto === 'alta' ? 'alta (afirmado como hecho)' : 'baja (mencionado en contexto de festejo)'}
              </p>
            )}
            <p className="text-xs text-muted-foreground truncate mt-1">Nota: {activo.data.nota_source}</p>
          </div>

          <div>
            <label className="text-sm font-medium">¿Qué tipo de fecha es?</label>
            <select
              value={tipoFecha}
              onChange={(e) => setTipoFecha(e.target.value as TipoFecha)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              {TIPOS_FECHA.map((t) => (
                <option key={t} value={t}>
                  {TIPO_FECHA_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={procesando}
              className="flex-1 rounded-full bg-primary text-primary-foreground py-2 text-sm flex items-center justify-center gap-1 disabled:opacity-40"
            >
              <Check className="w-4 h-4" /> Guardar
            </button>
            <button
              type="button"
              onClick={handleRechazarFecha}
              disabled={procesando}
              className="flex-1 rounded-full border py-2 text-sm flex items-center justify-center gap-1 disabled:opacity-40"
            >
              <X className="w-4 h-4" /> Descartar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
