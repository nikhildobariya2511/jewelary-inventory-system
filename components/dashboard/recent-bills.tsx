"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Receipt, Eye, Phone, Calendar, Package, ArrowRight } from "lucide-react"
import Link from "next/link"

interface BillItem {
  _id: string
  billNumber: string
  customerName: string
  customerPhone?: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  totals: {
    totalAmount: number
  }
  status: "paid" | "pending" | "cancelled"
  createdAt: string
}


export default function RecentBills() {
  const [bills, setBills] = useState<BillItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentBills()
  }, [])

  const fetchRecentBills = async () => {
    try {
      const response = await fetch("/api/bills?limit=5&sort=createdAt&order=desc")
      if (response.ok) {
        const data = await response.json()
        setBills(data.bills || [])
      }
    } catch (error) {
      console.error("Error fetching recent bills:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return "✅"
      case "pending":
        return "⏳"
      case "cancelled":
        return "❌"
      default:
        return "📄"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700 border-emerald-200"
      case "pending":
        return "bg-amber-100 text-amber-700 border-amber-200"
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-secondary-100 text-secondary-700 border-secondary-200"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getItemsPreview = (items: BillItem["items"]) => {
    if (!items || items.length === 0) return "No items"

    if (items.length === 1) {
      return items[0].name
    } else if (items.length === 2) {
      return `${items[0].name}, ${items[1].name}`
    } else {
      return `${items[0].name}, ${items[1].name} +${items.length - 2} more`
    }
  }

  if (loading) {
    return (
      <Card className="luxury-card shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-blue-100">
          <CardTitle className="flex items-center text-secondary-800">
            <Receipt className="h-5 w-5 mr-2 text-blue-600" />
            Recent Bills
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-lg">
                  <div className="flex-1">
                    <div className="h-4 bg-secondary-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-secondary-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-secondary-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="luxury-card shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg border-b border-blue-100">
        <CardTitle className="flex items-center justify-between text-secondary-800">
          <div className="flex items-center">
            <Receipt className="h-5 w-5 mr-2 text-blue-600" />
            Recent Bills
          </div>
          <Link href="/billing">
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              View All
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {bills.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-secondary-300 mx-auto mb-3" />
            <p className="text-secondary-500">No recent bills found</p>
            <Link href="/billing/create">
              <Button className="mt-3 luxury-button-primary">Create First Bill</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div
                key={bill._id}
                className="group p-4 bg-gradient-to-r from-white to-blue-50/30 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getStatusIcon(bill.status)}</span>
                        <div>
                          <h4 className="font-semibold text-secondary-900 truncate">{bill.billNumber}</h4>
                          <p className="text-sm text-secondary-600 truncate">{bill.customerName}</p>
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(bill.status)} text-xs px-2 py-1`}>
                        {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-secondary-500">
                      {bill.customerPhone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {bill.customerPhone}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(bill.createdAt)}
                      </div>
                      <div className="flex items-center md:col-span-2">
                        <Package className="h-3 w-3 mr-1" />
                        <span className="truncate">{getItemsPreview(bill.items)}</span>
                        <span className="ml-1 text-blue-600 font-medium">({bill.items?.length || 0} items)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-emerald-600">₹{bill.totals?.totalAmount?.toLocaleString() || "0"}</p>
                      <p className="text-xs text-secondary-500">Total Amount</p>
                    </div>
                    <Link href={`/billing/${bill._id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-blue-100">
              <Link href="/billing">
                <Button variant="outline" className="w-full luxury-button-secondary bg-transparent">
                  <Receipt className="h-4 w-4 mr-2" />
                  View All Bills
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
