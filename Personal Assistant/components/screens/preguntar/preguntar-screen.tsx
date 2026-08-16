'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { ChatTurn, Fuente } from '@/types'
import { askQuestion } from '@/services/api/ask'
import { showToast } from '@/components/common/toast-notifications'
import { ChatMessage } from './chat-message'

function dedupeFuentes(fuentes: Fuente[]): Fuente[] {
  const seen = new Set<string>()
  return fuentes.filter((f) => {
    const key = `${f.titulo}|${f.source_path}|${f.chunk_index}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function PreguntarScreen() {
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns])

  async function runTurn(turn: ChatTurn) {
    setTurns((prev) => prev.map((t) => (t.id === turn.id ? { ...t, loading: true, error: undefined } : t)))

    const historial = turns
      .filter((t) => t.id !== turn.id && t.respuesta && !t.error)
      .map((t) => ({ pregunta: t.pregunta, respuesta: t.respuesta! }))

    try {
      const data = await askQuestion(turn.pregunta, historial)
      setTurns((prev) =>
        prev.map((t) =>
          t.id === turn.id
            ? { ...t, loading: false, respuesta: data.respuesta, fuentes: dedupeFuentes(data.fuentes) }
            : t
        )
      )
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo conectar con el asistente. Intenta de nuevo.'
      setTurns((prev) =>
        prev.map((t) => (t.id === turn.id ? { ...t, loading: false, error: mensaje } : t))
      )
      showToast(mensaje, 'error')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const pregunta = input.trim()
    if (!pregunta) return

    const turn: ChatTurn = {
      id: `turn-${Date.now()}`,
      pregunta,
      loading: true,
    }

    setTurns((prev) => [...prev, turn])
    setInput('')
    runTurn(turn)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)]">
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {turns.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">
            Pregunta lo que quieras sobre tus notas, fotos y datos indexados.
          </p>
        )}
        {turns.map((turn) => (
          <ChatMessage key={turn.id} turn={turn} onRetry={runTurn} />
        ))}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-3 flex gap-2 items-center bg-background">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu pregunta..."
          className="flex-1 rounded-full border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="rounded-full bg-primary text-primary-foreground w-10 h-10 flex items-center justify-center disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  )
}
