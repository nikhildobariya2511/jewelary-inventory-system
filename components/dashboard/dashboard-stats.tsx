"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Receipt, TrendingUp, AlertTriangle, Crown, Star } from "lucide-react"

interface Stats {
  totalItems: number
  totalBills: number
  monthlyRevenue: number
  lowStockItems: number
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalItems: 0,
    totalBills: 0,
    monthlyRevenue: 0,
    lowStockItems: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Items",
      value: stats.totalItems,
      icon: Package,
      gradient: "from-emerald-400 to-emerald-600",
      bgGradient: "from-emerald-50 to-emerald-100",
      iconBg: "bg-emerald-500",
      textColor: "text-emerald-800",
      description: "Items in inventory",
    },
    {
      title: "Total Bills",
      value: stats.totalBills,
      icon: Receipt,
      gradient: "from-diamond-400 to-diamond-600",
      bgGradient: "from-diamond-50 to-diamond-100",
      iconBg: "bg-diamond-500",
      textColor: "text-diamond-800",
      description: "Generated this month",
    },
    {
      title: "Monthly Revenue",
      value: `₹${stats.monthlyRevenue != null ? stats.monthlyRevenue.toLocaleString() : "0"}`,
      icon: Crown,
      gradient: "from-primary-400 to-primary-600",
      bgGradient: "from-primary-50 to-primary-100",
      iconBg: "bg-primary-500",
      textColor: "text-primary-800",
      description: "This month's earnings",
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems,
      icon: AlertTriangle,
      gradient: "from-red-400 to-red-600",
      bgGradient: "from-red-50 to-red-100",
      iconBg: "bg-red-500",
      textColor: "text-red-800",
      description: "Need restocking",
    },
  ]

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="luxury-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-10 w-10 rounded-full" />
            </CardHeader>
            <CardContent>
              <div className="skeleton h-8 w-16 mb-2" />
              <div className="skeleton h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="luxury-card hover:scale-105 transition-transform duration-300 fade-in group">
          <CardHeader
            className={`flex flex-row items-center justify-between space-y-0 pb-3 bg-gradient-to-r ${stat.bgGradient} rounded-t-xl`}
          >
            <div>
              <CardTitle className={`text-sm font-semibold ${stat.textColor}`}>{stat.title}</CardTitle>
              <p className="text-xs text-secondary-600 mt-1">{stat.description}</p>
            </div>
            <div
              className={`p-3 rounded-xl ${stat.iconBg} shadow-lg group-hover:scale-110 transition-transform duration-200`}
            >
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold text-secondary-900">{stat.value}</div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <span className="text-xs text-emerald-600 font-medium">+12%</span>
              </div>
            </div>
            <div className="mt-2 flex items-center space-x-1">
              <Star className="h-3 w-3 text-primary-400" />
              <span className="text-xs text-secondary-500">vs last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
