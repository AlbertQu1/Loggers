import { HistoryList } from '@/components/screens/history/history-list'

export const metadata = {
  title: 'History - Soda Stream Logger',
}

export default function HistoryPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">History</h1>
        <p className="text-muted-foreground mt-2">Tank yield over time</p>
      </div>

      <HistoryList />
    </div>
  )
}
