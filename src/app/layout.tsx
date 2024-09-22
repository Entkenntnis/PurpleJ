import type { Metadata } from 'next'
import clsx from 'clsx'

import './globals.css'
import '@xyflow/react/dist/style.css'

export const metadata: Metadata = {
  title: 'BlueJ Online',
  description: 'an experiment',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className="h-full">
      <body className={clsx('antialiased h-full')}>{children}</body>
    </html>
  )
}
