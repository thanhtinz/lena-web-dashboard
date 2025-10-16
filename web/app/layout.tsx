import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientProviders from "@/components/providers/ClientProviders"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lena Bot - AI Discord Bot Platform",
  description: "Professional Discord AI Bot with 6 personalities, games, moderation, and more",
  keywords: ["discord bot", "ai bot", "lena bot", "discord ai", "vietnam discord bot"],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
