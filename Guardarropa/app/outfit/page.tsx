import { Sparkles } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Proximamente } from '@/components/common/proximamente'

export default function Page() {
  return (
    <>
      <PageHeader titulo="Outfit" subtitulo="Arma tu look o pídele uno a Stylo" />
      <Proximamente icono={Sparkles} titulo="Arma tu outfit" texto="Elige una prenda base y desliza opciones de camisa, zapatos y más." />
    </>
  )
}
