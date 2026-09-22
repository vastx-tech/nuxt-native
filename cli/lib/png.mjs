import { crc32, deflateSync } from 'node:zlib'

/**
 * Minimal, dependency-free PNG encoder + a few pixel-drawing primitives —
 * just enough to generate simple branded splash-screen assets (solid
 * backgrounds, a badge with a lettermark) without pulling in a real
 * rasterizer/canvas library for what's fundamentally flat-color shapes.
 */

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii')
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const crcInput = Buffer.concat([typeBuf, data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(crcInput) >>> 0)
  return Buffer.concat([length, typeBuf, data, crc])
}

/** Encodes a raw RGBA pixel buffer (width*height*4 bytes) as a PNG file. */
export function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdrData = Buffer.alloc(13)
  ihdrData.writeUInt32BE(width, 0)
  ihdrData.writeUInt32BE(height, 4)
  ihdrData[8] = 8 // bit depth
  ihdrData[9] = 6 // color type: RGBA
  // bytes 10-12 (compression/filter/interlace) already zero
  const ihdr = chunk('IHDR', ihdrData)

  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0 // per-scanline filter type: None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride)
  }
  const idat = chunk('IDAT', deflateSync(raw))
  const iend = chunk('IEND', Buffer.alloc(0))

  return Buffer.concat([signature, ihdr, idat, iend])
}

/** Allocates a width*height RGBA canvas filled with `color`. */
export function createCanvas(width, height, color = [0, 0, 0, 0]) {
  const buf = Buffer.alloc(width * height * 4)
  for (let i = 0; i < width * height; i++) setPixelIndex(buf, i, color)
  return buf
}

function setPixelIndex(buf, index, [r, g, b, a = 255]) {
  buf[index * 4] = r
  buf[index * 4 + 1] = g
  buf[index * 4 + 2] = b
  buf[index * 4 + 3] = a
}

function setPixel(buf, width, height, x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return
  setPixelIndex(buf, y * width + x, color)
}

/** Fills a filled circle centered at (cx, cy) with the given radius. */
export function fillCircle(buf, width, height, cx, cy, radius, color) {
  const r2 = radius * radius
  const minX = Math.max(0, Math.floor(cx - radius))
  const maxX = Math.min(width - 1, Math.ceil(cx + radius))
  const minY = Math.max(0, Math.floor(cy - radius))
  const maxY = Math.min(height - 1, Math.ceil(cy + radius))
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x + 0.5 - cx
      const dy = y + 0.5 - cy
      if (dx * dx + dy * dy <= r2) setPixel(buf, width, height, x, y, color)
    }
  }
}

/**
 * Draws a simple blocky "N" lettermark inside the given bounding box: two
 * vertical strokes plus a diagonal connecting the top of the left stroke to
 * the bottom of the right one.
 */
export function drawNGlyph(buf, width, height, box, color) {
  const { x: bx, y: by, width: bw, height: bh } = box
  const stroke = Math.max(1, bw * 0.22)

  for (let y = by; y < by + bh; y++) {
    for (let x = bx; x < bx + stroke; x++) setPixel(buf, width, height, Math.round(x), Math.round(y), color)
    for (let x = bx + bw - stroke; x < bx + bw; x++) setPixel(buf, width, height, Math.round(x), Math.round(y), color)

    const t = (y - by) / bh
    const diagonalCenterX = bx + bw * t
    for (let x = diagonalCenterX - stroke / 2; x < diagonalCenterX + stroke / 2; x++) {
      setPixel(buf, width, height, Math.round(x), Math.round(y), color)
    }
  }
}
