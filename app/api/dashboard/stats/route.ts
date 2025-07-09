import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get total items
    const totalItems = await db.collection("inventory").countDocuments()

    // Get total bills
    const totalBills = await db.collection("bills").countDocuments()

    // Get monthly revenue
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    const monthlyBills = await db
      .collection("bills")
      .find({
        createdAt: { $gte: currentMonth },
        status: "paid",
      })
      .toArray()

    const monthlyRevenue = monthlyBills.reduce((sum, bill) => sum + bill.totalAmount, 0)

    // Get low stock items
    const lowStockItems = await db.collection("inventory").countDocuments({
      $expr: { $lte: ["$quantity", "$minStockLevel"] },
    })

    return NextResponse.json({
      totalItems,
      totalBills,
      monthlyRevenue,
      lowStockItems,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
