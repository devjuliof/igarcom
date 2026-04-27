export const formatMoney = (cents: number | null | undefined): string => {
  if (cents === null || cents === undefined || isNaN(cents)) {
    return 'R$ 0,00'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

export const fromCents = (cents: number): number => {
  return cents / 100
}
