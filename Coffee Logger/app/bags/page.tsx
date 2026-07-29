import { BagsList } from '@/components/screens/bags/bags-list'

export const metadata = {
  title: 'Bags - Coffee Logger',
}

export default function BagsPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Coffee Bags</h1>
        <p className="text-muted-foreground mt-2">Manage your coffee bag lifecycle</p>
      </div>

      <BagsList />
    </div>
  )
}
