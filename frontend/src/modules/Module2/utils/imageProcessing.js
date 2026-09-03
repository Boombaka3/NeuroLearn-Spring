// Apply 3x3 convolution to grayscale ImageData, zero-padded for same-size output
export function applyConvolution(imageData, width, height, kernel, normalize = false) {
  const src = imageData.data
  const output = new Uint8ClampedArray(src.length)
  let kernelSum = kernel.reduce((a, b) => a + b, 0)
  if (kernelSum === 0) kernelSum = 1
  const shouldNormalize = normalize && kernelSum > 1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx
          const py = y + ky
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const srcIdx = (py * width + px) * 4
            const gray = src[srcIdx]
            const kernelIdx = (ky + 1) * 3 + (kx + 1)
            sum += gray * kernel[kernelIdx]
          }
        }
      }
      if (shouldNormalize) sum = sum / kernelSum
      const value = Math.max(0, Math.min(255, Math.round(sum)))
      const outIdx = (y * width + x) * 4
      output[outIdx] = value
      output[outIdx + 1] = value
      output[outIdx + 2] = value
      output[outIdx + 3] = 255
    }
  }
  return new ImageData(output, width, height)
}

// Apply 3x3 convolution independently to R, G, and B. Alpha is preserved.
export function applyConvolutionPerChannel(imageData, width, height, kernel, normalize = false) {
  const src = imageData.data
  const output = new Uint8ClampedArray(src.length)
  let kernelSum = kernel.reduce((a, b) => a + b, 0)
  if (kernelSum === 0) kernelSum = 1
  const shouldNormalize = normalize && kernelSum > 1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sums = [0, 0, 0]
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const px = x + kx
          const py = y + ky
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const srcIdx = (py * width + px) * 4
            const kernelIdx = (ky + 1) * 3 + (kx + 1)
            const weight = kernel[kernelIdx]
            sums[0] += src[srcIdx] * weight
            sums[1] += src[srcIdx + 1] * weight
            sums[2] += src[srcIdx + 2] * weight
          }
        }
      }

      const outIdx = (y * width + x) * 4
      for (let channel = 0; channel < 3; channel++) {
        const sum = shouldNormalize ? sums[channel] / kernelSum : sums[channel]
        output[outIdx + channel] = Math.max(0, Math.min(255, Math.round(sum)))
      }
      output[outIdx + 3] = src[outIdx + 3]
    }
  }
  return new ImageData(output, width, height)
}

// Apply a separable box blur independently to R, G, and B. Alpha is preserved.
export function applyBoxBlurPerChannel(imageData, width, height, radius = 7) {
  const src = imageData.data
  const temp = new Float32Array(width * height * 3)
  const output = new Uint8ClampedArray(src.length)
  const rowPrefix = [
    new Float32Array(width + 1),
    new Float32Array(width + 1),
    new Float32Array(width + 1),
  ]
  const columnPrefix = [
    new Float32Array(height + 1),
    new Float32Array(height + 1),
    new Float32Array(height + 1),
  ]

  for (let y = 0; y < height; y++) {
    rowPrefix[0][0] = 0
    rowPrefix[1][0] = 0
    rowPrefix[2][0] = 0

    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4
      rowPrefix[0][x + 1] = rowPrefix[0][x] + src[srcIdx]
      rowPrefix[1][x + 1] = rowPrefix[1][x] + src[srcIdx + 1]
      rowPrefix[2][x + 1] = rowPrefix[2][x] + src[srcIdx + 2]
    }

    for (let x = 0; x < width; x++) {
      const left = Math.max(0, x - radius)
      const right = Math.min(width - 1, x + radius)
      const count = right - left + 1
      const tempIdx = (y * width + x) * 3

      temp[tempIdx] = (rowPrefix[0][right + 1] - rowPrefix[0][left]) / count
      temp[tempIdx + 1] = (rowPrefix[1][right + 1] - rowPrefix[1][left]) / count
      temp[tempIdx + 2] = (rowPrefix[2][right + 1] - rowPrefix[2][left]) / count
    }
  }

  for (let x = 0; x < width; x++) {
    columnPrefix[0][0] = 0
    columnPrefix[1][0] = 0
    columnPrefix[2][0] = 0

    for (let y = 0; y < height; y++) {
      const tempIdx = (y * width + x) * 3
      columnPrefix[0][y + 1] = columnPrefix[0][y] + temp[tempIdx]
      columnPrefix[1][y + 1] = columnPrefix[1][y] + temp[tempIdx + 1]
      columnPrefix[2][y + 1] = columnPrefix[2][y] + temp[tempIdx + 2]
    }

    for (let y = 0; y < height; y++) {
      const top = Math.max(0, y - radius)
      const bottom = Math.min(height - 1, y + radius)
      const count = bottom - top + 1
      const outIdx = (y * width + x) * 4

      output[outIdx] = Math.max(0, Math.min(255, Math.round((columnPrefix[0][bottom + 1] - columnPrefix[0][top]) / count)))
      output[outIdx + 1] = Math.max(0, Math.min(255, Math.round((columnPrefix[1][bottom + 1] - columnPrefix[1][top]) / count)))
      output[outIdx + 2] = Math.max(0, Math.min(255, Math.round((columnPrefix[2][bottom + 1] - columnPrefix[2][top]) / count)))
      output[outIdx + 3] = src[outIdx + 3]
    }
  }

  return new ImageData(output, width, height)
}

// Convert RGBA ImageData to grayscale in-place
export function toGrayscale(imageData) {
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
    data[i] = gray
    data[i + 1] = gray
    data[i + 2] = gray
  }
  return imageData
}

// Resize any image/canvas source to a 28×28 grayscale ImageData for inference
export function preprocessForClassification(source) {
  const canvas = document.createElement('canvas')
  canvas.width = 28
  canvas.height = 28
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, 28, 28)
  const srcWidth = source.width || source.naturalWidth
  const srcHeight = source.height || source.naturalHeight
  const scale = Math.min(26 / srcWidth, 26 / srcHeight)
  const scaledWidth = srcWidth * scale
  const scaledHeight = srcHeight * scale
  const offsetX = (28 - scaledWidth) / 2
  const offsetY = (28 - scaledHeight) / 2
  ctx.drawImage(source, offsetX, offsetY, scaledWidth, scaledHeight)
  return toGrayscale(ctx.getImageData(0, 0, 28, 28))
}
