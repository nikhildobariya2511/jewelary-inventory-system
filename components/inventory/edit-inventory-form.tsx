"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Calculator } from "lucide-react"
import { calculateRealTimePrice, getPurityOptions } from "@/lib/price-calculator"
import RealTimeRatesDisplay from "@/components/common/real-time-rates-display"

interface InventoryItem {
  _id: string
  name: string
  category: string
  type: string
  weight: number
  purity: string
  makingCharges: number
  stoneCharges: number
  quantity: number
  costPrice: number
  salePrice: number
  minStockLevel: number
}

interface EditInventoryFormProps {
  itemId: string
}

export default function EditInventoryForm({ itemId }: EditInventoryFormProps) {
  const [formData, setFormData] = useState<InventoryItem | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [metalRates, setMetalRates] = useState({ goldRate: 0, silverRate: 0 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    fetchItem()
    fetchCategories()
    fetchMetalRates()
  }, [itemId])

  const fetchItem = async () => {
    try {
      const response = await fetch(`/api/inventory/${itemId}`)
      if (response.ok) {
        const data = await response.json()
        setFormData(data.item)
      } else {
        throw new Error("Item not found")
      }
    } catch (error) {
      console.error("Error fetching item:", error)
      toast({
        title: "Error",
        description: "Failed to fetch item details",
        variant: "destructive",
      })
      router.push("/inventory")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
  try {
    const response = await fetch("/api/categories")
    if (response.ok) {
      const data = await response.json()
      setCategories(data.categories.map((c: any) => c.name)) // extract names only
      setTypes(data.types.map((t: any) => t.name)) // extract names only
    }
  } catch (error) {
    console.error("Error fetching categories:", error)
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

  const calculatePrice = () => {
    if (!formData) return

    const result = calculateRealTimePrice({
      weight: formData.weight,
      purity: formData.purity,
      category: formData.category as "Gold" | "Silver" | "Diamond" | "Others",
      makingCharges: formData.makingCharges,
      stoneCharges: formData.stoneCharges,
      goldRate: metalRates.goldRate,
      silverRate: metalRates.silverRate,
    })

    setFormData({
      ...formData,
      costPrice: result.costPrice,
      salePrice: result.salePrice,
    })

    toast({
      title: "Price Calculated",
      description: `Cost: ₹${result.costPrice.toLocaleString()}, Sale: ₹${result.salePrice.toLocaleString()}`,
    })
  }

  const handleChange = (field: keyof InventoryItem, value: string | number) => {
    if (!formData) return
    setFormData({ ...formData, [field]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData) return

    setSaving(true)
    try {
      console.log(itemId, formData);
      
      const response = await fetch(`/api/inventory/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item updated successfully",
        })
        router.push("/inventory")
      } else {
        throw new Error("Failed to update item")
      }
    } catch (error) {
      console.error("Error updating item:", error)
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading item details...</CardTitle>
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

  if (!formData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Item not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested item could not be found.</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Edit Inventory Item</CardTitle>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="weight">Weight (grams) *</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => handleChange("weight", Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purity">Purity *</Label>
              <Select value={formData.purity} onValueChange={(value) => handleChange("purity", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getPurityOptions(formData.category).map((purity) => (
                    <SelectItem key={purity} value={purity}>
                      {purity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="makingCharges">Making Charges (₹)</Label>
              <Input
                id="makingCharges"
                type="number"
                step="0.01"
                value={formData.makingCharges}
                onChange={(e) => handleChange("makingCharges", Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stoneCharges">Stone Charges (₹)</Label>
              <Input
                id="stoneCharges"
                type="number"
                step="0.01"
                value={formData.stoneCharges}
                onChange={(e) => handleChange("stoneCharges", Number.parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", Number.parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="costPrice">Cost Price (₹) *</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => handleChange("costPrice", Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price (₹) *</Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => handleChange("salePrice", Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
              <Input
                id="minStockLevel"
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => handleChange("minStockLevel", Number.parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <RealTimeRatesDisplay onRatesUpdate={(rates) => setMetalRates(rates)} showRefresh={true} />
          </div>

          {(formData.category === "Gold" || formData.category === "Silver") && (
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm">
                <p>
                  Current {formData.category} Rate: ₹
                  {formData.category === "Gold" ? metalRates.goldRate : metalRates.silverRate}/gram
                </p>
                <p>
                  Base Price: ₹
                  {(
                    formData.weight * (formData.category === "Gold" ? metalRates.goldRate : metalRates.silverRate)
                  ).toLocaleString()}
                </p>
              </div>
              <Button type="button" onClick={calculatePrice} variant="outline">
                <Calculator className="h-4 w-4 mr-2" />
                Calculate Price
              </Button>
            </div>
          )}

          <div className="flex space-x-4">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
