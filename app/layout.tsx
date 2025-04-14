import type { Metadata } from 'next'
import { Toaster } from "@/components/ui/toaster"
import './globals.css'

export const metadata: Metadata = {
  title: 'Team Builder',
  description: 'Rate players and build the perfect team',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-white">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
