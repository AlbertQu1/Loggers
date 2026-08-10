'use client'

import { useEffect, useState } from 'react'
import { Search, Upload, Loader2, FileText, X, Trash2, Eye } from 'lucide-react'
import { Juego } from '@/types'
import { getJuegos } from '@/services/api/ask'
import {
  bggLookup,
  subirReglamento,
  getPendientes,
  confirmarReglamento,
  descartarPendiente,
  urlVerPendiente,
} from '@/services/api/reglamentos'
import { showToast } from '@/components/common/toast-notifications'
import { JuegoSelector } from '../preguntar/juego-selector'

export function AgregarScreen() {
  const [juegos, setJuegos] = useState<Juego[]>([])
  const [pendientes, setPendientes] = useState<string[]>([])
  const [pendienteActivo, setPendienteActivo] = useState<string | null>(null)

  const [bggUrl, setBggUrl] = useState('')
  const [buscandoBgg, setBuscandoBgg] = useState(false)
  const [bggEncontrado, setBggEncontrado] = useState<boolean | null>(null)

  const [juego, setJuego] = useState('')
  const [idioma, setIdioma] = useState('es')
  const [docType, setDocType] = useState('reglamento')
  const [juegoBase, setJuegoBase] = useState('')
  const [archivo, setArchivo] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)

  function cargarJuegos() {
    getJuegos().then(setJuegos).catch(() => showToast('No se pudo cargar la lista de juegos', 'error'))
  }

  function cargarPendientes() {
    getPendientes().catch(() => []).then((lista) => setPendientes(lista || []))
  }

  async function handleDescartar(nombre: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm(`¿Quitar "${nombre}" de pendientes sin indexarlo?`)) return
    try {
      await descartarPendiente(nombre)
      if (pendienteActivo === nombre) setPendienteActivo(null)
      cargarPendientes()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo descartar', 'error')
    }
  }

  function handleVerPendiente(nombre: string, e: React.MouseEvent) {
    e.stopPropagation()
    window.open(urlVerPendiente(nombre), '_blank')
  }

  function handleVerArchivoLocal() {
    if (!archivo) return
    const url = URL.createObjectURL(archivo)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  useEffect(() => {
    cargarJuegos()
    cargarPendientes()
  }, [])

  function limpiarForm() {
    setBggUrl('')
    setBggEncontrado(null)
    setJuego('')
    setJuegoBase('')
    setArchivo(null)
    setPendienteActivo(null)
  }

  async function handleBuscarBgg() {
    if (!bggUrl.trim()) return
    setBuscandoBgg(true)
    setBggEncontrado(null)
    try {
      const result = await bggLookup(bggUrl.trim())
      setBggEncontrado(result.encontrado)
      if (result.encontrado && result.nombre) {
        setJuego(result.nombre)
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Error buscando en BGG', 'error')
    } finally {
      setBuscandoBgg(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!juego.trim()) return
    if (!pendienteActivo && !archivo) return

    setSubiendo(true)
    try {
      const result = pendienteActivo
        ? await confirmarReglamento({
            archivoNombre: pendienteActivo,
            juego: juego.trim(),
            idioma,
            docType,
            juegoBase: juegoBase || undefined,
          })
        : await subirReglamento({
            archivo: archivo!,
            juego: juego.trim(),
            idioma,
            docType,
            juegoBase: juegoBase || undefined,
          })
      showToast(`✓ Indexado: ${result.chunks} chunks`, 'success')
      limpiarForm()
      cargarJuegos()
      cargarPendientes()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo indexar el reglamento', 'error')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-5">
      {pendientes.length > 0 && (
        <div className="rounded-lg border bg-card p-3">
          <p className="text-sm font-medium mb-2">
            {pendientes.length} archivo{pendientes.length > 1 ? 's' : ''} esperando información
          </p>
          <div className="flex flex-col gap-2">
            {pendientes.map((nombre) => (
              <div
                key={nombre}
                className={`flex items-center gap-2 rounded-md border ${
                  pendienteActivo === nombre ? 'border-primary bg-accent' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setPendienteActivo(nombre)
                    setArchivo(null)
                    setBggUrl('')
                    setBggEncontrado(null)
                  }}
                  className="flex-1 flex items-center gap-2 text-left text-sm px-3 py-2 min-w-0"
                >
                  <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="truncate">{nombre}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleVerPendiente(nombre, e)}
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

      <div>
        <label className="text-sm font-medium">Link de BGG (opcional)</label>
        <p className="text-xs text-muted-foreground mb-2">
          Solo encuentra el nombre si el juego ya esta en tu biblioteca de BG Stats.
        </p>
        <div className="flex gap-2">
          <input
            value={bggUrl}
            onChange={(e) => setBggUrl(e.target.value)}
            placeholder="boardgamegeek.com/boardgame/..."
            className="flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={handleBuscarBgg}
            disabled={buscandoBgg || !bggUrl.trim()}
            className="rounded-lg border px-3 py-2 text-sm flex items-center gap-1 disabled:opacity-40"
          >
            {buscandoBgg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>
        </div>
        {bggEncontrado === true && (
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Encontrado en tu biblioteca.</p>
        )}
        {bggEncontrado === false && (
          <p className="text-xs text-muted-foreground mt-1">
            No encontrado en tu biblioteca — escribe el nombre manualmente.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium">Juego</label>
          <input
            value={juego}
            onChange={(e) => setJuego(e.target.value)}
            required
            placeholder="Nombre exacto de BGG"
            className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="text-sm font-medium">Idioma</label>
            <select
              value={idioma}
              onChange={(e) => setIdioma(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="es">Español</option>
              <option value="en">Inglés</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium">Tipo</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-background px-3 py-2 text-sm"
            >
              <option value="reglamento">Reglamento</option>
              <option value="errata">Errata</option>
              <option value="faq">FAQ</option>
              <option value="automa">Automa / Solo</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium">Es expansion de... (opcional)</label>
          <div className="mt-1">
            <JuegoSelector juegos={juegos} value={juegoBase} onChange={setJuegoBase} />
          </div>
        </div>

        {pendienteActivo ? (
          <div>
            <label className="text-sm font-medium">Archivo</label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm">
              <FileText className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{pendienteActivo}</span>
              <button
                type="button"
                onClick={() => window.open(urlVerPendiente(pendienteActivo), '_blank')}
                aria-label="Ver archivo"
              >
                <Eye className="w-4 h-4 text-muted-foreground" />
              </button>
              <button type="button" onClick={() => setPendienteActivo(null)} aria-label="Quitar">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium">Archivo (PDF o DOCX)</label>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="file"
                accept=".pdf,.docx"
                onChange={(e) => setArchivo(e.target.files?.[0] || null)}
                className="flex-1 text-sm"
              />
              {archivo && (
                <button
                  type="button"
                  onClick={handleVerArchivoLocal}
                  className="p-2 text-muted-foreground hover:text-primary shrink-0"
                  aria-label="Ver archivo"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={subiendo || (!archivo && !pendienteActivo) || !juego.trim()}
          className="rounded-full bg-primary text-primary-foreground py-2.5 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {subiendo ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Indexando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" /> Indexar reglamento
            </>
          )}
        </button>
      </form>
    </div>
  )
}
