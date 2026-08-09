'use client'

import { useEffect, useRef, useState } from 'react'
import { Send } from 'lucide-react'
import { ChatTurn, Fuente, Juego } from '@/types'
import { askQuestion, getJuegos } from '@/services/api/ask'
import { showToast } from '@/components/common/toast-notifications'
import { ChatMessage } from './chat-message'
import { JuegoSelector } from './juego-selector'

function dedupeFuentes(fuentes: Fuente[]): Fuente[] {
  const seen = new Set<string>()
  return fuentes.filter((f) => {
    const key = `${f.juego}|${f.source_pdf}|${f.chunk_index}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function PreguntarScreen() {
  const [turns, setTurns] = useState<ChatTurn[]>([])
  const [input, setInput] = useState('')
  const [juego, setJuego] = useState('')
  const [juegos, setJuegos] = useState<Juego[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getJuegos()
      .then(setJuegos)
      .catch(() => showToast('No se pudo cargar la lista de juegos', 'error'))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [turns])

  async function runTurn(turn: ChatTurn) {
    setTurns((prev) => prev.map((t) => (t.id === turn.id ? { ...t, loading: true, error: undefined } : t)))

    try {
      const data = await askQuestion(turn.pregunta, turn.juego)
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
      juego: juego || undefined,
      loading: true,
    }

    setTurns((prev) => [...prev, turn])
    setInput('')
    runTurn(turn)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)]">
      <div className="border-b px-4 py-2">
        <JuegoSelector juegos={juegos} value={juego} onChange={setJuego} />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        {turns.length === 0 && (
          <p className="text-sm text-muted-foreground text-center mt-8">
            Pregunta lo que quieras sobre las reglas de tus juegos indexados.
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
