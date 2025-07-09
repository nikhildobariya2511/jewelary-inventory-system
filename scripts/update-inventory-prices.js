// Script to update inventory prices based on current metal rates
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jewelry_system"

async function updateInventoryPrices() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("jewelry_system")

    // Get current metal rates from settings
    const settings = await db.collection("settings").findOne({ type: "system" })

    if (!settings || !settings.data.rates) {
      console.error("❌ Metal rates not found in settings")
      return
    }

    const { goldRate, silverRate } = settings.data.rates
    console.log(`📊 Current Rates - Gold: ₹${goldRate}/g, Silver: ₹${silverRate}/g`)

    // Get all inventory items
    const inventoryItems = await db.collection("inventory").find({}).toArray()
    console.log(`📦 Found ${inventoryItems.length} inventory items`)

    let updatedCount = 0

    for (const item of inventoryItems) {
      let basePrice = 0

      // Calculate base price based on category and weight
      if (item.category === "Gold") {
        basePrice = item.weight * goldRate
      } else if (item.category === "Silver") {
        basePrice = item.weight * silverRate
      } else {
        // For Diamond and Others, keep existing cost price as base
        basePrice = item.costPrice - item.makingCharges - item.stoneCharges
      }

      // Calculate new cost and sale prices
      const newCostPrice = basePrice + item.makingCharges + item.stoneCharges
      const profitMargin = 0.2 // 20% profit margin
      const newSalePrice = Math.round(newCostPrice * (1 + profitMargin))

      // Update only if prices have changed significantly (more than 5% difference)
      const costDifference = Math.abs(newCostPrice - item.costPrice) / item.costPrice
      const saleDifference = Math.abs(newSalePrice - item.salePrice) / item.salePrice

      if (costDifference > 0.05 || saleDifference > 0.05) {
        await db.collection("inventory").updateOne(
          { _id: item._id },
          {
            $set: {
              costPrice: newCostPrice,
              salePrice: newSalePrice,
              updatedAt: new Date(),
              priceUpdatedAt: new Date(),
            },
          },
        )

        console.log(
          `✅ Updated ${item.name}: Cost ₹${item.costPrice} → ₹${newCostPrice}, Sale ₹${item.salePrice} → ₹${newSalePrice}`,
        )
        updatedCount++
      }
    }

    console.log(`\n📊 Price update completed!`)
    console.log(`- Total items processed: ${inventoryItems.length}`)
    console.log(`- Items updated: ${updatedCount}`)
    console.log(`- Items unchanged: ${inventoryItems.length - updatedCount}`)
  } catch (error) {
    console.error("❌ Error updating inventory prices:", error)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

// Run the price update
updateInventoryPrices()
