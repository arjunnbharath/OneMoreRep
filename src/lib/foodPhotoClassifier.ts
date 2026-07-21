export interface FoodPrediction {
  label: string
  confidence: number
}

type ClassifySource = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement

let modelPromise: Promise<import('@tensorflow-models/mobilenet').MobileNet> | null = null

async function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import('@tensorflow/tfjs')
      await tf.setBackend('webgl')
      await tf.ready()

      const mobilenet = await import('@tensorflow-models/mobilenet')
      return mobilenet.load({ version: 2, alpha: 0.5 })
    })()
  }
  return modelPromise
}

function cleanLabel(className: string): string {
  const primary = className.split(',')[0]?.trim() ?? className
  return primary.replace(/\s+/g, ' ')
}

export async function classifyFoodImage(source: ClassifySource): Promise<FoodPrediction[]> {
  const model = await loadModel()
  const predictions = await model.classify(source as HTMLImageElement, 5)

  return predictions
    .map((prediction) => ({
      label: cleanLabel(prediction.className),
      confidence: prediction.probability,
    }))
    .filter((prediction) => prediction.confidence >= 0.05)
}
