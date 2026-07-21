export function extractBarcodeFromScan(value: string): string | null {
  const raw = value.trim()
  if (!raw) return null

  const compact = raw.replace(/\s/g, '')
  if (/^\d{8,14}$/.test(compact)) return compact

  const gs1Match = raw.match(/\(01\)(\d{14})/) || raw.match(/01(\d{14})/)
  if (gs1Match?.[1]) {
    const gtin = gs1Match[1]
    return gtin.startsWith('0') ? gtin.slice(1) : gtin
  }

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

export function barcodeLookupCandidates(scanValue: string): string[] {
  const normalized = extractBarcodeFromScan(scanValue)
  if (!normalized) return []

  const candidates = new Set([normalized])
  if (normalized.length === 12) candidates.add(`0${normalized}`)
  if (normalized.length === 13 && normalized.startsWith('0')) {
    candidates.add(normalized.slice(1))
  }
  if (normalized.length === 14 && normalized.startsWith('0')) {
    candidates.add(normalized.slice(1))
  }

  return [...candidates]
}
