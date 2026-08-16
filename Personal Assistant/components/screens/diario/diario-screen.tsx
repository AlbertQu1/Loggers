'use client'

import { useState } from 'react'
import { BookOpen, Loader2, Send } from 'lucide-react'
import { guardarEntradaDiario } from '@/services/api/diario'
import { showToast } from '@/components/common/toast-notifications'

export function DiarioScreen() {
  const [texto, setTexto] = useState('')
  const [guardando, setGuardando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const contenido = texto.trim()
    if (!contenido) return

    setGuardando(true)
    try {
      const resultado = await guardarEntradaDiario(contenido)
      showToast(`✓ Guardado e indexado (${resultado.chunks_indexados} fragmentos)`, 'success')
      setTexto('')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo guardar la entrada', 'error')
    } finally {
      setGuardando(false)
    }
  }

  const hoy = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <BookOpen className="w-4 h-4" />
        <p className="text-sm capitalize">{hoy}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="¿Qué pasó hoy? Escribe libremente — se guarda e indexa directo, sin pasar por SilverBullet."
          rows={12}
          className="w-full rounded-lg border bg-transparent px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          autoFocus
        />
        <button
          type="submit"
          disabled={guardando || !texto.trim()}
          className="rounded-full bg-primary text-primary-foreground py-2.5 flex items-center justify-center gap-2 disabled:opacity-40"
        >
          {guardando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Guardando...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" /> Guardar entrada
            </>
          )}
        </button>
      </form>
    </div>
  )
}
