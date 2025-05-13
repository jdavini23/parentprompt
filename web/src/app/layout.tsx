import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ParentPrompt - Daily Parenting Prompts for New Dads",
  description:
    "A simple tool that delivers personalized parenting prompts every day to help dads bond with their children.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
