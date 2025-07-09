// Database backup script for jewelry inventory system
import { MongoClient } from "mongodb"
import fs from "fs"
import path from "path"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jewelry_system"

async function backupDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB for backup")

    const db = client.db("jewelry_system")

    // Create backup directory
    const backupDir = path.join(process.cwd(), "backups")
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
    const backupFile = path.join(backupDir, `jewelry_backup_${timestamp}.json`)

    console.log("Creating backup...")

    // Backup all collections
    const collections = ["inventory", "bills", "settings", "users"]
    const backupData = {}

    for (const collectionName of collections) {
      try {
        const data = await db.collection(collectionName).find({}).toArray()
        backupData[collectionName] = data
        console.log(`✅ Backed up ${data.length} documents from ${collectionName}`)
      } catch (error) {
        console.log(`⚠️  Collection ${collectionName} not found or empty`)
        backupData[collectionName] = []
      }
    }

    // Add metadata
    backupData._metadata = {
      backupDate: new Date().toISOString(),
      version: "1.0",
      collections: collections,
      totalDocuments: Object.values(backupData).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0),
    }

    // Write backup file
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2))

    console.log(`✅ Backup completed successfully!`)
    console.log(`📁 Backup file: ${backupFile}`)
    console.log(`📊 Total documents backed up: ${backupData._metadata.totalDocuments}`)
  } catch (error) {
    console.error("❌ Error creating backup:", error)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

// Run the backup
backupDatabase()
