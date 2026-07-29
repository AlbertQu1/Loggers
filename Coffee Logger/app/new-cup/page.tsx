import { CupForm } from '@/components/screens/new-cup/cup-form'

export const metadata = {
  title: 'New Cup - Coffee Logger',
}

export default function NewCupPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">New Cup</h1>
        <p className="text-muted-foreground mt-2">Register your coffee in seconds</p>
      </div>

      <CupForm />
    </div>
  )
}
