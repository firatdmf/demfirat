export function stockTone(stock: number): 'high' | 'mid' | 'low' {
  if (stock > 200) return 'high';
  if (stock > 50) return 'mid';
  return 'low';
}

export function stockColor(stock: number): string {
  const t = stockTone(stock);
  return t === 'high' ? '#2F7D5F' : t === 'mid' ? '#B07A1A' : '#B0382F';
}
