// Script to generate and export business reports
import { MongoClient } from "mongodb"
import fs from "fs"
import path from "path"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/jewelry_system"

async function generateReports() {
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    console.log("Connected to MongoDB")

    const db = client.db("jewelry_system")

    // Create reports directory
    const reportsDir = path.join(process.cwd(), "reports")
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().split("T")[0]

    console.log("📊 Generating business reports...")

    // 1. Inventory Report
    console.log("📦 Generating inventory report...")
    const inventory = await db.collection("inventory").find({}).toArray()

    const inventoryReport = {
      generatedAt: new Date().toISOString(),
      totalItems: inventory.length,
      totalValue: inventory.reduce((sum, item) => sum + item.salePrice * item.quantity, 0),
      lowStockItems: inventory.filter((item) => item.quantity <= item.minStockLevel),
      categoryBreakdown: {},
      typeBreakdown: {},
    }

    // Category and type breakdown
    inventory.forEach((item) => {
      // Category breakdown
      if (!inventoryReport.categoryBreakdown[item.category]) {
        inventoryReport.categoryBreakdown[item.category] = {
          count: 0,
          totalValue: 0,
          totalQuantity: 0,
        }
      }
      inventoryReport.categoryBreakdown[item.category].count++
      inventoryReport.categoryBreakdown[item.category].totalValue += item.salePrice * item.quantity
      inventoryReport.categoryBreakdown[item.category].totalQuantity += item.quantity

      // Type breakdown
      if (!inventoryReport.typeBreakdown[item.type]) {
        inventoryReport.typeBreakdown[item.type] = {
          count: 0,
          totalValue: 0,
          totalQuantity: 0,
        }
      }
      inventoryReport.typeBreakdown[item.type].count++
      inventoryReport.typeBreakdown[item.type].totalValue += item.salePrice * item.quantity
      inventoryReport.typeBreakdown[item.type].totalQuantity += item.quantity
    })

    fs.writeFileSync(
      path.join(reportsDir, `inventory_report_${timestamp}.json`),
      JSON.stringify(inventoryReport, null, 2),
    )

    // 2. Sales Report
    console.log("💰 Generating sales report...")
    const bills = await db.collection("bills").find({}).toArray()

    const salesReport = {
      generatedAt: new Date().toISOString(),
      totalBills: bills.length,
      totalRevenue: bills.reduce((sum, bill) => sum + (bill.totals?.totalAmount || 0), 0),
      paidBills: bills.filter((bill) => bill.status === "paid").length,
      pendingBills: bills.filter((bill) => bill.status === "pending").length,
      cancelledBills: bills.filter((bill) => bill.status === "cancelled").length,
      averageOrderValue: 0,
      monthlyBreakdown: {},
      topCustomers: [],
    }

    if (salesReport.totalBills > 0) {
      salesReport.averageOrderValue = salesReport.totalRevenue / salesReport.totalBills
    }

    // Monthly breakdown
    bills.forEach((bill) => {
      const month = new Date(bill.createdAt).toISOString().substring(0, 7) // YYYY-MM
      if (!salesReport.monthlyBreakdown[month]) {
        salesReport.monthlyBreakdown[month] = {
          bills: 0,
          revenue: 0,
        }
      }
      salesReport.monthlyBreakdown[month].bills++
      salesReport.monthlyBreakdown[month].revenue += bill.totals?.totalAmount || 0
    })

    // Top customers by revenue
    const customerRevenue = {}
    bills.forEach((bill) => {
      const customerName = bill.customer.name
      if (!customerRevenue[customerName]) {
        customerRevenue[customerName] = {
          name: customerName,
          phone: bill.customer.phone,
          totalRevenue: 0,
          totalBills: 0,
        }
      }
      customerRevenue[customerName].totalRevenue += bill.totals?.totalAmount || 0
      customerRevenue[customerName].totalBills++
    })

    salesReport.topCustomers = Object.values(customerRevenue)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10)

    fs.writeFileSync(path.join(reportsDir, `sales_report_${timestamp}.json`), JSON.stringify(salesReport, null, 2))

    // 3. Profit Analysis Report
    console.log("📈 Generating profit analysis report...")
    const profitReport = {
      generatedAt: new Date().toISOString(),
      totalRevenue: salesReport.totalRevenue,
      totalCost: 0,
      grossProfit: 0,
      profitMargin: 0,
      itemProfitability: [],
    }

    // Calculate total cost and item profitability
    const itemSales = {}
    bills.forEach((bill) => {
      ;(bill.items || []).forEach((item) => {
        if (!itemSales[item.name]) {
          itemSales[item.name] = {
            name: item.name,
            totalSold: 0,
            totalRevenue: 0,
            totalCost: 0,
          }
        }
        itemSales[item.name].totalSold += item.pieces || 1
        itemSales[item.name].totalRevenue += item.total || 0

        // Find cost from inventory
        const inventoryItem = inventory.find((inv) => inv.name === item.name)
        if (inventoryItem) {
          itemSales[item.name].totalCost += inventoryItem.costPrice * (item.pieces || 1)
        }
      })
    })

    profitReport.totalCost = Object.values(itemSales).reduce((sum, item) => sum + item.totalCost, 0)
    profitReport.grossProfit = profitReport.totalRevenue - profitReport.totalCost
    profitReport.profitMargin =
      profitReport.totalRevenue > 0 ? (profitReport.grossProfit / profitReport.totalRevenue) * 100 : 0

    profitReport.itemProfitability = Object.values(itemSales)
      .map((item) => ({
        ...item,
        profit: item.totalRevenue - item.totalCost,
        profitMargin: item.totalRevenue > 0 ? ((item.totalRevenue - item.totalCost) / item.totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.profit - a.profit)

    fs.writeFileSync(path.join(reportsDir, `profit_analysis_${timestamp}.json`), JSON.stringify(profitReport, null, 2))

    // Generate summary report
    const summaryReport = {
      generatedAt: new Date().toISOString(),
      period: `As of ${timestamp}`,
      inventory: {
        totalItems: inventoryReport.totalItems,
        totalValue: inventoryReport.totalValue,
        lowStockItems: inventoryReport.lowStockItems.length,
      },
      sales: {
        totalBills: salesReport.totalBills,
        totalRevenue: salesReport.totalRevenue,
        averageOrderValue: salesReport.averageOrderValue,
      },
      profit: {
        grossProfit: profitReport.grossProfit,
        profitMargin: profitReport.profitMargin,
      },
    }

    fs.writeFileSync(
      path.join(reportsDir, `business_summary_${timestamp}.json`),
      JSON.stringify(summaryReport, null, 2),
    )

    console.log("✅ Reports generated successfully!")
    console.log(`📁 Reports saved in: ${reportsDir}`)
    console.log("\n📊 Business Summary:")
    console.log(`- Total Inventory Value: ₹${inventoryReport.totalValue.toLocaleString()}`)
    console.log(`- Total Revenue: ₹${salesReport.totalRevenue.toLocaleString()}`)
    console.log(`- Gross Profit: ₹${profitReport.grossProfit.toLocaleString()}`)
    console.log(`- Profit Margin: ${profitReport.profitMargin.toFixed(2)}%`)
    console.log(`- Low Stock Items: ${inventoryReport.lowStockItems.length}`)
  } catch (error) {
    console.error("❌ Error generating reports:", error)
  } finally {
    await client.close()
    console.log("Database connection closed")
  }
}

// Run the report generation
generateReports()
