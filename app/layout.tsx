'use client'

import { NextUIProvider } from '@nextui-org/react'
import { Inter } from 'next/font/google'
import './globals.css'
import { AccountAbstractionProvider } from './store/accountAbstractionContext'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <NextUIProvider>
        <AccountAbstractionProvider>
          <body className={`${inter.className} dark`}>{children}</body>
        </AccountAbstractionProvider>
      </NextUIProvider>
    </html>
  )
}
