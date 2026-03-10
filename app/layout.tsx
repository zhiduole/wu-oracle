import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wú · The Book of Changes',
  description: 'Ancient Chinese I Ching divination. Ask your question, cast the hexagram, receive your reading.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cormorant+SC:wght@300;400;600&family=Noto+Serif+SC:wght@400&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}
