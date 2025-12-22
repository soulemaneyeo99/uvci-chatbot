import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

export const metadata: Metadata = {
  title: 'Assistant UVCI - Chatbot Intelligent',
  description: 'Votre guide intelligent pour tout savoir sur l\'Université Virtuelle de Côte d\'Ivoire',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  themeColor: '#8B1874',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#8B1874" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
