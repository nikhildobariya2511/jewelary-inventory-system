// Purity mapping for different gold and silver purities
export const PURITY_MAP = {
  "24k": 1,
  "22k": 22 / 24,
  "18k": 18 / 24,
  "14k": 14 / 24,
  "10k": 10 / 24,
  "925 Silver": 0.925,
  "999 Silver": 0.999,
}

export interface PriceCalculationParams {
  weight: number
  purity: string
  category: "Gold" | "Silver" | "Diamond" | "Others"
  makingCharges: number
  stoneCharges: number
  goldRate: number
  silverRate: number
  profitMargin?: number
}

export interface CalculatedPrice {
  basePrice: number
  purityAdjustedPrice: number
  costPrice: number
  salePrice: number
  breakdown: {
    metalValue: number
    makingCharges: number
    stoneCharges: number
    profit: number
  }
}

export const calculateRealTimePrice = (params: PriceCalculationParams): CalculatedPrice => {
  const {
    weight,
    purity,
    category,
    makingCharges,
    stoneCharges,
    goldRate,
    silverRate,
    profitMargin = 0.2, // Default 20% profit margin
  } = params

  let basePrice = 0
  let purityAdjustedPrice = 0

  if (category === "Gold") {
    basePrice = weight * goldRate
    const purityMultiplier = PURITY_MAP[purity as keyof typeof PURITY_MAP] || 1
    purityAdjustedPrice = basePrice * purityMultiplier
  } else if (category === "Silver") {
    basePrice = weight * silverRate
    const purityMultiplier = PURITY_MAP[purity as keyof typeof PURITY_MAP] || 1
    purityAdjustedPrice = basePrice * purityMultiplier
  } else {
    // For Diamond and Others, use a base calculation or fixed price
    purityAdjustedPrice = basePrice = weight * 100 // Placeholder calculation
  }

  const costPrice = purityAdjustedPrice + makingCharges + stoneCharges
  const profit = costPrice * profitMargin
  const salePrice = costPrice + profit

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    purityAdjustedPrice: Math.round(purityAdjustedPrice * 100) / 100,
    costPrice: Math.round(costPrice * 100) / 100,
    salePrice: Math.round(salePrice * 100) / 100,
    breakdown: {
      metalValue: Math.round(purityAdjustedPrice * 100) / 100,
      makingCharges,
      stoneCharges,
      profit: Math.round(profit * 100) / 100,
    },
  }
}

export const getPurityOptions = (category: string): string[] => {
  if (category === "Gold") {
    return ["24k", "22k", "18k", "14k", "10k"]
  } else if (category === "Silver") {
    return ["925 Silver", "999 Silver"]
  } else {
    return ["Pure", "Standard", "Premium"]
  }
}

export const formatPriceBreakdown = (calculation: CalculatedPrice): string => {
  return `
Metal Value: ₹${calculation.breakdown.metalValue.toLocaleString()}
Making Charges: ₹${calculation.breakdown.makingCharges.toLocaleString()}
Stone Charges: ₹${calculation.breakdown.stoneCharges.toLocaleString()}
Profit: ₹${calculation.breakdown.profit.toLocaleString()}
Total: ₹${calculation.salePrice.toLocaleString()}
  `.trim()
}
