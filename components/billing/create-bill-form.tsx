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
import { Plus, Trash2, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import InvoicePreview from "./invoice-preview"
import { calculateRealTimePrice } from "@/lib/price-calculator"
import RealTimeRatesDisplay from "@/components/common/real-time-rates-display"

interface InventoryItem {
  _id: string
  name: string
  category: string
  type: string
  weight: number
  purity: string
  salePrice: number
  quantity: number
}

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

interface CustomerInfo {
  name: string
  phone: string
  address: string
}

export default function CreateBillForm() {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
  })
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(false)
  const [taxSettings, setTaxSettings] = useState({
    igst: 3.0,
    cgst: 1.5,
    sgst: 1.5,
  })
  const { toast } = useToast()
  const router = useRouter()
  const [metalRates, setMetalRates] = useState({
    goldRate: 6100,
    silverRate: 75000,
  })

  useEffect(() => {
    fetchInventoryItems()
    fetchTaxSettings()
  }, [])

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

  const fetchTaxSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings?.tax) {
          setTaxSettings(data.settings.tax)
        }
      }
    } catch (error) {
      console.error("Error fetching tax settings:", error)
    }
  }

  const addItemToBill = () => {
    if (!selectedItem) return

    const item = inventoryItems.find((inv) => inv._id === selectedItem)
    if (!item) return

    // Calculate real-time price with purity
    const realTimePrice = calculateRealTimePrice({
      weight: item.weight,
      purity: item.purity,
      category: item.category as "Gold" | "Silver" | "Diamond" | "Others",
      makingCharges: 0, // Can be added later
      stoneCharges: 0, // Can be added later
      goldRate: metalRates.goldRate,
      silverRate: metalRates.silverRate,
    })

    const newBillItem: BillItem = {
      inventoryId: item._id,
      name: item.name,
      hsnCode: "71131900",
      pieces: 1,
      grossWeight: item.weight,
      netWeight: item.weight,
      rate: realTimePrice.salePrice,
      amount: realTimePrice.salePrice,
      otherCharges: 0,
      total: realTimePrice.salePrice,
    }

    setBillItems([...billItems, newBillItem])
    setSelectedItem("")
  }

  const updateBillItem = (index: number, field: keyof BillItem, value: number) => {
    const updatedItems = [...billItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }

    // Recalculate totals
    if (field === "pieces" || field === "rate" || field === "otherCharges") {
      const item = updatedItems[index]
      item.amount = item.pieces * item.rate
      item.total = item.amount + item.otherCharges
    }

    setBillItems(updatedItems)
  }

  const removeBillItem = (index: number) => {
    setBillItems(billItems.filter((_, i) => i !== index))
  }

  const calculateTotals = () => {
    const netAmount = billItems.reduce((sum, item) => sum + item.total, 0)
    const igstAmount = netAmount * (taxSettings.igst / 100)
    const cgstAmount = netAmount * (taxSettings.cgst / 100)
    const sgstAmount = netAmount * (taxSettings.sgst / 100)
    const totalAmount = netAmount + igstAmount + cgstAmount + sgstAmount

    return {
      netAmount,
      igstAmount,
      cgstAmount,
      sgstAmount,
      totalAmount,
    }
  }

  const generateBillNumber = () => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    const day = date.getDate().toString().padStart(2, "0")
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `INV${year}${month}${day}${random}`
  }

  const saveBill = async () => {
    if (!customerInfo.name || billItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill customer information and add at least one item",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const totals = calculateTotals()
      const billData = {
        billNumber: generateBillNumber(),
        customer: customerInfo,
        items: billItems,
        totals,
        taxSettings,
        status: "pending",
        createdAt: new Date(),
      }

      const response = await fetch("/api/bills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billData),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: "Bill created successfully",
        })
        router.push(`/billing/${result.id}`)
      } else {
        throw new Error("Failed to create bill")
      }
    } catch (error) {
      console.error("Error creating bill:", error)
      toast({
        title: "Error",
        description: "Failed to create bill",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const totals = calculateTotals()

  if (showPreview) {
    return (
      <InvoicePreview
        customer={customerInfo}
        items={billItems}
        totals={totals}
        taxSettings={taxSettings}
        onClose={() => setShowPreview(false)}
        onSave={saveBill}
        loading={loading}
      />
    )
  }

  return (
    <div className="space-y-6">
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
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                placeholder="Enter customer name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number</Label>
              <Input
                id="customerPhone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerAddress">Address</Label>
              <Textarea
                id="customerAddress"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                placeholder="Enter address"
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
                  {inventoryItems.map((item) => {
                    const realTimePrice = calculateRealTimePrice({
                      weight: item.weight,
                      purity: item.purity,
                      category: item.category as "Gold" | "Silver" | "Diamond" | "Others",
                      makingCharges: 0,
                      stoneCharges: 0,
                      goldRate: metalRates.goldRate,
                      silverRate: metalRates.silverRate,
                    })

                    return (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name} - {item.category} (₹{realTimePrice.salePrice.toLocaleString()}/piece)
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addItemToBill} disabled={!selectedItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          {/* Add after the Add Item button */}
          <div className="mb-4">
            <RealTimeRatesDisplay onRatesUpdate={(rates) => setMetalRates(rates)} showRefresh={true} />
          </div>

          {/* Bill Items Table */}
          {billItems.length > 0 && (
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
                  {billItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        <Input
                          value={item.hsnCode}
                          onChange={(e) => updateBillItem(index, "hsnCode", e.target.value as any)}
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
      {billItems.length > 0 && (
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
                <span>IGST ({taxSettings.igst}%):</span>
                <span>₹{totals.igstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST ({taxSettings.cgst}%):</span>
                <span>₹{totals.cgstAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST ({taxSettings.sgst}%):</span>
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

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button onClick={() => setShowPreview(true)} disabled={billItems.length === 0 || !customerInfo.name}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Invoice
        </Button>
        <Button onClick={saveBill} disabled={loading || billItems.length === 0 || !customerInfo.name}>
          {loading ? "Saving..." : "Save Bill"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  )
}
