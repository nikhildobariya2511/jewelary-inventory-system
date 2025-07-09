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

    const items = await db
      .collection("inventory")
      .find({
        $expr: { $lte: ["$quantity", "$minStockLevel"] },
      })
      .limit(10)
      .toArray()

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Error fetching low stock items:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
