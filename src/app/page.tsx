'use client'

import { Home } from '@/components/Home'
import IDE from '@/components/IDE'
import { UIStore } from '@/store'

export default function Page() {
  const page = UIStore.useState((s) => s.page)
  if (page == 'home') return <Home />
  if (page == 'ide') return <IDE />
}
