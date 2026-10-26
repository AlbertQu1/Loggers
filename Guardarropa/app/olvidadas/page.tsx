import { Clock } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Proximamente } from '@/components/common/proximamente'

export default function Page() {
  return (
    <>
      <PageHeader titulo="Olvidadas" subtitulo="Prendas que llevas tiempo sin usar" />
      <Proximamente icono={Clock} titulo="Dale vida a tu clóset" texto="Aquí verás lo que no usas hace más de 60 días, con ideas para combinarlo." />
    </>
  )
}
