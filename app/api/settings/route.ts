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
    const settings = await db.collection("settings").findOne({ type: "system" })

    // Ensure rates have default structure
    const defaultSettings = {
      shop: {
        name: "",
        address: "",
        phone: "",
        gst: "",
        logo: "",
      },
      tax: {
        igst: 3.0,
        cgst: 1.5,
        sgst: 1.5,
      },
      rates: {
        goldRate: 6800,
        silverRate: 85,
        lastUpdated: new Date().toISOString(),
        autoUpdate: false,
        updateInterval: 30,
      },
    }

    const mergedSettings = {
      ...defaultSettings,
      ...settings?.data,
      rates: {
        ...defaultSettings.rates,
        ...settings?.data?.rates,
      },
    }

    return NextResponse.json({ settings: mergedSettings })
  } catch (error) {
    console.error("Error fetching settings:", error)
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

    // Update rates with current timestamp if rates are being updated
    if (body.rates) {
      body.rates.lastUpdated = new Date().toISOString()
    }

    const result = await db.collection("settings").updateOne(
      { type: "system" },
      {
        $set: {
          data: body,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
