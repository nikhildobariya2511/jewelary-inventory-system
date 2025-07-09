import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "sales"
    const from = searchParams.get("from")
    const to = searchParams.get("to")

    const { db } = await connectToDatabase()

    const dateFilter: any = {}
    if (from && to) {
      dateFilter.createdAt = {
        $gte: new Date(from),
        $lte: new Date(to),
      }
    }

    // Get bills data
    const bills = await db.collection("bills").find(dateFilter).toArray()
    const inventory = await db.collection("inventory").find({}).toArray()

    // Calculate summary
    const totalRevenue = bills.reduce((sum, bill) => sum + (bill.totals?.totalAmount || 0), 0)
    const totalBills = bills.length
    const averageOrderValue = totalBills > 0 ? totalRevenue / totalBills : 0

    // Calculate profit margin (simplified calculation)
    const totalCost = bills.reduce((sum, bill) => {
      return (
        sum +
        (bill.items || []).reduce((itemSum: number, item: any) => {
          const inventoryItem = inventory.find((inv) => inv._id.toString() === item.inventoryId)
          return itemSum + (inventoryItem?.costPrice || 0) * (item.pieces || 1)
        }, 0)
      )
    }, 0)
    const profitMargin = totalRevenue > 0 ? ((totalRevenue - totalCost) / totalRevenue) * 100 : 0

    // Daily sales data
    const dailySalesMap = new Map()
    bills.forEach((bill) => {
      const date = new Date(bill.createdAt).toISOString().split("T")[0]
      if (!dailySalesMap.has(date)) {
        dailySalesMap.set(date, { date, amount: 0, bills: 0 })
      }
      const dayData = dailySalesMap.get(date)
      dayData.amount += bill.totals?.totalAmount || 0
      dayData.bills += 1
    })
    const dailySales = Array.from(dailySalesMap.values()).sort((a, b) => a.date.localeCompare(b.date))

    // Category wise sales
    const categoryMap = new Map()
    let totalCategoryValue = 0
    bills.forEach((bill) => {
      ;(bill.items || []).forEach((item: any) => {
        const inventoryItem = inventory.find((inv) => inv._id.toString() === item.inventoryId)
        const category = inventoryItem?.category || "Unknown"
        const value = item.total || 0
        categoryMap.set(category, (categoryMap.get(category) || 0) + value)
        totalCategoryValue += value
      })
    })

    const categoryWise = Array.from(categoryMap.entries()).map(([category, value]) => ({
      category,
      value,
      percentage: totalCategoryValue > 0 ? Math.round((value / totalCategoryValue) * 100) : 0,
    }))

    // Top selling items
    const itemMap = new Map()
    bills.forEach((bill) => {
      ;(bill.items || []).forEach((item: any) => {
        const key = item.inventoryId
        if (!itemMap.has(key)) {
          itemMap.set(key, {
            name: item.name,
            quantity: 0,
            revenue: 0,
          })
        }
        const itemData = itemMap.get(key)
        itemData.quantity += item.pieces || 1
        itemData.revenue += item.total || 0
      })
    })

    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    const reportData = {
      summary: {
        totalRevenue,
        totalBills,
        averageOrderValue,
        profitMargin,
      },
      dailySales,
      categoryWise,
      topItems,
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
