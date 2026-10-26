export function PageHeader({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 px-5 pb-4 pt-1">
      <div>
        <h1 className="font-serif text-3xl font-medium leading-tight">{titulo}</h1>
        {subtitulo && <p className="mt-1 text-sm text-muted-foreground">{subtitulo}</p>}
      </div>
      {children}
    </div>
  )
}
