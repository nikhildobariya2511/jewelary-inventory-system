// MongoDB Seed Script for Jewelry Inventory System
import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jewelry_system"

async function seedDatabase() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("jewelry_system")

    // Clear existing data
    console.log("Clearing existing data...")
    await db.collection("inventory").deleteMany({})
    await db.collection("bills").deleteMany({})
    await db.collection("settings").deleteMany({})

    // Seed inventory data
    console.log("Seeding inventory data...")
    const inventoryItems = [
      {
        name: "Gold Wedding Ring",
        category: "Gold",
        type: "Ring",
        weight: 5.5,
        purity: "22k",
        makingCharges: 2500,
        stoneCharges: 0,
        quantity: 15,
        costPrice: 35000,
        salePrice: 42000,
        minStockLevel: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Diamond Engagement Ring",
        category: "Diamond",
        type: "Ring",
        weight: 3.2,
        purity: "18k",
        makingCharges: 5000,
        stoneCharges: 15000,
        quantity: 8,
        costPrice: 85000,
        salePrice: 125000,
        minStockLevel: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Gold Chain Necklace",
        category: "Gold",
        type: "Chain",
        weight: 12.8,
        purity: "22k",
        makingCharges: 4500,
        stoneCharges: 0,
        quantity: 20,
        costPrice: 78000,
        salePrice: 95000,
        minStockLevel: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Silver Bracelet",
        category: "Silver",
        type: "Bracelet",
        weight: 25.0,
        purity: "925 Silver",
        makingCharges: 800,
        stoneCharges: 0,
        quantity: 12,
        costPrice: 3500,
        salePrice: 5200,
        minStockLevel: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Gold Earrings Set",
        category: "Gold",
        type: "Earring",
        weight: 4.2,
        purity: "18k",
        makingCharges: 1800,
        stoneCharges: 2500,
        quantity: 25,
        costPrice: 28000,
        salePrice: 35000,
        minStockLevel: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Traditional Gold Bangle",
        category: "Gold",
        type: "Bangle",
        weight: 18.5,
        purity: "22k",
        makingCharges: 6500,
        stoneCharges: 0,
        quantity: 6,
        costPrice: 115000,
        salePrice: 140000,
        minStockLevel: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Pearl Necklace",
        category: "Others",
        type: "Necklace",
        weight: 45.0,
        purity: "Natural Pearl",
        makingCharges: 2000,
        stoneCharges: 8000,
        quantity: 4,
        costPrice: 25000,
        salePrice: 38000,
        minStockLevel: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Men's Gold Ring",
        category: "Gold",
        type: "Ring",
        weight: 8.2,
        purity: "22k",
        makingCharges: 3200,
        stoneCharges: 0,
        quantity: 10,
        costPrice: 52000,
        salePrice: 62000,
        minStockLevel: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Silver Chain",
        category: "Silver",
        type: "Chain",
        weight: 35.5,
        purity: "925 Silver",
        makingCharges: 1200,
        stoneCharges: 0,
        quantity: 18,
        costPrice: 4800,
        salePrice: 7200,
        minStockLevel: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Diamond Stud Earrings",
        category: "Diamond",
        type: "Earring",
        weight: 2.1,
        purity: "18k",
        makingCharges: 3500,
        stoneCharges: 25000,
        quantity: 3,
        costPrice: 65000,
        salePrice: 95000,
        minStockLevel: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    await db.collection("inventory").insertMany(inventoryItems)
    console.log(`Inserted ${inventoryItems.length} inventory items`)

    // Seed sample bills
    console.log("Seeding sample bills...")
    const sampleBills = [
      {
        billNumber: "INV240101001",
        customer: {
          name: "Rajesh Kumar",
          phone: "9876543210",
          address: "123 Main Street, Mumbai, Maharashtra",
        },
        items: [
          {
            inventoryId: "sample_id_1",
            name: "Gold Wedding Ring",
            hsnCode: "71131900",
            pieces: 1,
            grossWeight: 5.5,
            netWeight: 5.5,
            rate: 42000,
            amount: 42000,
            otherCharges: 0,
            total: 42000,
          },
        ],
        totals: {
          netAmount: 42000,
          igstAmount: 1260,
          cgstAmount: 630,
          sgstAmount: 630,
          totalAmount: 44520,
        },
        taxSettings: {
          igst: 3.0,
          cgst: 1.5,
          sgst: 1.5,
        },
        status: "paid",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        billNumber: "INV240102002",
        customer: {
          name: "Priya Sharma",
          phone: "9123456789",
          address: "456 Park Avenue, Delhi",
        },
        items: [
          {
            inventoryId: "sample_id_2",
            name: "Diamond Engagement Ring",
            hsnCode: "71131900",
            pieces: 1,
            grossWeight: 3.2,
            netWeight: 3.2,
            rate: 125000,
            amount: 125000,
            otherCharges: 2000,
            total: 127000,
          },
        ],
        totals: {
          netAmount: 127000,
          igstAmount: 3810,
          cgstAmount: 1905,
          sgstAmount: 1905,
          totalAmount: 134620,
        },
        taxSettings: {
          igst: 3.0,
          cgst: 1.5,
          sgst: 1.5,
        },
        status: "pending",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        billNumber: "INV240103003",
        customer: {
          name: "Amit Patel",
          phone: "9988776655",
          address: "789 Garden Road, Ahmedabad, Gujarat",
        },
        items: [
          {
            inventoryId: "sample_id_3",
            name: "Gold Chain Necklace",
            hsnCode: "71131900",
            pieces: 1,
            grossWeight: 12.8,
            netWeight: 12.8,
            rate: 95000,
            amount: 95000,
            otherCharges: 1500,
            total: 96500,
          },
          {
            inventoryId: "sample_id_5",
            name: "Gold Earrings Set",
            hsnCode: "71131900",
            pieces: 1,
            grossWeight: 4.2,
            netWeight: 4.2,
            rate: 35000,
            amount: 35000,
            otherCharges: 0,
            total: 35000,
          },
        ],
        totals: {
          netAmount: 131500,
          igstAmount: 3945,
          cgstAmount: 1972.5,
          sgstAmount: 1972.5,
          totalAmount: 139390,
        },
        taxSettings: {
          igst: 3.0,
          cgst: 1.5,
          sgst: 1.5,
        },
        status: "paid",
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]

    await db.collection("bills").insertMany(sampleBills)
    console.log(`Inserted ${sampleBills.length} sample bills`)

    // Seed system settings
    console.log("Seeding system settings...")
    const systemSettings = {
      type: "system",
      data: {
        shop: {
          name: "Ehvara Jewels",
          address: "1st floor Nutan Estate, katargam, surat 395004",
          phone: "9099315455 | 7359631655",
          gst: "24GAXPB5845P1ZT",
          logo: null,
        },
        tax: {
          igst: 3.0,
          cgst: 1.5,
          sgst: 1.5,
        },
        rates: {
          goldRate: 6800.0,
          silverRate: 85.0,
          lastUpdated: new Date().toISOString(),
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.collection("settings").insertOne(systemSettings)
    console.log("Inserted system settings")

    // Create indexes for better performance
    console.log("Creating database indexes...")

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

    console.log("Database indexes created")

    console.log("✅ Database seeding completed successfully!")

    // Display summary
    const inventoryCount = await db.collection("inventory").countDocuments()
    const billsCount = await db.collection("bills").countDocuments()
    const settingsCount = await db.collection("settings").countDocuments()

    console.log("\n📊 Database Summary:")
    console.log(`- Inventory Items: ${inventoryCount}`)
    console.log(`- Sample Bills: ${billsCount}`)
    console.log(`- Settings Records: ${settingsCount}`)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

// Run the seed function
seedDatabase()
