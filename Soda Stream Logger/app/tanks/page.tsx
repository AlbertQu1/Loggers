import { TanksList } from '@/components/screens/tanks/tanks-list'

export const metadata = {
  title: 'Tanks - Soda Stream Logger',
}

export default function TanksPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Tanks</h1>
        <p className="text-muted-foreground mt-2">Manage your CO2 cylinders</p>
      </div>

      <TanksList />
    </div>
  )
}
