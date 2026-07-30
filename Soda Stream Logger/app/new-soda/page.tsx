import { SodaForm } from '@/components/screens/new-soda/soda-form'

export const metadata = {
  title: 'New Soda - Soda Stream Logger',
}

export default function NewSodaPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Soda</h1>
        <p className="text-muted-foreground mt-2">Register your soda in seconds</p>
      </div>

      <SodaForm />
    </div>
  )
}
