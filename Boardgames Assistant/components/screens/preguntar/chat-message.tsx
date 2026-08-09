import { ChatTurn } from '@/types'
import { Loader2, AlertCircle, ChevronDown } from 'lucide-react'

export function ChatMessage({ turn, onRetry }: { turn: ChatTurn; onRetry: (turn: ChatTurn) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="self-end max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2.5">
        <p className="text-sm">{turn.pregunta}</p>
        {turn.juego && <p className="text-xs opacity-70 mt-1">🎲 {turn.juego}</p>}
      </div>

      {turn.loading && (
        <div className="self-start flex items-center gap-2 text-muted-foreground text-sm px-1">
          <Loader2 className="w-4 h-4 animate-spin" />
          Buscando en el reglamento...
        </div>
      )}

      {turn.error && (
        <div className="self-start max-w-[85%] flex items-start gap-2 rounded-2xl rounded-bl-sm bg-red-50 dark:bg-red-950 text-red-900 dark:text-red-50 px-4 py-2.5">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex flex-col gap-1">
            <p className="text-sm">{turn.error}</p>
            <button onClick={() => onRetry(turn)} className="text-xs font-medium underline self-start">
              Reintentar
            </button>
          </div>
        </div>
      )}

      {turn.respuesta && (
        <div className="self-start max-w-[85%] rounded-2xl rounded-bl-sm bg-card border px-4 py-2.5">
          <p className="text-sm whitespace-pre-wrap">{turn.respuesta}</p>

          {turn.fuentes && turn.fuentes.length > 0 && (
            <details className="mt-2 group">
              <summary className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer select-none">
                <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
                Fuentes ({turn.fuentes.length})
              </summary>
              <ul className="mt-2 space-y-1 border-t pt-2">
                {turn.fuentes.map((f, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    {f.juego} ({f.idioma}) — {f.source_pdf}, chunk {f.chunk_index}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </div>
  )
}
