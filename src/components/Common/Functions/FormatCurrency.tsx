export const formatCurrency = (currency: string) => {
  return parseFloat(currency).toFixed(2) ?? 0.00
}