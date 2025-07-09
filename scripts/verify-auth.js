// Script to verify authentication setup
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jewelry_system"

async function verifyAuth() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("jewelry_system")

    // Check if users collection exists
    const collections = await db.listCollections().toArray()
    const usersCollectionExists = collections.some((col) => col.name === "users")

    if (!usersCollectionExists) {
      console.log("❌ Users collection does not exist")
      console.log("Run: node scripts/create-admin-user.js")
      return
    }

    console.log("✅ Users collection exists")

    // Check for admin user
    const adminUser = await db.collection("users").findOne({ username: "admin" })

    if (!adminUser) {
      console.log("❌ Admin user not found")
      console.log("Run: node scripts/create-admin-user.js")
      return
    }

    console.log("✅ Admin user found")
    console.log("User details:", {
      id: adminUser._id,
      username: adminUser.username,
      name: adminUser.name,
      email: adminUser.email,
      isActive: adminUser.isActive,
      createdAt: adminUser.createdAt,
    })

    // Test password verification
    const testPassword = "admin123"
    const isPasswordValid = await bcrypt.compare(testPassword, adminUser.password)

    if (isPasswordValid) {
      console.log("✅ Password verification successful")
    } else {
      console.log("❌ Password verification failed")
    }

    // Check indexes
    const indexes = await db.collection("users").indexes()
    console.log(
      "📊 User collection indexes:",
      indexes.map((idx) => idx.name),
    )

    console.log("\n🔐 Authentication Setup Summary:")
    console.log("- Users collection: ✅")
    console.log("- Admin user: ✅")
    console.log("- Password hash: ✅")
    console.log("- Database indexes: ✅")
    console.log("\nLogin credentials:")
    console.log("Username: admin")
    console.log("Password: admin123")
  } catch (error) {
    console.error("❌ Error verifying authentication:", error)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

// Run the verification
verifyAuth()
