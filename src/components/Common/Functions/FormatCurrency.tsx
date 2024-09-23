export const formatCurrency = (currency: string) => {
  return Math.abs(parseFloat(currency)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? 0.00
  
}