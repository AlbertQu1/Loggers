'use client'

import { useEffect, useState } from 'react'
import { FileText, Trash2, Eye, Loader2, Check } from 'lucide-react'
import { DOC_TYPES } from '@/types'
import { getPendientes, confirmarPendiente, descartarPendiente, urlVerPendiente } from '@/services/api/pendientes'
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

export function PendientesScreen() {
  const [pendientes, setPendientes] = useState<string[]>([])
  const [activo, setActivo] = useState<string | null>(null)
  const [docType, setDocType] = useState('otro')
  const [comentario, setComentario] = useState('')
  const [venue, setVenue] = useState('')
  const [artista, setArtista] = useState('')
  const [destino, setDestino] = useState('')
  const [confirmando, setConfirmando] = useState(false)

  function cargarPendientes() {
    getPendientes().catch(() => []).then(setPendientes)
  }

  useEffect(() => {
    cargarPendientes()
  }, [])

  function limpiarForm() {
    setActivo(null)
    setDocType('otro')
    setComentario('')
    setVenue('')
    setArtista('')
    setDestino('')
  }

  async function handleDescartar(nombre: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`¿Quitar "${nombre}" de pendientes sin indexarlo?`)) return
    try {
      await descartarPendiente(nombre)
      if (activo === nombre) limpiarForm()
      cargarPendientes()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo descartar', 'error')
    }
  }

  async function handleConfirmar(e: React.FormEvent) {
    e.preventDefault()
    if (!activo) return

    setConfirmando(true)
    try {
      const result = await confirmarPendiente({
        archivoNombre: activo,
        docType,
        comentario: comentario || undefined,
        venue: docType === 'concierto' ? venue || undefined : undefined,
        artista: docType === 'concierto' ? artista || undefined : undefined,
        destino: docType === 'viaje' ? destino || undefined : undefined,
      })
      showToast(`✓ Indexado: ${result.chunks_indexados ?? 0} fragmentos`, 'success')
      limpiarForm()
      cargarPendientes()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo indexar el archivo', 'error')
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-5">
      {pendientes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center mt-8">
          No hay archivos esperando clasificación. Sube algo a la carpeta &quot;Wiki Inbox&quot; de Drive y aparecerá aquí.
        </p>
      ) : (
        <div className="rounded-lg border bg-card p-3">
          <p className="text-sm font-medium mb-2">
            {pendientes.length} archivo{pendientes.length > 1 ? 's' : ''} esperando clasificación
          </p>
          <div className="flex flex-col gap-2">
            {pendientes.map((nombre) => (
              <div
                key={nombre}
                className={`flex items-center gap-2 rounded-md border ${
                  activo === nombre ? 'border-primary bg-accent' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    limpiarForm()
                    setActivo(nombre)
                  }}
                  className="flex-1 flex items-center gap-2 text-left text-sm px-3 py-2 min-w-0"
                >
                  <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{nombre}</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.open(urlVerPendiente(nombre), '_blank')}
                  className="px-2 py-2 text-muted-foreground hover:text-primary shrink-0"
                  aria-label="Ver archivo"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDescartar(nombre, e)}
                  className="px-2 py-2 text-muted-foreground hover:text-red-500 shrink-0"
                  aria-label="Descartar sin indexar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activo && (
        <form onSubmit={handleConfirmar} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Archivo</label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{activo}</span>
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
            disabled={confirmando}
            className="rounded-full bg-primary text-primary-foreground py-2.5 flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {confirmando ? (
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
    </div>
  )
}
