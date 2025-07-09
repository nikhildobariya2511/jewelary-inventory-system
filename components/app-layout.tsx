"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import Sidebar from "./sidebar"
import Header from "./header"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const pathname = usePathname()

  const isAuthPage = pathname?.startsWith("/auth")

  if (isAuthPage || !session) {
    return <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-primary-50">{children}</div>
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6 luxury-scrollbar">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}
