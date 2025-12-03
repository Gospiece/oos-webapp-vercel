import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'

// Initialize the Inter font
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optional: improves loading performance
})

export const metadata: Metadata = {
  title: 'OOS WebApp - Online Office Space',
  description: 'Bringing your office to your screen',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="afterInteractive"
          async
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}