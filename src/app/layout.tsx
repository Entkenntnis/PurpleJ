import type { Metadata } from 'next'

import './globals.css'
import '@xyflow/react/dist/style.css'
import 'react-reflex/styles.css'

export const metadata: Metadata = {
  title: 'PurpleJ',
  description: 'Objekt-orientierte Programmierung mit Java im Browser',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
