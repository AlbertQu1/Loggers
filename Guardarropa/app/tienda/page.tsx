import { ShoppingBag } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Proximamente } from '@/components/common/proximamente'

export default function Page() {
  return (
    <>
      <PageHeader titulo="Tienda" subtitulo="¿Te gustó algo? Ve si combina con tu clóset" />
      <Proximamente icono={ShoppingBag} titulo="Modo tienda" texto="Tómale foto a una prenda y Stylo te dice con qué combinarla y si ya tienes algo parecido." />
    </>
  )
}
