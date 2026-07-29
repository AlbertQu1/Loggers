import { WasteForm } from '@/components/screens/waste/waste-form'

export const metadata = {
  title: 'Care - Coffee Logger',
}

export default function WastePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Machine Care</h1>
        <p className="text-muted-foreground mt-2">Maintenance and wasted coffee</p>
      </div>

      <WasteForm />
    </div>
  )
}
