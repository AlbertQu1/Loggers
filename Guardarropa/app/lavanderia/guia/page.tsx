import { Guia } from '@/components/screens/lavanderia/guia'

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams
  const valida = (['simbolos', 'telas', 'casa'] as const).find((t) => t === tab)
  return <Guia tabInicial={valida} />
}
