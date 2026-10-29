'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ImageUp, Loader2, Sparkles } from 'lucide-react'
import { showToast } from '@/components/common/toast-notifications'
import { PageHeader } from '@/components/common/page-header'
import { EtiquetasForm } from './etiquetas-form'
import { analizarFoto, crearPrenda, descartarTemporal, urlMedia, type Analisis, type EtiquetasPrenda } from '@/services/api/prendas'

const VACIAS: EtiquetasPrenda = {
  categoria: 'top', subcategoria: '', colores: [], estampado: '', material: '',
  formalidad: 3, temporada: [], ocasiones: [], descripcion: '', talla: null, marca: null, ajuste: null,
}

const btnPrimario =
  'flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-[15px] font-medium text-primary-foreground transition active:scale-[0.98] disabled:opacity-50'
const btnSecundario =
  'flex w-full items-center justify-center gap-2 rounded-full border bg-card px-6 py-4 text-[15px] font-medium transition active:scale-[0.98] disabled:opacity-50'

export function AgregarPrenda() {
  const router = useRouter()
  const camara = useRef<HTMLInputElement>(null)
  const galeria = useRef<HTMLInputElement>(null)
  const [analizando, setAnalizando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [analisis, setAnalisis] = useState<Analisis | null>(null)
  const [etiquetas, setEtiquetas] = useState<EtiquetasPrenda>(VACIAS)

  async function onFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0]
    e.target.value = ''
    if (!archivo) return
    setAnalizando(true)
    try {
      const r = await analizarFoto(archivo)
      setAnalisis(r)
      setEtiquetas(r.etiquetas ? { ...VACIAS, ...r.etiquetas } : VACIAS)
      if (!r.etiquetas) showToast('La IA no respondió; llena los datos a mano', 'warning')
    } catch (err) {
      showToast(`No se pudo analizar: ${(err as Error).message}`, 'error')
    } finally {
      setAnalizando(false)
    }
  }

  async function guardar(otra: boolean) {
    if (!analisis) return
    setGuardando(true)
    try {
      await crearPrenda({ ...etiquetas, foto_original: analisis.foto_original, foto_recortada: analisis.foto_recortada })
      showToast('Prenda guardada en tu clóset', 'success')
      setAnalisis(null)
      setEtiquetas(VACIAS)
      // iOS no deja abrir la cámara sin un toque directo: se regresa a la pantalla inicial
      if (!otra) router.push('/closet')
    } catch (err) {
      showToast(`No se pudo guardar: ${(err as Error).message}`, 'error')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <input ref={camara} type="file" accept="image/*" capture="environment" hidden onChange={onFoto} />
      <input ref={galeria} type="file" accept="image/*" hidden onChange={onFoto} />

      {!analisis && !analizando && (
        <>
          <PageHeader titulo="Nueva prenda" subtitulo="Stylo la recorta y la etiqueta por ti" />
          <div className="space-y-4 px-5">
            <button
              onClick={() => camara.current?.click()}
              className="flex w-full flex-col items-center gap-4 rounded-3xl border border-dashed bg-card px-6 py-14 transition active:scale-[0.99]"
            >
              <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Camera className="h-9 w-9" strokeWidth={1.6} />
              </span>
              <span className="font-serif text-xl">Tomar foto</span>
              <span className="max-w-60 text-sm text-muted-foreground">
                Sobre una superficie lisa o colgada, con buena luz
              </span>
            </button>
            <button onClick={() => galeria.current?.click()} className={btnSecundario}>
              <ImageUp className="h-5 w-5" /> Elegir de la galería
            </button>
          </div>
        </>
      )}

      {analizando && (
        <div className="flex flex-col items-center gap-4 px-5 py-28 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <Sparkles className="h-8 w-8 text-accent" strokeWidth={1.6} />
            <Loader2 className="absolute h-20 w-20 animate-spin text-accent/40" strokeWidth={1} />
          </div>
          <p className="font-serif text-xl">Analizando tu prenda…</p>
          <p className="text-sm text-muted-foreground">Recortando el fondo y reconociendo colores y estilo</p>
        </div>
      )}

      {analisis && (
        <>
          <PageHeader titulo="Confirma los detalles" subtitulo="Corrige lo que Stylo no haya acertado" />
          <div className="space-y-6 px-5">
            <div className="flex justify-center rounded-3xl bg-secondary p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urlMedia(analisis.foto_recortada ?? analisis.foto_original)} alt="Prenda" className="max-h-72 object-contain drop-shadow-xl" />
            </div>
            <EtiquetasForm valor={etiquetas} onChange={setEtiquetas} />
            <div className="space-y-3 pt-2">
              <button className={btnPrimario} disabled={guardando} onClick={() => guardar(false)}>
                {guardando && <Loader2 className="h-4 w-4 animate-spin" />} Guardar en mi clóset
              </button>
              <button className={btnSecundario} disabled={guardando} onClick={() => guardar(true)}>
                Guardar y agregar otra
              </button>
              <button
                className="w-full py-3 text-sm text-muted-foreground"
                onClick={() => {
                  descartarTemporal([analisis.foto_original, analisis.foto_recortada])
                  setAnalisis(null)
                }}
              >
                Descartar
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
