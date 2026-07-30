import { FlavorsList } from '@/components/screens/flavors/flavors-list'

export const metadata = {
  title: 'Flavors - Soda Stream Logger',
}

export default function FlavorsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Flavors</h1>
        <p className="text-muted-foreground mt-2">Manage your syrup flavors</p>
      </div>

      <FlavorsList />
    </div>
  )
}
