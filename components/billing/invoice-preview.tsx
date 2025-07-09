"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Printer } from "lucide-react"
import Image from "next/image"

interface CustomerInfo {
  name: string
  phone: string
  address: string
}

interface BillItem {
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

interface Totals {
  netAmount: number
  igstAmount: number
  cgstAmount: number
  sgstAmount: number
  totalAmount: number
}

interface TaxSettings {
  igst: number
  cgst: number
  sgst: number
}

interface ShopSettings {
  name: string
  address: string
  phone: string
  gst: string
  logo?: string
}

interface InvoicePreviewProps {
  customer?: CustomerInfo
  items?: BillItem[]
  totals?: Totals
  taxSettings?: TaxSettings
  onClose: () => void
  onSave: () => void
  loading?: boolean
}

export default function InvoicePreview({
  customer,
  items = [],
  totals,
  taxSettings,
  onClose,
  onSave,
  loading = false,
}: InvoicePreviewProps) {
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    name: "Ehvara Jewels",
    address: "1st floor Nutan Estate, katargam, surat 395004",
    phone: "9099315455 | 7359631655",
    gst: "24GAXPB5845P1ZT",
  })

  // Default values for props
  const defaultCustomer: CustomerInfo = {
    name: "Customer Name",
    phone: "",
    address: "",
  }

  const defaultTotals: Totals = {
    netAmount: 0,
    igstAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    totalAmount: 0,
  }

  const defaultTaxSettings: TaxSettings = {
    igst: 3.0,
    cgst: 1.5,
    sgst: 1.5,
  }

  // Use default values if props are undefined
  const customerData = customer || defaultCustomer
  const totalsData = totals || defaultTotals
  const taxData = taxSettings || defaultTaxSettings
  const itemsData = items || []

  useEffect(() => {
    fetchShopSettings()
  }, [])

  const fetchShopSettings = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        if (data.settings?.shop) {
          setShopSettings(data.settings.shop)
        }
      }
    } catch (error) {
      console.error("Error fetching shop settings:", error)
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
    return `${year}${month}${day}${random}`
  }

  const convertToWords = (amount: number): string => {
    const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"]
    const teens = [
      "TEN",
      "ELEVEN",
      "TWELVE",
      "THIRTEEN",
      "FOURTEEN",
      "FIFTEEN",
      "SIXTEEN",
      "SEVENTEEN",
      "EIGHTEEN",
      "NINETEEN",
    ]
    const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"]
    const thousands = ["", "THOUSAND", "LAKH", "CRORE"]

    if (amount === 0 || isNaN(amount)) return "ZERO"

    const convertHundreds = (num: number): string => {
      let result = ""
      if (num >= 100) {
        result += ones[Math.floor(num / 100)] + " HUNDRED "
        num %= 100
      }
      if (num >= 20) {
        result += tens[Math.floor(num / 10)] + " "
        num %= 10
      } else if (num >= 10) {
        result += teens[num - 10] + " "
        return result
      }
      if (num > 0) {
        result += ones[num] + " "
      }
      return result
    }

    let result = ""
    let groupIndex = 0
    while (amount > 0) {
      const group = amount % (groupIndex === 0 ? 1000 : 100)
      if (group !== 0) {
        result = convertHundreds(group) + thousands[groupIndex] + " " + result
      }
      amount = Math.floor(amount / (groupIndex === 0 ? 1000 : 100))
      groupIndex++
    }

    return result.trim() + " ONLY"
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header with actions */}
        <div className="flex justify-between items-center p-4 border-b print:hidden">
          <h2 className="text-xl font-bold">Invoice Preview</h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button onClick={onSave} disabled={loading}>
              {loading ? "Saving..." : "Save Bill"}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Invoice Content - Optimized for single page printing */}
        <div className="invoice-container bg-white print:scale-90" id="invoice-content">
          {/* Header */}
          <div className="border-4 border-blue-600 p-6 print:p-2 invoice-section">
            <div className="text-center mb-4 print:mb-2">
              <div className="text-sm font-medium print:text-xs">|| Shree Ganeshaya Namaha ||</div>
              <h1 className="text-3xl font-bold mt-2 print:text-xl print:mt-1">Gold Tax Invoice</h1>
            </div>

            <div className="flex justify-between items-start">
              {/* Company Logo and Name */}
              <div className="flex items-center">
                  {shopSettings.logo ? (
                    <Image
                      src={shopSettings.logo || "/placeholder.svg"}
                      alt="Shop Logo"
                      width={80}
                      height={80}
                      className="object-contain print:w-12 print:h-12"
                    />
                  ) : (
                    <div className="w-20 h-20 print:w-12 print:h-12 flex items-center justify-center">
                      <div className="text-2xl print:text-lg font-bold transform rotate-45 border-2 border-white rounded p-2 print:p-1">
                        <span className="transform -rotate-45 block">{shopSettings.name?.charAt(0) || "E"}</span>
                      </div>
                    </div>
                  )}
              
              </div>

              {/* Company Details */}
              <div className="text-right text-sm print:text-xs">
                <div>
                  <strong>Gst :</strong> {shopSettings.gst}
                </div>
                <div>
                  <strong>Phone :</strong> {shopSettings.phone}
                </div>
                <div>
                  <strong>Address :</strong> {shopSettings.address}
                </div>
              </div>
            </div>
          </div>

          {/* Customer and Invoice Details */}
          <div className="border-l-4 border-r-4 border-blue-600 px-6 py-4 print:px-2 print:py-2 invoice-section">
            <div className="flex justify-between">
              <div>
                <div className="font-semibold print:text-sm">Receiver (Billed to):</div>
                <div className="text-xl font-bold print:text-lg">{customerData.name}</div>
                <div className="print:text-xs">Phone : {customerData.phone}</div>
                {customerData.address && <div className="print:text-xs">{customerData.address}</div>}
              </div>
              <div className="text-right print:text-xs">
                <div>
                  <strong>Invoice Number:</strong> {generateBillNumber()}
                </div>
                <div>
                  <strong>Invoice Date:</strong> {new Date().toLocaleDateString("en-GB")}
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border-l-4 border-r-4 border-blue-600 px-6 print:px-2 invoice-section">
            <table className="w-full border-collapse border border-gray-400">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-400 p-2 print:p-1 text-left print:text-xs">S.No.</th>
                  <th className="border border-gray-400 p-2 print:p-1 text-left print:text-xs">Item Description</th>
                  <th className="border border-gray-400 p-2 print:p-1 text-left print:text-xs">HSN Code</th>
                  <th className="border border-gray-400 p-2 print:p-1 text-left print:text-xs">Pcs</th>
                  <th className="border border-gray-400 p-2 print:p-1 text-left print:text-xs">Gr Wt</th>
                  <th className="border border-gray-400 p-2 print:p-1 text-left print:text-xs">Net Wt</th>
                  <th className="border border-gray-400 p-2 print:p-1 text-left print:text-xs">Rate</th>
                  <th className="border border-gray-400 p-2 print:p-1 text-left print:text-xs">Amount</th>
                  <th className="border border-gray-400 p-2 print:p-1 text-left print:text-xs">Other Chg</th>
                  <th className="border border-gray-400 p-2 print:p-1 text-left print:text-xs">TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {itemsData.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-400 p-2 print:p-1 text-center print:text-xs">{index + 1}</td>
                    <td className="border border-gray-400 p-2 print:p-1 print:text-xs">{item.name || ""}</td>
                    <td className="border border-gray-400 p-2 print:p-1 text-center print:text-xs">
                      {item.hsnCode || ""}
                    </td>
                    <td className="border border-gray-400 p-2 print:p-1 text-center print:text-xs">
                      {item.pieces || 0}
                    </td>
                    <td className="border border-gray-400 p-2 print:p-1 text-center print:text-xs">
                      {item.grossWeight || 0}
                    </td>
                    <td className="border border-gray-400 p-2 print:p-1 text-center print:text-xs">
                      {item.netWeight || 0}
                    </td>
                    <td className="border border-gray-400 p-2 print:p-1 text-right print:text-xs">
                      {(item.rate || 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-400 p-2 print:p-1 text-right print:text-xs">
                      {(item.amount || 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-400 p-2 print:p-1 text-right print:text-xs">
                      {(item.otherCharges || 0).toLocaleString()}
                    </td>
                    <td className="border border-gray-400 p-2 print:p-1 text-right font-semibold print:text-xs">
                      {(item.total || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {/* Empty rows for spacing */}
                {Array.from({ length: Math.max(0, 4 - itemsData.length) }).map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td className="border border-gray-400 p-2 print:p-1">&nbsp;</td>
                    <td className="border border-gray-400 p-2 print:p-1">&nbsp;</td>
                    <td className="border border-gray-400 p-2 print:p-1">&nbsp;</td>
                    <td className="border border-gray-400 p-2 print:p-1">&nbsp;</td>
                    <td className="border border-gray-400 p-2 print:p-1">&nbsp;</td>
                    <td className="border border-gray-400 p-2 print:p-1">&nbsp;</td>
                    <td className="border border-gray-400 p-2 print:p-1">&nbsp;</td>
                    <td className="border border-gray-400 p-2 print:p-1">&nbsp;</td>
                    <td className="border border-gray-400 p-2 print:p-1">&nbsp;</td>
                    <td className="border border-gray-400 p-2 print:p-1">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="border-l-4 border-r-4 border-blue-600 px-6 print:px-2 invoice-section">
            <div className="flex">
              <div className="flex-1 border border-gray-400 p-4 print:p-2">
                <div className="font-semibold mb-2 print:mb-1 print:text-sm">VCH DESC:</div>
                <div className="mt-8 print:mt-2 font-semibold print:text-xs">
                  RUPEES : {convertToWords(Math.floor(totalsData.totalAmount))}
                </div>
              </div>
              <div className="w-64 print:w-48 border border-gray-400">
                <div className="flex justify-between p-2 print:p-1 border-b border-gray-400 print:text-xs">
                  <span>Net Amount:</span>
                  <span>{totalsData.netAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 print:p-1 border-b border-gray-400 print:text-xs">
                  <span>IGST: {taxData.igst}%:</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between p-2 print:p-1 border-b border-gray-400 print:text-xs">
                  <span>CGST: {taxData.cgst}%:</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between p-2 print:p-1 border-b border-gray-400 print:text-xs">
                  <span>SGST: {taxData.sgst}%:</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between p-2 print:p-1 border-b border-gray-400 font-semibold print:text-xs">
                  <span>Total Amount:</span>
                  <span>{totalsData.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 print:p-1 border-b border-gray-400 print:text-xs">
                  <span>Cash Amount:</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between p-2 print:p-1 print:text-xs">
                  <span>Bill Outstanding:</span>
                  <span>0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference Section */}
          <div className="border-l-4 border-r-4 border-blue-600 px-6 py-4 print:px-2 print:py-2 invoice-section">
            <div className="border border-gray-400 p-4 print:p-2">
              <div className="font-semibold mb-2 print:mb-1 print:text-sm">REF BY :</div>
              <div className="mt-4 print:mt-2 text-sm print:text-xs">
                Certified that the particulars given above are true and correct
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border-l-4 border-r-4 border-blue-600 px-6 py-4 print:px-2 print:py-2 invoice-section">
            <div className="font-semibold mb-2 print:mb-1 print:text-sm">Terms & conditions:</div>
          </div>

          {/* Footer */}
          <div className="border-4 border-blue-600 px-6 py-8 print:px-2 print:py-4 invoice-section">
            <div className="text-right mb-8 print:mb-4">
              <div className="font-semibold print:text-sm">FOR {shopSettings.name}</div>
            </div>
            <div className="flex justify-between">
              <div className="text-center">
                <div className="border-t border-black w-32 print:w-24 mb-2 print:mb-1"></div>
                <div className="print:text-xs">Party Signatory</div>
              </div>
              <div className="text-center">
                <div className="border-t border-black w-32 print:w-24 mb-2 print:mb-1"></div>
                <div className="print:text-xs">Authorised signatory</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
