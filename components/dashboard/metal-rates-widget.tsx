"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Settings, RefreshCw, ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface MetalRates {
  goldRate: number
  silverRate: number
  lastUpdated?: string
}

export default function MetalRatesWidget() {
  const [rates, setRates] = useState<MetalRates>({
    goldRate: 6500,
    silverRate: 85,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings) {
          setRates({
            goldRate: data.settings.rates.goldRate || 6500,
            silverRate: data.settings.rates.silverRate || 85,
            lastUpdated: data.settings.updatedAt || new Date().toISOString(),
          })
        }
      }
    } catch (error) {
      console.error("Error fetching metal rates:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return "Just now"
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <Card className="luxury-card shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-t-lg border-b border-primary-100">
        <CardTitle className="flex items-center justify-between text-secondary-800">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
            Live Metal Rates
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-primary-600 text-white shadow-sm">
              <Settings className="h-3 w-3 mr-1" />
              Settings
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRates}
              disabled={loading}
              className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Gold Rate */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🥇</span>
                <div>
                  <h3 className="font-semibold text-primary-800">Gold</h3>
                  <p className="text-xs text-primary-600">24K Pure Gold</p>
                </div>
              </div>
              <div className="flex items-center text-primary-600">
                <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs">Live</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary-700">₹{rates.goldRate.toLocaleString()}</p>
                <p className="text-sm text-primary-600">per gram</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-emerald-600 text-sm">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+2.5%</span>
                </div>
                <p className="text-xs text-primary-500">vs yesterday</p>
              </div>
            </div>
          </div>

          {/* Silver Rate */}
          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 p-4 rounded-lg border border-secondary-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🥈</span>
                <div>
                  <h3 className="font-semibold text-secondary-800">Silver</h3>
                  <p className="text-xs text-secondary-600">999 Pure Silver</p>
                </div>
              </div>
              <div className="flex items-center text-secondary-600">
                <div className="w-2 h-2 bg-secondary-500 rounded-full animate-pulse mr-2"></div>
                <span className="text-xs">Live</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-secondary-700">₹{rates.silverRate.toLocaleString()}</p>
                <p className="text-sm text-secondary-600">per gram</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-emerald-600 text-sm">
                  <ArrowUpRight className="h-3 w-3 mr-1" />
                  <span>+1.8%</span>
                </div>
                <p className="text-xs text-secondary-500">vs yesterday</p>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-center justify-between text-xs text-secondary-500 pt-2 border-t border-secondary-200">
            <span>Last updated: {formatLastUpdated(rates.lastUpdated)}</span>
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="text-xs text-primary-600 hover:text-primary-700">
                <Settings className="h-3 w-3 mr-1" />
                Update Rates
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
