'use client'

import { Home } from '@/components/Home'
import IDE from '@/components/IDE'
import { JavaRuntime } from '@/components/JavaRuntime'
import { UIStore } from '@/store/UIStore'

export default function Page() {
  const page = UIStore.useState((s) => s.page)

  return (
    <JavaRuntime>
      {page == 'home' && <Home />}
      {page == 'ide' && <IDE />}
    </JavaRuntime>
  )
}
