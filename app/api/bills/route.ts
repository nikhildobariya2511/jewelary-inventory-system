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
    const limit = Number.parseInt(searchParams.get("limit") || "50")

    const { db } = await connectToDatabase()
    const bills = await db.collection("bills").find({}).sort({ createdAt: -1 }).limit(limit).toArray()

    return NextResponse.json({ bills })
  } catch (error) {
    console.error("Error fetching bills:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { db } = await connectToDatabase()

    const newBill = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("bills").insertOne(newBill)

    // Update inventory quantities
    for (const item of body.items) {
      await db.collection("inventory").updateOne({ _id: item.inventoryId }, { $inc: { quantity: -item.pieces } })
    }

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating bill:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
