import "./globals.css";
import RootClients from '@/components/RootClients'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        {/* RootClients is a client-only wrapper (SessionProvider, Navigation, Toaster) */}
        <RootClients>{children}</RootClients>
      </body>
    </html>
  );
}
