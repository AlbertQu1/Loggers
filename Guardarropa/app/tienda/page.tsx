import { ShoppingBag } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Proximamente } from '@/components/common/proximamente'
import { MisTallas } from '@/components/screens/tienda/mis-tallas'

export default function Page() {
  return (
    <>
      <PageHeader titulo="Tienda" subtitulo="Tus tallas y marcas, para tenerlas a la mano al comprar" />
      <MisTallas />
      <div className="mt-6">
        <Proximamente icono={ShoppingBag} titulo="Modo tienda" texto="Tómale foto a una prenda y Stylo te dice con qué combinarla y si ya tienes algo parecido." />
      </div>
    </>
  )
}
