"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Package, Sparkles } from "lucide-react"
import EnhancedPriceCalculator from "./enhanced-price-calculator"
import type { CalculatedPrice } from "@/lib/price-calculator"
import { getPurityOptions } from "@/lib/price-calculator"
import { getStatusColor } from "@/lib/theme-colors"

const categories = ["Gold", "Silver", "Diamond", "Others"]
const types = ["Ring", "Necklace", "Bangle", "Bracelet", "Earring", "Chain", "Custom"]

export default function AddInventoryForm() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    type: "",
    weight: "",
    purity: "",
    makingCharges: "",
    stoneCharges: "",
    quantity: "",
    costPrice: "",
    salePrice: "",
    minStockLevel: "5",
  })
  const [loading, setLoading] = useState(false)
  const [calculatedPrice, setCalculatedPrice] = useState<CalculatedPrice | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Reset purity when category changes
      if (field === "category") {
        const purityOptions = getPurityOptions(value)
        newData.purity = purityOptions[0] || ""
      }

      return newData
    })
  }

  const handlePriceCalculated = (price: CalculatedPrice) => {
    setCalculatedPrice(price)
    setFormData((prev) => ({
      ...prev,
      costPrice: price.costPrice.toString(),
      salePrice: price.salePrice.toString(),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !formData.name ||
      !formData.category ||
      !formData.type ||
      !formData.weight ||
      !formData.purity ||
      !formData.quantity
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including purity",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/inventory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          weight: Number.parseFloat(formData.weight),
          makingCharges: Number.parseFloat(formData.makingCharges) || 0,
          stoneCharges: Number.parseFloat(formData.stoneCharges) || 0,
          quantity: Number.parseInt(formData.quantity),
          costPrice: Number.parseFloat(formData.costPrice) || 0,
          salePrice: Number.parseFloat(formData.salePrice) || 0,
          minStockLevel: Number.parseInt(formData.minStockLevel),
        }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item added successfully to inventory",
        })
        router.push("/inventory")
      } else {
        throw new Error("Failed to add item")
      }
    } catch (error) {
      console.error("Error adding item:", error)
      toast({
        title: "Error",
        description: "Failed to add item to inventory",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Gold":
        return "🥇"
      case "Silver":
        return "🥈"
      case "Diamond":
        return "💎"
      default:
        return "✨"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Gold":
        return "from-primary-400 to-primary-600"
      case "Silver":
        return "from-secondary-400 to-secondary-600"
      case "Diamond":
        return "from-blue-400 to-blue-600"
      default:
        return "from-emerald-400 to-emerald-600"
    }
  }

  const purityOptions = formData.category ? getPurityOptions(formData.category) : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-cream-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.back()} className="mb-4 luxury-button-secondary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Button>
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-secondary-900">Add New Item</h1>
                <p className="text-secondary-600">Add a new jewelry item to your inventory</p>
              </div>
            </div>
          </div>
          {formData.category && (
            <Badge className={`${getStatusColor("active")} text-lg px-4 py-2 shadow-md`}>
              {getCategoryIcon(formData.category)} {formData.category}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Information Form */}
          <Card className="luxury-card shadow-xl">
            <CardHeader className="bg-gradient-to-r from-cream-50 to-primary-50 rounded-t-lg border-b border-primary-100">
              <CardTitle className="flex items-center text-secondary-800">
                <Sparkles className="h-5 w-5 mr-2 text-primary-600" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="name" className="text-secondary-700 font-medium">
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      required
                      placeholder="Enter product name"
                      className="luxury-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-secondary-700 font-medium">
                      Category *
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                      <SelectTrigger className="luxury-input">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            <div className="flex items-center space-x-2">
                              <span>{getCategoryIcon(category)}</span>
                              <span>{category}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-secondary-700 font-medium">
                      Type *
                    </Label>
                    <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                      <SelectTrigger className="luxury-input">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight" className="text-secondary-700 font-medium">
                      Weight (grams) *
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => handleChange("weight", e.target.value)}
                      required
                      placeholder="0.00"
                      className="luxury-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purity" className="text-secondary-700 font-medium">
                      Purity *
                    </Label>
                    <Select
                      value={formData.purity}
                      onValueChange={(value) => handleChange("purity", value)}
                      disabled={!formData.category}
                    >
                      <SelectTrigger className="luxury-input">
                        <SelectValue placeholder={formData.category ? "Select purity" : "Select category first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {purityOptions.map((purity) => (
                          <SelectItem key={purity} value={purity}>
                            <div className="flex items-center space-x-2">
                              <span className="text-primary-600 font-medium">{purity}</span>
                              {formData.category === "Gold" && (
                                <span className="text-xs text-secondary-500">
                                  (
                                  {purity === "24k"
                                    ? "Pure"
                                    : purity === "22k"
                                      ? "91.7%"
                                      : purity === "18k"
                                        ? "75%"
                                        : purity === "14k"
                                          ? "58.3%"
                                          : "41.7%"}
                                  )
                                </span>
                              )}
                              {formData.category === "Silver" && (
                                <span className="text-xs text-secondary-500">
                                  ({purity === "999 Silver" ? "99.9%" : "92.5%"})
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!formData.category && (
                      <p className="text-xs text-secondary-500">Please select a category first to choose purity</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="makingCharges" className="text-secondary-700 font-medium">
                      Making Charges (₹)
                    </Label>
                    <Input
                      id="makingCharges"
                      type="number"
                      step="0.01"
                      value={formData.makingCharges}
                      onChange={(e) => handleChange("makingCharges", e.target.value)}
                      placeholder="0.00"
                      className="luxury-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stoneCharges" className="text-secondary-700 font-medium">
                      Stone Charges (₹)
                    </Label>
                    <Input
                      id="stoneCharges"
                      type="number"
                      step="0.01"
                      value={formData.stoneCharges}
                      onChange={(e) => handleChange("stoneCharges", e.target.value)}
                      placeholder="0.00"
                      className="luxury-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-secondary-700 font-medium">
                      Quantity *
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleChange("quantity", e.target.value)}
                      required
                      placeholder="0"
                      className="luxury-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minStockLevel" className="text-secondary-700 font-medium">
                      Minimum Stock Level
                    </Label>
                    <Input
                      id="minStockLevel"
                      type="number"
                      value={formData.minStockLevel}
                      onChange={(e) => handleChange("minStockLevel", e.target.value)}
                      placeholder="5"
                      className="luxury-input"
                    />
                  </div>
                </div>

                {/* Calculated Prices Display */}
                {calculatedPrice && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 shadow-inner">
                    <div className="space-y-2">
                      <Label htmlFor="costPrice" className="text-emerald-700 font-medium">
                        Cost Price (₹) *
                      </Label>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={(e) => handleChange("costPrice", e.target.value)}
                        required
                        className="bg-white border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salePrice" className="text-emerald-700 font-medium">
                        Sale Price (₹) *
                      </Label>
                      <Input
                        id="salePrice"
                        type="number"
                        step="0.01"
                        value={formData.salePrice}
                        onChange={(e) => handleChange("salePrice", e.target.value)}
                        required
                        className="bg-white border-emerald-300 focus:border-emerald-500 focus:ring-emerald-200"
                      />
                    </div>
                  </div>
                )}

                <div className="flex space-x-4 pt-4">
                  <Button type="submit" disabled={loading} className="flex-1 luxury-button-primary shadow-lg">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? "Adding..." : "Add to Inventory"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="luxury-button-secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Enhanced Price Calculator */}
          <div className="space-y-6">
            <EnhancedPriceCalculator
              onPriceCalculated={handlePriceCalculated}
              initialValues={{
                weight: Number.parseFloat(formData.weight) || 0,
                category: formData.category,
                purity: formData.purity,
                makingCharges: Number.parseFloat(formData.makingCharges) || 0,
                stoneCharges: Number.parseFloat(formData.stoneCharges) || 0,
              }}
              autoCalculate={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
