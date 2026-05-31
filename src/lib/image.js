// Image utilities: resize, compress, and background removal.

// Resize a File and return a data URL.
// outputFormat: 'jpeg' for photos, 'png' when background removal follows.
export function fileToDataURL(file, { maxSize = 900, outputFormat = 'png' } = {}) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Not an image file'))
      return
    }
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Could not decode image'))
      img.onload = () => {
        let { width, height } = img
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width)
          width = maxSize
        } else if (height > maxSize) {
          width = Math.round((width * maxSize) / height)
          height = maxSize
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const mime = outputFormat === 'jpeg' ? 'image/jpeg' : 'image/png'
        const quality = outputFormat === 'jpeg' ? 0.78 : undefined
        resolve(quality !== undefined ? canvas.toDataURL(mime, quality) : canvas.toDataURL(mime))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

// Legacy alias used by seed.js (images already sized, no bg removal needed).
export function fileToCompressedDataURL(file, opts) {
  return fileToDataURL(file, { ...opts, outputFormat: 'jpeg' })
}

// Remove the background from a PNG data URL using flood-fill from all edges.
// Works well for product images on white / solid / near-solid backgrounds.
// Returns a PNG data URL with transparency where the background was.
export function removeImageBackground(dataUrl, { tolerance = 32 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onerror = () => reject(new Error('Could not load image'))
    img.onload = async () => {
      const { width, height } = img
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, width, height)
      const d = imageData.data

      // Detect background colour from the four corners.
      const sample = (x, y) => {
        const i = (y * width + x) * 4
        return [d[i], d[i + 1], d[i + 2]]
      }
      const corners = [
        sample(0, 0),
        sample(width - 1, 0),
        sample(0, height - 1),
        sample(width - 1, height - 1)
      ]
      // Pick the brightest corner as the background reference (most product
      // images have a white or near-white background).
      let bgR = 0, bgG = 0, bgB = 0, bestBrightness = -1
      for (const [r, g, b] of corners) {
        const brightness = r + g + b
        if (brightness > bestBrightness) {
          bestBrightness = brightness
          bgR = r; bgG = g; bgB = b
        }
      }

      // Yield to the browser so the "Processing" spinner has rendered.
      await new Promise((r) => setTimeout(r, 0))

      // Flood fill (BFS) from all edge pixels that match the background.
      const total = width * height
      const visited = new Uint8Array(total)
      const queue = new Int32Array(total)
      let head = 0, tail = 0

      const isBackground = (i4) => {
        const dr = d[i4] - bgR
        const dg = d[i4 + 1] - bgG
        const db = d[i4 + 2] - bgB
        return Math.sqrt(dr * dr + dg * dg + db * db) <= tolerance
      }

      const enqueue = (idx) => {
        if (idx < 0 || idx >= total || visited[idx]) return
        const i4 = idx * 4
        if (d[i4 + 3] === 0 || isBackground(i4)) {
          visited[idx] = 1
          queue[tail++] = idx
        }
      }

      // Seed from all four edges.
      for (let x = 0; x < width; x++) {
        enqueue(x)
        enqueue((height - 1) * width + x)
      }
      for (let y = 1; y < height - 1; y++) {
        enqueue(y * width)
        enqueue(y * width + width - 1)
      }

      while (head < tail) {
        const idx = queue[head++]
        const x = idx % width
        const y = (idx / width) | 0
        if (x > 0) enqueue(idx - 1)
        if (x < width - 1) enqueue(idx + 1)
        if (y > 0) enqueue(idx - width)
        if (y < height - 1) enqueue(idx + width)
      }

      // Erase background pixels and slightly feather hard edges.
      for (let i = 0; i < total; i++) {
        if (!visited[i]) continue
        const i4 = i * 4
        // Check if any neighbour is foreground → soft edge.
        const x = i % width
        const y = (i / width) | 0
        let hasFgNeighbour = false
        if (x > 0 && !visited[i - 1]) hasFgNeighbour = true
        else if (x < width - 1 && !visited[i + 1]) hasFgNeighbour = true
        else if (y > 0 && !visited[i - width]) hasFgNeighbour = true
        else if (y < height - 1 && !visited[i + width]) hasFgNeighbour = true
        d[i4 + 3] = hasFgNeighbour ? 128 : 0
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.src = dataUrl
  })
}
