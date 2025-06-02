  import type { Metadata } from "next"
  import { Inter } from "next/font/google"
  import "./globals.css"
  import { Providers } from "./providers"
  // import { SessionProvider } from "next-auth/react"

  const inter = Inter({ subsets: ["latin"] })

  export const metadata: Metadata = {
    title: "YummyBunch - Food Ordering System",
    description: "Order food from your favorite restaurants",
  }

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode
  }>) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
            {/* <SessionProvider> */}
          <Providers>
            {children}
          </Providers>
            {/* </SessionProvider> */}
        </body>
      </html>
    )
  }
