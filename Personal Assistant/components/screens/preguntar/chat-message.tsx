import { ChatTurn } from '@/types'
import { Loader2, AlertCircle, ChevronDown } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const MARKDOWN_COMPONENTS = {
  p: (props: React.ComponentProps<'p'>) => <p className="mb-2 last:mb-0" {...props} />,
  ul: (props: React.ComponentProps<'ul'>) => <ul className="mb-2 last:mb-0 list-disc pl-5 space-y-0.5" {...props} />,
  ol: (props: React.ComponentProps<'ol'>) => <ol className="mb-2 last:mb-0 list-decimal pl-5 space-y-0.5" {...props} />,
  li: (props: React.ComponentProps<'li'>) => <li className="marker:text-muted-foreground" {...props} />,
  h1: (props: React.ComponentProps<'h1'>) => <h1 className="text-base font-semibold mt-3 mb-1 first:mt-0" {...props} />,
  h2: (props: React.ComponentProps<'h2'>) => <h2 className="text-sm font-semibold mt-3 mb-1 first:mt-0" {...props} />,
  h3: (props: React.ComponentProps<'h3'>) => <h3 className="text-sm font-semibold mt-2 mb-1 first:mt-0" {...props} />,
  strong: (props: React.ComponentProps<'strong'>) => <strong className="font-semibold" {...props} />,
  hr: () => <hr className="my-3 border-muted" />,
  code: (props: React.ComponentProps<'code'>) => (
    <code className="rounded bg-muted px-1 py-0.5 text-xs" {...props} />
  ),
  a: (props: React.ComponentProps<'a'>) => (
    <a className="underline underline-offset-2" target="_blank" rel="noopener noreferrer" {...props} />
  ),
}

export function ChatMessage({ turn, onRetry }: { turn: ChatTurn; onRetry: (turn: ChatTurn) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="self-end max-w-[85%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2.5">
        <p className="text-sm">{turn.pregunta}</p>
      </div>

      {turn.loading && (
        <div className="self-start flex items-center gap-2 text-muted-foreground text-sm px-1">
          <Loader2 className="w-4 h-4 animate-spin" />
          Buscando...
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
          <div className="text-sm">
            <ReactMarkdown components={MARKDOWN_COMPONENTS}>{turn.respuesta}</ReactMarkdown>
          </div>

          {turn.fuentes && turn.fuentes.length > 0 && (
            <details className="mt-2 group">
              <summary className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer select-none">
                <ChevronDown className="w-3 h-3 transition-transform group-open:rotate-180" />
                Fuentes ({turn.fuentes.length})
              </summary>
              <ul className="mt-2 space-y-1 border-t pt-2">
                {turn.fuentes.map((f, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    {f.titulo} ({f.doc_type}, {f.fecha}) — {f.source_path}, chunk {f.chunk_index}
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
