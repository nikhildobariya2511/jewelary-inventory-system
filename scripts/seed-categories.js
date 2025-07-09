// MongoDB Seed Script for Categories and Types
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jewelry_system"

async function seedCategories() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("jewelry_system")

    // Clear existing categories
    console.log("Clearing existing categories...")
    await db.collection("categories").deleteMany({})

    // Seed categories
    console.log("Seeding categories...")
    const categories = [
      {
        name: "Gold",
        description: "Gold jewelry items including rings, necklaces, and ornaments",
        type: "category",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Silver",
        description: "Silver jewelry items and accessories",
        type: "category",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Diamond",
        description: "Diamond jewelry and precious stone items",
        type: "category",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Others",
        description: "Other jewelry items including pearls, gemstones, and custom pieces",
        type: "category",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("categories").insertMany(categories)
    console.log(`Inserted ${categories.length} categories`)

    // Seed types
    console.log("Seeding types...")
    const types = [
      {
        name: "Ring",
        description: "Finger rings including engagement, wedding, and fashion rings",
        type: "type",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Necklace",
        description: "Necklaces and pendants of various styles",
        type: "type",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Bangle",
        description: "Traditional and modern bangles",
        type: "type",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Bracelet",
        description: "Bracelets and wrist accessories",
        type: "type",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Earring",
        description: "Earrings including studs, hoops, and danglers",
        type: "type",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Chain",
        description: "Chains for necklaces and bracelets",
        type: "type",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Custom",
        description: "Custom designed jewelry pieces",
        type: "type",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("categories").insertMany(types)
    console.log(`Inserted ${types.length} types`)

    // Create indexes
    console.log("Creating indexes...")
    await db.collection("categories").createIndex({ type: 1, isActive: 1 })
    await db.collection("categories").createIndex({ name: 1, type: 1 }, { unique: true })

    console.log("✅ Categories and types seeding completed successfully!")

    // Display summary
    const categoriesCount = await db.collection("categories").countDocuments({ type: "category" })
    const typesCount = await db.collection("categories").countDocuments({ type: "type" })

    console.log("\n📊 Categories Summary:")
    console.log(`- Categories: ${categoriesCount}`)
    console.log(`- Types: ${typesCount}`)
  } catch (error) {
    console.error("❌ Error seeding categories:", error)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

// Run the seed function
seedCategories()
