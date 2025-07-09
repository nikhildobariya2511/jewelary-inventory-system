import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"
import DashboardStats from "@/components/dashboard/dashboard-stats"
import RecentBills from "@/components/dashboard/recent-bills"
import LowStockAlert from "@/components/dashboard/low-stock-alert"
import MetalRatesWidget from "@/components/dashboard/metal-rates-widget"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your business overview.</p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RecentBills />
        <LowStockAlert />
        <MetalRatesWidget />
      </div>
    </div>
  )
}
