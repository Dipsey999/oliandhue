import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Oli & Hue Admin',
  description: 'Admin panel for Oli & Hue',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
