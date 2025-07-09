"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, TrendingDown } from "lucide-react"

interface MetalRates {
  goldRate: number
  silverRate: number
  lastUpdated: string
  source: string
  isLive: boolean
}

interface RealTimeRatesDisplayProps {
  onRatesUpdate?: (rates: MetalRates) => void
  showRefresh?: boolean
}

export default function RealTimeRatesDisplay({ onRatesUpdate, showRefresh = true }: RealTimeRatesDisplayProps) {
  const [rates, setRates] = useState<MetalRates | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchRates()
    // Auto-refresh every 5 minutes for live rates
    const interval = setInterval(fetchRates, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchRates = async () => {
    try {
      setRefreshing(true)
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        setRates({
          goldRate: data.settings.rates.goldRate || 6800,
          silverRate: data.settings.rates.silverRate || 85,
          lastUpdated: data.settings.rates.lastUpdated || new Date().toISOString(),
          source: data.settings.rates.source || "Unknown",
          isLive: data.settings.rates.isLive ?? false,
        })
        onRatesUpdate?.({
          goldRate: data.settings.rates.goldRate || 6800,
          silverRate: data.settings.rates.silverRate || 85,
          lastUpdated: data.settings.rates.lastUpdated || new Date().toISOString(),
          source: data.settings.rates.source || "Unknown",
          isLive: data.settings.rates.isLive ?? false,
        })
      }
    } catch (error) {
      console.error("Error fetching rates:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading rates...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!rates) return null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Metal Rates</CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant={rates.isLive ? "default" : "secondary"}>{rates.isLive ? "LIVE" : "STORED"}</Badge>
          {showRefresh && (
            <Button variant="ghost" size="sm" onClick={fetchRates} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Gold (24k)</span>
            </div>
            <span className="text-lg font-bold">₹{rates.goldRate.toLocaleString()}/g</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Silver (999)</span>
            </div>
            <span className="text-lg font-bold">₹{rates.silverRate.toLocaleString()}/g</span>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Source: {rates.source}</p>
            <p>Updated: {new Date(rates.lastUpdated).toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
