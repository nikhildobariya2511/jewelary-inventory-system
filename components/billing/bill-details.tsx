"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Printer, Download, Edit, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import InvoicePreview from "./invoice-preview"

interface Bill {
  _id: string
  billNumber: string
  customer: {
    name: string
    phone: string
    address: string
  }
  items: Array<{
    name: string
    hsnCode: string
    pieces: number
    grossWeight: number
    netWeight: number
    rate: number
    amount: number
    otherCharges: number
    total: number
  }>
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

interface BillDetailsProps {
  billId: string
}

export default function BillDetails({ billId }: BillDetailsProps) {
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchBill()
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
      toast({
        title: "Error",
        description: "Failed to fetch bill details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateBillStatus = async (status: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        setBill((prev) => (prev ? { ...prev, status } : null))
        toast({
          title: "Success",
          description: "Bill status updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating bill status:", error)
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive",
      })
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

  if (showPreview) {
    return (
      <InvoicePreview
        customer={bill.customer}
        items={bill.items}
        totals={bill.totals}
        taxSettings={bill.taxSettings}
        onClose={() => setShowPreview(false)}
        onSave={() => {}}
        loading={false}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bills
          </Button>
          <h2 className="text-2xl font-bold">Bill #{bill.billNumber}</h2>
          <p className="text-muted-foreground">Created on {new Date(bill.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex space-x-2">
          <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
          <Button variant="outline" onClick={() => setShowPreview(true)}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="font-medium">{bill.customer.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="font-medium">{bill.customer.phone}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="font-medium">{bill.customer.address || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {bill.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.hsnCode}</TableCell>
                    <TableCell>{item.pieces}</TableCell>
                    <TableCell>{item.grossWeight}</TableCell>
                    <TableCell>{item.netWeight}</TableCell>
                    <TableCell>₹{item.rate.toLocaleString()}</TableCell>
                    <TableCell>₹{item.amount.toLocaleString()}</TableCell>
                    <TableCell>₹{item.otherCharges.toLocaleString()}</TableCell>
                    <TableCell className="font-medium">₹{item.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Bill Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Bill Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-w-md ml-auto">
            <div className="flex justify-between">
              <span>Net Amount:</span>
              <span>₹{bill.totals.netAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>IGST ({bill.taxSettings.igst}%):</span>
              <span>₹{bill.totals.igstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>CGST ({bill.taxSettings.cgst}%):</span>
              <span>₹{bill.totals.cgstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>SGST ({bill.taxSettings.sgst}%):</span>
              <span>₹{bill.totals.sgstAmount.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex justify-between font-bold text-lg">
                <span>Total Amount:</span>
                <span>₹{bill.totals.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Actions */}
      {bill.status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Button onClick={() => updateBillStatus("paid")} className="bg-green-600 hover:bg-green-700">
                Mark as Paid
              </Button>
              <Button onClick={() => updateBillStatus("cancelled")} variant="destructive">
                Cancel Bill
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
