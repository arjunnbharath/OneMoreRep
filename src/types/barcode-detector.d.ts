interface DetectedBarcode {
  rawValue?: string
}

interface BarcodeDetectorOptions {
  formats?: string[]
}

declare class BarcodeDetector {
  constructor(options?: BarcodeDetectorOptions)
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>
}

interface Window {
  BarcodeDetector?: typeof BarcodeDetector
}
