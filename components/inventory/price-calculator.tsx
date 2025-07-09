"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calculator, Info } from "lucide-react"
import { calculateRealTimePrice, getPurityOptions, type CalculatedPrice } from "@/lib/price-calculator"
import RealTimeRatesDisplay from "@/components/common/real-time-rates-display"

interface PriceCalculatorProps {
  onPriceCalculated?: (price: CalculatedPrice) => void
  initialValues?: {
    weight?: number
    category?: string
    purity?: string
    makingCharges?: number
    stoneCharges?: number
  }
}

export default function PriceCalculator({ onPriceCalculated, initialValues }: PriceCalculatorProps) {
  const [weight, setWeight] = useState(initialValues?.weight || 0)
  const [category, setCategory] = useState(initialValues?.category || "Gold")
  const [purity, setPurity] = useState(initialValues?.purity || "22k")
  const [makingCharges, setMakingCharges] = useState(initialValues?.makingCharges || 0)
  const [stoneCharges, setStoneCharges] = useState(initialValues?.stoneCharges || 0)
  const [metalRates, setMetalRates] = useState({ goldRate: 6800, silverRate: 85 })
  const [calculation, setCalculation] = useState<CalculatedPrice | null>(null)

  useEffect(() => {
    if (initialValues?.category) {
      setCategory(initialValues.category)
    }
    if (initialValues?.purity) {
      setPurity(initialValues.purity)
    }
  }, [initialValues])

  useEffect(() => {
    // Update purity options when category changes
    const purityOptions = getPurityOptions(category)
    if (!purityOptions.includes(purity)) {
      setPurity(purityOptions[0] || "")
    }
  }, [category])

  const handleCalculate = () => {
    if (weight <= 0) return

    const result = calculateRealTimePrice({
      weight,
      purity,
      category: category as "Gold" | "Silver" | "Diamond" | "Others",
      makingCharges,
      stoneCharges,
      goldRate: metalRates.goldRate,
      silverRate: metalRates.silverRate,
    })

    setCalculation(result)
    onPriceCalculated?.(result)
  }

  const purityOptions = getPurityOptions(category)

  return (
    <div className="space-y-6">
      <RealTimeRatesDisplay onRatesUpdate={(rates) => setMetalRates(rates)} showRefresh={true} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Price Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gold">Gold</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Diamond">Diamond</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purity">Purity</Label>
              <Select value={purity} onValueChange={setPurity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {purityOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (grams)</Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="makingCharges">Making Charges (₹)</Label>
              <Input
                id="makingCharges"
                type="number"
                step="0.01"
                value={makingCharges}
                onChange={(e) => setMakingCharges(Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stoneCharges">Stone Charges (₹)</Label>
              <Input
                id="stoneCharges"
                type="number"
                step="0.01"
                value={stoneCharges}
                onChange={(e) => setStoneCharges(Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <Button onClick={handleCalculate} disabled={weight <= 0} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate Price
          </Button>

          {calculation && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center">
                <Info className="h-4 w-4 mr-2" />
                Price Breakdown
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Base Metal Value:</span>
                  <span>₹{calculation.basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Purity Adjusted ({purity}):</span>
                  <span>₹{calculation.purityAdjustedPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Making Charges:</span>
                  <span>₹{calculation.breakdown.makingCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stone Charges:</span>
                  <span>₹{calculation.breakdown.stoneCharges.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Profit (20%):</span>
                  <span>₹{calculation.breakdown.profit.toLocaleString()}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Cost Price:</span>
                    <span>₹{calculation.costPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg text-green-600">
                    <span>Sale Price:</span>
                    <span>₹{calculation.salePrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
