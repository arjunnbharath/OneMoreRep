export function extractBarcodeFromScan(value: string): string | null {
  const raw = value.trim()
  if (!raw) return null

  const compact = raw.replace(/\s/g, '')
  if (/^\d{8,14}$/.test(compact)) return compact

  const urlPatterns = [
    /(?:product|barcode|gtin|ean)[/:=-](\d{8,14})/i,
    /[?&](?:barcode|gtin|ean)=(\d{8,14})/i,
    /\/(\d{8,14})(?:[/?#]|$)/,
  ]

  for (const pattern of urlPatterns) {
    const match = raw.match(pattern)
    if (match?.[1]) return match[1]
  }

  const sequences = raw.match(/\d{8,14}/g)
  if (sequences?.length) {
    return sequences.sort((a, b) => b.length - a.length)[0]
  }

  const digitsOnly = raw.replace(/\D/g, '')
  return digitsOnly.length >= 8 ? digitsOnly : null
}
