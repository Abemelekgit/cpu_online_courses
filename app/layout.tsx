import "./globals.css";
import RootClients from '@/components/RootClients'
import { Manrope, Fraunces } from 'next/font/google'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${fraunces.variable} antialiased`}>
        {/* RootClients is a client-only wrapper (SessionProvider, Navigation, Toaster) */}
        <RootClients>{children}</RootClients>
      </body>
    </html>
  );
}
