"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import RealTimeRatesDisplay from "@/components/common/real-time-rates-display"
import { calculateRealTimePrice } from "@/lib/price-utils"

interface BillItem {
  inventoryId: string
  name: string
  hsnCode: string
  pieces: number
  grossWeight: number
  netWeight: number
  rate: number
  amount: number
  otherCharges: number
  total: number
}

interface Bill {
  _id: string
  billNumber: string
  customer: {
    name: string
    phone: string
    address: string
  }
  items: BillItem[]
  totals: {
    netAmount: number
    igstAmount: number
    cgstAmount: number
    sgstAmount: number
    totalAmount: number
  }
  taxSettings: {
    igst: number
    cgst: number
    sgst: number
  }
  status: string
  createdAt: string
}

interface InventoryItem {
  _id: string
  name: string
  category: string
  type: string
  weight: number
  salePrice: number
  quantity: number
  purity?: string
}

interface EditBillFormProps {
  billId: string
}

export default function EditBillForm({ billId }: EditBillFormProps) {
  const [bill, setBill] = useState<Bill | null>(null)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState("")
  const [metalRates, setMetalRates] = useState({ goldRate: 0, silverRate: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchBill()
    fetchInventoryItems()
    fetchMetalRates()
  }, [billId])

  const fetchBill = async () => {
    try {
      const response = await fetch(`/api/bills/${billId}`)
      if (response.ok) {
        const data = await response.json()
        setBill(data.bill)
      } else {
        throw new Error("Bill not found")
      }
    } catch (error) {
      console.error("Error fetching bill:", error)
      toast({ title: "Error", description: "Failed to fetch bill details", variant: "destructive" })
      router.push("/billing")
    } finally {
      setLoading(false)
    }
  }

  const fetchInventoryItems = async () => {
    try {
      const response = await fetch("/api/inventory")
      if (response.ok) {
        const data = await response.json()
        setInventoryItems(data.items.filter((item: InventoryItem) => item.quantity > 0))
      }
    } catch (error) {
      console.error("Error fetching inventory:", error)
    }
  }

  const fetchMetalRates = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings?.rates) {
          setMetalRates(data.settings.rates)
        }
      }
    } catch (error) {
      console.error("Error fetching metal rates:", error)
    }
  }

  const getRealTimePrice = (item: InventoryItem, weight: number) => {
    const result = calculateRealTimePrice({
      weight,
      purity: item.purity || "22k",
      category: item.category as "Gold" | "Silver" | "Diamond" | "Others",
      makingCharges: 0,
      stoneCharges: 0,
      goldRate: metalRates.goldRate,
      silverRate: metalRates.silverRate,
    })
    return result.salePrice
  }

  const addItemToBill = () => {
    if (!selectedItem || !bill) return

    const item = inventoryItems.find((inv) => inv._id === selectedItem)
    if (!item) return

    const realTimeRate = getRealTimePrice(item, item.weight)

    const newBillItem: BillItem = {
      inventoryId: item._id,
      name: item.name,
      hsnCode: "71131900",
      pieces: 1,
      grossWeight: item.weight,
      netWeight: item.weight,
      rate: realTimeRate,
      amount: realTimeRate,
      otherCharges: 0,
      total: realTimeRate,
    }

    setBill({ ...bill, items: [...bill.items, newBillItem] })
    setSelectedItem("")
  }

  const updateBillItem = (index: number, field: keyof BillItem, value: number | string) => {
    if (!bill) return
    const updatedItems = [...bill.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    if (field === "pieces" || field === "rate" || field === "otherCharges") {
      const item = updatedItems[index]
      item.amount = item.pieces * item.rate
      item.total = item.amount + item.otherCharges
    }

    setBill({ ...bill, items: updatedItems })
  }

  const removeBillItem = (index: number) => {
    if (!bill) return
    setBill({ ...bill, items: bill.items.filter((_, i) => i !== index) })
  }

  const calculateTotals = () => {
    if (!bill) return { netAmount: 0, igstAmount: 0, cgstAmount: 0, sgstAmount: 0, totalAmount: 0 }
    const netAmount = bill.items.reduce((sum, item) => sum + item.total, 0)
    const igstAmount = netAmount * (bill.taxSettings.igst / 100)
    const cgstAmount = netAmount * (bill.taxSettings.cgst / 100)
    const sgstAmount = netAmount * (bill.taxSettings.sgst / 100)
    const totalAmount = netAmount + igstAmount + cgstAmount + sgstAmount
    return { netAmount, igstAmount, cgstAmount, sgstAmount, totalAmount }
  }

  const updateBillStatus = (status: string) => {
    if (!bill) return
    setBill({ ...bill, status })
  }

  const saveBill = async () => {
    if (!bill) return
    setSaving(true)
    try {
      const totals = calculateTotals()
      const updatedBill = { ...bill, totals, updatedAt: new Date() }
      const response = await fetch(`/api/bills/${billId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedBill),
      })
      if (response.ok) {
        toast({ title: "Success", description: "Bill updated successfully" })
        router.push(`/billing/${billId}`)
      } else throw new Error("Failed to update bill")
    } catch (error) {
      console.error("Error updating bill:", error)
      toast({ title: "Error", description: "Failed to update bill", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading bill details...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!bill) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bill not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested bill could not be found.</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bill
          </Button>
          <h2 className="text-2xl font-bold">Edit Bill #{bill.billNumber}</h2>
          <div className="flex items-center space-x-2 mt-2">
            <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
            <span className="text-muted-foreground">Created on {new Date(bill.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={bill.customer.name}
                onChange={(e) => setBill({ ...bill, customer: { ...bill.customer, name: e.target.value } })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={bill.customer.phone}
                onChange={(e) => setBill({ ...bill, customer: { ...bill.customer, phone: e.target.value } })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Textarea
                id="customerAddress"
                value={bill.customer.address}
                onChange={(e) => setBill({ ...bill, customer: { ...bill.customer, address: e.target.value } })}
                className="min-h-[40px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Items */}
      <Card>
        <CardHeader>
          <CardTitle>Add Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <Select value={selectedItem} onValueChange={setSelectedItem}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an item from inventory" />
                </SelectTrigger>
                <SelectContent>
                  {inventoryItems.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {item.name} - {item.category} (₹{calculateRealTimePrice({
                        weight: item.weight,
                        purity: item.purity || "22k",
                        category: item.category as "Gold" | "Silver" | "Diamond" | "Others",
                        makingCharges: 0,
                        stoneCharges: 0,
                        goldRate: metalRates.goldRate,
                        silverRate: metalRates.silverRate,
                      }).salePrice}/piece)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addItemToBill} disabled={!selectedItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="mb-4">
            <RealTimeRatesDisplay onRatesUpdate={(rates) => setMetalRates(rates)} showRefresh={true} />
          </div>

          {/* Real-time rates display */}
          {/* <div className="flex items-center space-x-4 p-3 bg-blue-50 rounded-lg mb-4">
            <Calculator className="h-5 w-5 text-blue-600" />
            <div className="text-sm">
              <span className="font-medium">Current Rates:</span>
              <span className="ml-2">Gold: ₹{metalRates.goldRate}/g</span>
              <span className="ml-4">Silver: ₹{metalRates.silverRate}/g</span>
            </div>
          </div> */}

          {/* Bill Items Table */}
          {bill.items.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.No</TableHead>
                    <TableHead>Item Description</TableHead>
                    <TableHead>HSN Code</TableHead>
                    <TableHead>Pcs</TableHead>
                    <TableHead>Gr Wt</TableHead>
                    <TableHead>Net Wt</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Other Chg</TableHead>
                    <TableHead>TOTAL</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Input
                          value={item.hsnCode}
                          onChange={(e) => updateBillItem(index, "hsnCode", e.target.value)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.pieces}
                          onChange={(e) => updateBillItem(index, "pieces", Number.parseFloat(e.target.value) || 0)}
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.grossWeight}
                          onChange={(e) => updateBillItem(index, "grossWeight", Number.parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.netWeight}
                          onChange={(e) => updateBillItem(index, "netWeight", Number.parseFloat(e.target.value) || 0)}
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateBillItem(index, "rate", Number.parseFloat(e.target.value) || 0)}
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>₹{item.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.otherCharges}
                          onChange={(e) =>
                            updateBillItem(index, "otherCharges", Number.parseFloat(e.target.value) || 0)
                          }
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell className="font-medium">₹{item.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => removeBillItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bill Summary */}
      {bill.items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bill Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-w-md ml-auto">
              <div className="flex justify-between">
                <span>Net Amount:</span>
                <span>₹{totals.netAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>IGST ({bill.taxSettings.igst}%):</span>
                <span>₹{totals.igstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST ({bill.taxSettings.cgst}%):</span>
                <span>₹{totals.cgstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST ({bill.taxSettings.sgst}%):</span>
                <span>₹{totals.sgstAmount.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total Amount:</span>
                  <span>₹{totals.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Management */}
      <Card>
        <CardHeader>
          <CardTitle>Bill Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select value={bill.status} onValueChange={updateBillStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button onClick={saveBill} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
