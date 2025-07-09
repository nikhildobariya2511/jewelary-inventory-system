import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { calculateRealTimePrice } from "@/lib/price-calculator"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { weight, purity, category, makingCharges, stoneCharges } = body

    // Fetch current metal rates
    const ratesResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/metal-rates`, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    })

    if (!ratesResponse.ok) {
      throw new Error("Failed to fetch metal rates")
    }

    const ratesData = await ratesResponse.json()
    const { goldRate, silverRate } = ratesData.rates

    const calculation = calculateRealTimePrice({
      weight: Number.parseFloat(weight),
      purity,
      category,
      makingCharges: Number.parseFloat(makingCharges) || 0,
      stoneCharges: Number.parseFloat(stoneCharges) || 0,
      goldRate,
      silverRate,
    })

    return NextResponse.json({ calculation })
  } catch (error) {
    console.error("Error calculating price:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
