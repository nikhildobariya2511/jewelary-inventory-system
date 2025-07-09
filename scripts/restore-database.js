// Database restore script for jewelry inventory system
import { MongoClient } from "mongodb"
import fs from "fs"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jewelry_system"

async function restoreDatabase(backupFilePath) {
  if (!backupFilePath) {
    console.error("❌ Please provide backup file path as argument")
    console.log("Usage: node restore-database.js <backup-file-path>")
    return
  }

  if (!fs.existsSync(backupFilePath)) {
    console.error(`❌ Backup file not found: ${backupFilePath}`)
    return
  }

  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB for restore")

    const db = client.db("jewelry_system")

    // Read backup file
    console.log(`📖 Reading backup file: ${backupFilePath}`)
    const backupData = JSON.parse(fs.readFileSync(backupFilePath, "utf8"))

    if (!backupData._metadata) {
      console.error("❌ Invalid backup file format")
      return
    }

    console.log(`📅 Backup created on: ${backupData._metadata.backupDate}`)
    console.log(`📊 Total documents to restore: ${backupData._metadata.totalDocuments}`)

    // Confirm restore
    console.log("\n⚠️  This will replace all existing data in the database!")

    // Restore collections
    const collections = backupData._metadata.collections || ["inventory", "bills", "settings", "users"]

    for (const collectionName of collections) {
      if (backupData[collectionName] && Array.isArray(backupData[collectionName])) {
        const data = backupData[collectionName]

        if (data.length > 0) {
          // Clear existing data
          await db.collection(collectionName).deleteMany({})
          console.log(`🗑️  Cleared existing data from ${collectionName}`)

          // Insert backup data
          await db.collection(collectionName).insertMany(data)
          console.log(`✅ Restored ${data.length} documents to ${collectionName}`)
        } else {
          console.log(`⚠️  No data to restore for ${collectionName}`)
        }
      }
    }

    // Recreate indexes
    console.log("🔧 Recreating database indexes...")

    // Inventory indexes
    await db.collection("inventory").createIndex({ category: 1 })
    await db.collection("inventory").createIndex({ type: 1 })
    await db.collection("inventory").createIndex({ name: "text" })
    await db.collection("inventory").createIndex({ quantity: 1, minStockLevel: 1 })

    // Bills indexes
    await db.collection("bills").createIndex({ billNumber: 1 }, { unique: true })
    await db.collection("bills").createIndex({ "customer.name": "text", "customer.phone": "text" })
    await db.collection("bills").createIndex({ createdAt: -1 })
    await db.collection("bills").createIndex({ status: 1 })

    // Settings indexes
    await db.collection("settings").createIndex({ type: 1 }, { unique: true })

    // Users indexes
    await db.collection("users").createIndex({ username: 1 }, { unique: true })

    console.log("✅ Database restore completed successfully!")
  } catch (error) {
    console.error("❌ Error restoring database:", error)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

// Get backup file path from command line arguments
const backupFilePath = process.argv[2]
restoreDatabase(backupFilePath)
