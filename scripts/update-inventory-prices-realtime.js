// Script to update inventory prices with real-time rates and purity calculations
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jewelry_system"

const PURITY_MAP = {
  "24k": 1,
  "22k": 22 / 24,
  "18k": 18 / 24,
  "14k": 14 / 24,
  "10k": 10 / 24,
  "925 Silver": 0.925,
  "999 Silver": 0.999,
}

// Simulate real-time rate fetching
const fetchRealTimeRates = async () => {
  // In production, replace with actual API calls
  const baseGoldRate = 6800
  const baseSilverRate = 85

  const goldVariation = (Math.random() - 0.5) * 0.04 * baseGoldRate
  const silverVariation = (Math.random() - 0.5) * 0.04 * baseSilverRate

  return {
    gold: Math.round((baseGoldRate + goldVariation) * 100) / 100,
    silver: Math.round((baseSilverRate + silverVariation) * 100) / 100,
  }
}

const calculateRealTimePrice = (item, goldRate, silverRate) => {
  let basePrice = 0
  let purityAdjustedPrice = 0

  if (item.category === "Gold") {
    basePrice = item.weight * goldRate
    const purityMultiplier = PURITY_MAP[item.purity] || 1
    purityAdjustedPrice = basePrice * purityMultiplier
  } else if (item.category === "Silver") {
    basePrice = item.weight * silverRate
    const purityMultiplier = PURITY_MAP[item.purity] || 1
    purityAdjustedPrice = basePrice * purityMultiplier
  } else {
    // For Diamond and Others, keep existing cost price as base
    purityAdjustedPrice = item.costPrice - item.makingCharges - item.stoneCharges
  }

  const newCostPrice = purityAdjustedPrice + item.makingCharges + item.stoneCharges
  const profitMargin = 0.2 // 20% profit margin
  const newSalePrice = Math.round(newCostPrice * (1 + profitMargin))

  return {
    costPrice: Math.round(newCostPrice),
    salePrice: newSalePrice,
    basePrice: Math.round(basePrice),
    purityAdjustedPrice: Math.round(purityAdjustedPrice),
  }
}

async function updateInventoryPricesRealTime() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("jewelry_system")

    // Fetch real-time rates
    const liveRates = await fetchRealTimeRates()
    console.log(`📊 Real-time Rates - Gold: ₹${liveRates.gold}/g, Silver: ₹${liveRates.silver}/g`)

    // Get all inventory items
    const inventoryItems = await db.collection("inventory").find({}).toArray()
    console.log(`📦 Found ${inventoryItems.length} inventory items`)

    let updatedCount = 0

    for (const item of inventoryItems) {
      const newPrices = calculateRealTimePrice(item, liveRates.gold, liveRates.silver)

      // Update only if prices have changed significantly (more than 5% difference)
      const costDifference = Math.abs(newPrices.costPrice - item.costPrice) / item.costPrice
      const saleDifference = Math.abs(newPrices.salePrice - item.salePrice) / item.salePrice

      if (costDifference > 0.05 || saleDifference > 0.05) {
        await db.collection("inventory").updateOne(
          { _id: item._id },
          {
            $set: {
              costPrice: newPrices.costPrice,
              salePrice: newPrices.salePrice,
              updatedAt: new Date(),
              priceUpdatedAt: new Date(),
              lastRates: {
                gold: liveRates.gold,
                silver: liveRates.silver,
                updatedAt: new Date(),
              },
            },
          },
        )

        console.log(
          `✅ Updated ${item.name} (${item.purity}): Cost ₹${item.costPrice} → ₹${newPrices.costPrice}, Sale ₹${item.salePrice} → ₹${newPrices.salePrice}`,
        )
        updatedCount++
      }
    }

    // Update system settings with new rates
    await db.collection("settings").updateOne(
      { type: "system" },
      {
        $set: {
          "data.rates.goldRate": liveRates.gold,
          "data.rates.silverRate": liveRates.silver,
          "data.rates.lastUpdated": new Date().toISOString(),
          updatedAt: new Date(),
        },
      },
    )

    console.log(`\n📊 Real-time price update completed!`)
    console.log(`- Total items processed: ${inventoryItems.length}`)
    console.log(`- Items updated: ${updatedCount}`)
    console.log(`- Items unchanged: ${inventoryItems.length - updatedCount}`)
    console.log(`- Gold rate: ₹${liveRates.gold}/g`)
    console.log(`- Silver rate: ₹${liveRates.silver}/g`)
  } catch (error) {
    console.error("❌ Error updating inventory prices:", error)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

// Run the price update
updateInventoryPricesRealTime()
