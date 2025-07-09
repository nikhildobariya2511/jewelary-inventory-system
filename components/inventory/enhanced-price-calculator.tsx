"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calculator, Info, TrendingUp, Zap, RefreshCw } from "lucide-react"
import { calculateRealTimePrice, getPurityOptions, type CalculatedPrice } from "@/lib/price-calculator"

interface EnhancedPriceCalculatorProps {
  onPriceCalculated?: (price: CalculatedPrice) => void
  initialValues?: {
    weight?: number
    category?: string
    purity?: string
    makingCharges?: number
    stoneCharges?: number
  }
  autoCalculate?: boolean
}

export default function EnhancedPriceCalculator({
  onPriceCalculated,
  initialValues,
  autoCalculate = false,
}: EnhancedPriceCalculatorProps) {
  const [weight, setWeight] = useState(initialValues?.weight || 0)
  const [category, setCategory] = useState(initialValues?.category || "Gold")
  const [purity, setPurity] = useState(initialValues?.purity || "22k")
  const [makingCharges, setMakingCharges] = useState(initialValues?.makingCharges || 0)
  const [stoneCharges, setStoneCharges] = useState(initialValues?.stoneCharges || 0)
  const [metalRates, setMetalRates] = useState({ goldRate: 6800, silverRate: 85 })
  const [calculation, setCalculation] = useState<CalculatedPrice | null>(null)
  const [loading, setLoading] = useState(false)

  // Sync with initial values
  useEffect(() => {
    if (initialValues?.weight !== undefined) setWeight(initialValues.weight)
    if (initialValues?.category) setCategory(initialValues.category)
    if (initialValues?.purity) setPurity(initialValues.purity)
    if (initialValues?.makingCharges !== undefined) setMakingCharges(initialValues.makingCharges)
    if (initialValues?.stoneCharges !== undefined) setStoneCharges(initialValues.stoneCharges)
  }, [initialValues])

  // Auto-calculate when values change
  useEffect(() => {
    if (autoCalculate && weight > 0 && category && purity) {
      handleCalculate()
    }
  }, [weight, category, purity, makingCharges, stoneCharges, metalRates, autoCalculate])

  // Update purity options when category changes
  useEffect(() => {
    const purityOptions = getPurityOptions(category)
    if (!purityOptions.includes(purity)) {
      setPurity(purityOptions[0] || "")
    }
  }, [category])

  // Fetch metal rates from settings
  useEffect(() => {
    fetchMetalRates()
  }, [])

  const fetchMetalRates = async () => {
    try {
      const response = await fetch("/api/settings")
      if (response.ok) {
        const data = await response.json()
        console.log("Fetched metal rates:", data);
        console.log("Metal rates data:",  data.settings.rates.goldRate);
        
        if (data.settings) {
          setMetalRates({
            goldRate: data.settings.rates.goldRate || 6800,
            silverRate: data.settings.rates.silverRate || 85,
          })
        }
      }
    } catch (error) {
      console.error("Error fetching metal rates:", error)
    }
  }

  const handleCalculate = () => {
    if (weight <= 0) return

    setLoading(true)

    try {
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
    } catch (error) {
      console.error("Error calculating price:", error)
    } finally {
      setLoading(false)
    }
  }

  const purityOptions = getPurityOptions(category)

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

  const getCategoryGradient = (category: string) => {
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

  return (
    <div className="space-y-6">
      {/* Live Metal Rates Display */}
      <Card className="luxury-card shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-t-lg border-b border-primary-100">
          <CardTitle className="flex items-center justify-between text-secondary-800">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
              Current Metal Rates
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchMetalRates}
              className="text-primary-600 hover:text-primary-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-3 rounded-lg border border-primary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🥇</span>
                  <span className="font-medium text-primary-800">Gold</span>
                </div>
                <Badge className="bg-primary-600 text-white">Settings</Badge>
              </div>
              <p className="text-2xl font-bold text-primary-700 mt-1">₹{metalRates.goldRate.toLocaleString()}/g</p>
            </div>
            <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 p-3 rounded-lg border border-secondary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🥈</span>
                  <span className="font-medium text-secondary-800">Silver</span>
                </div>
                <Badge className="bg-secondary-600 text-white">Settings</Badge>
              </div>
              <p className="text-2xl font-bold text-secondary-700 mt-1">₹{metalRates.silverRate.toLocaleString()}/g</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price Calculator */}
      <Card className="luxury-card shadow-xl">
        <CardHeader className={`bg-gradient-to-r ${getCategoryGradient(category)} rounded-t-lg text-white`}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Price Calculator
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              {getCategoryIcon(category)} {category}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calc-category" className="text-secondary-700 font-medium">
                  Category
                </Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="luxury-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gold">
                      <div className="flex items-center space-x-2">
                        <span>🥇</span>
                        <span>Gold</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Silver">
                      <div className="flex items-center space-x-2">
                        <span>🥈</span>
                        <span>Silver</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Diamond">
                      <div className="flex items-center space-x-2">
                        <span>💎</span>
                        <span>Diamond</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Others">
                      <div className="flex items-center space-x-2">
                        <span>✨</span>
                        <span>Others</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calc-purity" className="text-secondary-700 font-medium">
                  Purity
                </Label>
                <Select value={purity} onValueChange={setPurity}>
                  <SelectTrigger className="luxury-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {purityOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-primary-600">{option}</span>
                          {category === "Gold" && (
                            <span className="text-xs text-secondary-500">
                              (
                              {option === "24k"
                                ? "Pure"
                                : option === "22k"
                                  ? "91.7%"
                                  : option === "18k"
                                    ? "75%"
                                    : option === "14k"
                                      ? "58.3%"
                                      : "41.7%"}
                              )
                            </span>
                          )}
                          {category === "Silver" && (
                            <span className="text-xs text-secondary-500">
                              ({option === "999 Silver" ? "99.9%" : "92.5%"})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="calc-weight" className="text-secondary-700 font-medium">
                  Weight (grams)
                </Label>
                <Input
                  id="calc-weight"
                  type="number"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(Number.parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="luxury-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calc-making" className="text-secondary-700 font-medium">
                  Making Charges (₹)
                </Label>
                <Input
                  id="calc-making"
                  type="number"
                  step="0.01"
                  value={makingCharges}
                  onChange={(e) => setMakingCharges(Number.parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="luxury-input"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="calc-stone" className="text-secondary-700 font-medium">
                  Stone Charges (₹)
                </Label>
                <Input
                  id="calc-stone"
                  type="number"
                  step="0.01"
                  value={stoneCharges}
                  onChange={(e) => setStoneCharges(Number.parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="luxury-input"
                />
              </div>
            </div>

            {!autoCalculate && (
              <Button
                onClick={handleCalculate}
                disabled={weight <= 0 || loading}
                className="w-full luxury-button-primary shadow-lg"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {loading ? "Calculating..." : "Calculate Price"}
              </Button>
            )}

            {calculation && (
              <div className="mt-6 p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200 shadow-inner">
                <h4 className="font-semibold mb-4 flex items-center text-emerald-800">
                  <Info className="h-4 w-4 mr-2" />
                  Price Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="text-secondary-600">Base Metal Value:</span>
                      <span className="font-medium">₹{calculation.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="text-secondary-600">Purity Adjusted ({purity}):</span>
                      <span className="font-medium">₹{calculation.purityAdjustedPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="text-secondary-600">Making Charges:</span>
                      <span className="font-medium">₹{calculation.breakdown.makingCharges.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="text-secondary-600">Stone Charges:</span>
                      <span className="font-medium">₹{calculation.breakdown.stoneCharges.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="border-t border-emerald-300 pt-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm text-blue-600 font-medium">Cost Price</div>
                        <div className="text-xl font-bold text-blue-700">₹{calculation.costPrice.toLocaleString()}</div>
                      </div>
                      <div className="bg-gradient-to-r from-emerald-100 to-emerald-200 p-3 rounded-lg border border-emerald-300">
                        <div className="text-sm text-emerald-600 font-medium flex items-center">
                          <Zap className="h-3 w-3 mr-1" />
                          Sale Price
                        </div>
                        <div className="text-xl font-bold text-emerald-700">
                          ₹{calculation.salePrice.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-center">
                      <Badge className="bg-emerald-600 text-white">
                        Profit: ₹{calculation.breakdown.profit.toLocaleString()} (20%)
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
