import { Suspense } from 'react'
import { Armador } from '@/components/screens/outfit/armador'

export default function Page() {
  return (
    <Suspense>
      <Armador />
    </Suspense>
  )
}
