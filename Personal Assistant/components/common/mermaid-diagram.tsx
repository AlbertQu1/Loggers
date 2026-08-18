'use client'

import { useEffect, useRef, useState, useId } from 'react'

let mermaidInitialized = false

export function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const id = useId().replace(/:/g, '')

  useEffect(() => {
    let cancelled = false

    async function render() {
      const mermaid = (await import('mermaid')).default
      if (!mermaidInitialized) {
        mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'strict' })
        mermaidInitialized = true
      }
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, chart.trim())
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg
        }
      } catch {
        if (!cancelled) setError('No se pudo generar el diagrama.')
      }
    }

    render()
    return () => {
      cancelled = true
    }
  }, [chart, id])

  if (error) {
    return <pre className="rounded bg-muted px-3 py-2 text-xs overflow-x-auto">{chart}</pre>
  }

  return <div ref={containerRef} className="my-2 overflow-x-auto [&_svg]:max-w-full" />
}
