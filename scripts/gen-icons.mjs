// One-off generator for PWA PNG icons. No external deps — rasterizes the
// Lookbook hanger mark with anti-aliased strokes and encodes a PNG by hand.
// Run with:  node scripts/gen-icons.mjs
import zlib from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, '..', 'public')
mkdirSync(outDir, { recursive: true })

const BG = [0x11, 0x11, 0x11]
const FG = [0xfa, 0xf9, 0xf7]

const clamp01 = (x) => Math.max(0, Math.min(1, x))
const smoothstep = (e0, e1, x) => {
  const t = clamp01((x - e0) / (e1 - e0))
  return t * t * (3 - 2 * t)
}

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const len2 = dx * dx + dy * dy
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0
  t = clamp01(t)
  const cx = ax + t * dx
  const cy = ay + t * dy
  return Math.hypot(px - cx, py - cy)
}

// Hanger geometry in normalized [0,1] coordinates.
const segments = [
  [0.5, 0.36, 0.5, 0.44], // neck
  [0.5, 0.44, 0.2, 0.63], // left shoulder
  [0.5, 0.44, 0.8, 0.63], // right shoulder
  [0.2, 0.63, 0.8, 0.63] // bottom bar
]
const hook = { cx: 0.5, cy: 0.31, r: 0.05 }

function coverage(nx, ny, stroke) {
  let d = Infinity
  for (const [ax, ay, bx, by] of segments) {
    d = Math.min(d, distToSegment(nx, ny, ax, ay, bx, by))
  }
  // Hook is a ring (arc); approximate with full ring distance.
  const ring = Math.abs(Math.hypot(nx - hook.cx, ny - hook.cy) - hook.r)
  d = Math.min(d, ring)
  const half = stroke / 2
  // Anti-alias band roughly one pixel wide in normalized units.
  return 1 - smoothstep(half - 0.004, half + 0.004, d)
}

function renderRGBA(size) {
  const stroke = 0.04
  const buf = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = (x + 0.5) / size
      const ny = (y + 0.5) / size
      const a = coverage(nx, ny, stroke)
      const i = (y * size + x) * 4
      buf[i] = Math.round(BG[0] + (FG[0] - BG[0]) * a)
      buf[i + 1] = Math.round(BG[1] + (FG[1] - BG[1]) * a)
      buf[i + 2] = Math.round(BG[2] + (FG[2] - BG[2]) * a)
      buf[i + 3] = 255
    }
  }
  return buf
}

/* ---- minimal PNG encoder ---- */
function crc32(buf) {
  let c = ~0
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i]
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1))
  }
  return ~c >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length, 0)
  const typeBuf = Buffer.from(type, 'ascii')
  const body = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body), 0)
  return Buffer.concat([len, body, crc])
}
function encodePNG(size, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // RGBA
  // raw scanlines, filter byte 0 per row
  const raw = Buffer.alloc((size * 4 + 1) * size)
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  const idat = zlib.deflateSync(raw, { level: 9 })
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0))
  ])
}

for (const [name, size] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180]
]) {
  const png = encodePNG(size, renderRGBA(size))
  writeFileSync(join(outDir, name), png)
  console.log('wrote', name, `(${size}x${size})`)
}
