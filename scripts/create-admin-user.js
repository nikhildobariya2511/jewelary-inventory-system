// Script to create admin user for the jewelry system
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jewelry_system"

async function createAdminUser() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("jewelry_system")

    // Check if users collection exists, if not create it
    const collections = await db.listCollections().toArray()
    const usersCollectionExists = collections.some((col) => col.name === "users")

    if (!usersCollectionExists) {
      await db.createCollection("users")
      console.log("Created users collection")
    }

    // Check if admin user already exists
    const existingAdmin = await db.collection("users").findOne({ username: "admin" })

    if (existingAdmin) {
      console.log("Admin user already exists")
      console.log("Username: admin")
      console.log("Password: admin123")

      // Update password if needed (for testing)
      const hashedPassword = await bcrypt.hash("admin123", 12)
      await db.collection("users").updateOne(
        { username: "admin" },
        {
          $set: {
            password: hashedPassword,
            updatedAt: new Date(),
          },
        },
      )
      console.log("✅ Admin password updated")
      return
    }

    // Create admin user
    console.log("Creating new admin user...")
    const hashedPassword = await bcrypt.hash("admin123", 12)

    const adminUser = {
      username: "admin",
      password: hashedPassword,
      name: "Admin User",
      email: "admin@jewelry.com",
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("users").insertOne(adminUser)
    console.log("✅ Admin user created successfully!")
    console.log("User ID:", result.insertedId)
    console.log("Username: admin")
    console.log("Password: admin123")

    // Create index on username
    await db.collection("users").createIndex({ username: 1 }, { unique: true })
    console.log("Created unique index on username")

    // Verify the user was created
    const verifyUser = await db.collection("users").findOne({ username: "admin" })
    if (verifyUser) {
      console.log("✅ User verification successful")
      console.log("Stored user:", {
        id: verifyUser._id,
        username: verifyUser.username,
        name: verifyUser.name,
        email: verifyUser.email,
        isActive: verifyUser.isActive,
      })
    }
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

// Run the function
createAdminUser()
