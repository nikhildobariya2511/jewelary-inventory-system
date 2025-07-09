import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Get categories and types from database
    const categoriesData = await db.collection("categories").find({ type: "category", isActive: true }).toArray()
    const typesData = await db.collection("categories").find({ type: "type", isActive: true }).toArray()

    // If no data in database, return default values
    const defaultCategories = ["Gold", "Silver", "Diamond", "Others"]
    const defaultTypes = ["Ring", "Necklace", "Bangle", "Bracelet", "Earring", "Chain", "Custom"]

    const categories = categoriesData.length > 0 ? categoriesData.map((cat) => cat.name) : defaultCategories
    const types = typesData.length > 0 ? typesData.map((type) => type.name) : defaultTypes

    return NextResponse.json({
      categories:
        categoriesData.length > 0 ? categoriesData : defaultCategories.map((name) => ({ name, isActive: true })),
      types: typesData.length > 0 ? typesData : defaultTypes.map((name) => ({ name, isActive: true })),
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
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

    const newItem = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("categories").insertOne(newItem)

    return NextResponse.json(
      {
        success: true,
        id: result.insertedId,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating category/type:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
