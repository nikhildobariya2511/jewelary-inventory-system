interface RealTimePriceInput {
  weight: number
  purity: string
  category: "Gold" | "Silver" | "Diamond" | "Others"
  makingCharges: number
  stoneCharges: number
  goldRate: number
  silverRate: number
}

export function calculateRealTimePrice({
  weight,
  purity,
  category,
  makingCharges,
  stoneCharges,
  goldRate,
  silverRate,
}: RealTimePriceInput): { salePrice: number } {
  let baseRate = 0

  if (category === "Gold") {
    const purityFactor = parseFloat(purity) / 24 || 0.916 // default to 22k if parsing fails
    baseRate = goldRate * purityFactor
  } else if (category === "Silver") {
    baseRate = silverRate
  } else {
    baseRate = 0
  }

  const metalPrice = baseRate * weight
  const salePrice = metalPrice + makingCharges + stoneCharges

  return { salePrice: parseFloat(salePrice.toFixed(2)) }
}
