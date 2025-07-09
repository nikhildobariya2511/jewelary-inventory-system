"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package } from "lucide-react"
import Link from "next/link"

interface LowStockItem {
  _id: string
  name: string
  category: string
  type: string
  quantity: number
  minStockLevel: number
}

export default function LowStockAlert() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLowStockItems()
  }, [])

  const fetchLowStockItems = async () => {
    try {
      const response = await fetch("/api/inventory/low-stock")
      if (response.ok) {
        const data = await response.json()
        setLowStockItems(data.items)
      }
    } catch (error) {
      console.error("Error fetching low stock items:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          Low Stock Alert
        </CardTitle>
        <Link href="/inventory">
          <Button variant="outline" size="sm">
            <Package className="h-4 w-4 mr-2" />
            Manage Stock
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {lowStockItems.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-green-600 mb-2">
                <Package className="h-8 w-8 mx-auto" />
              </div>
              <p className="text-muted-foreground">All items are well stocked!</p>
            </div>
          ) : (
            lowStockItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3 border rounded-lg bg-red-50 border-red-200"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.category} • {item.type}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="destructive">{item.quantity} left</Badge>
                  <div className="text-xs text-muted-foreground mt-1">Min: {item.minStockLevel}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
