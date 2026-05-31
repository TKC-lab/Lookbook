// localStorage data layer for Fit Check.
// Two collections: wardrobe items and saved outfits.

export const ITEMS_KEY = 'fitcheck.items.v1'
export const OUTFITS_KEY = 'fitcheck.outfits.v1'

export const CATEGORIES = ['Tops', 'Bottoms', 'Shoes']
export const OCCASIONS = ['Casual', 'Work', 'Going Out', 'Other']

function read(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    // Most likely the 5MB quota was exceeded by base64 images.
    console.error('Fit Check: failed to save to localStorage', err)
    return false
  }
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/* ---------- Wardrobe items ---------- */

export function getItems() {
  return read(ITEMS_KEY)
}

export function getItemsByCategory(category) {
  return getItems().filter((it) => it.category === category)
}

// item: { image (base64), category, name? }
export function addItem({ image, category, name = '' }) {
  const items = getItems()
  const item = {
    id: uid(),
    image,
    category,
    name: name.trim(),
    createdAt: Date.now()
  }
  items.unshift(item)
  const ok = write(ITEMS_KEY, items)
  return ok ? item : null
}

export function deleteItem(id) {
  write(ITEMS_KEY, getItems().filter((it) => it.id !== id))
  // Also drop any saved outfit that referenced this item.
  const outfits = getOutfits().filter(
    (o) => ![o.topId, o.bottomId, o.shoesId].includes(id)
  )
  write(OUTFITS_KEY, outfits)
}

/* ---------- Saved outfits ---------- */

export function getOutfits() {
  return read(OUTFITS_KEY)
}

// outfit: { topId, bottomId, shoesId, name?, occasion? }
export function addOutfit({ topId, bottomId, shoesId, name = '', occasion = 'Casual' }) {
  const outfits = getOutfits()
  const outfit = {
    id: uid(),
    topId,
    bottomId,
    shoesId,
    name: name.trim(),
    occasion,
    createdAt: Date.now()
  }
  outfits.unshift(outfit)
  const ok = write(OUTFITS_KEY, outfits)
  return ok ? outfit : null
}

export function updateOutfit(id, patch) {
  const next = getOutfits().map((o) =>
    o.id === id ? { ...o, ...patch, name: (patch.name ?? o.name).trim() } : o
  )
  write(OUTFITS_KEY, next)
}

export function reorderOutfits(orderedIds) {
  const byId = indexById(getOutfits())
  const next = orderedIds.map((id) => byId[id]).filter(Boolean)
  write(OUTFITS_KEY, next)
}

export function deleteOutfit(id) {
  write(OUTFITS_KEY, getOutfits().filter((o) => o.id !== id))
}

// Resolve an outfit's item ids into full item objects (or null if deleted).
export function resolveOutfit(outfit, itemsById) {
  return {
    Tops: itemsById[outfit.topId] || null,
    Bottoms: itemsById[outfit.bottomId] || null,
    Shoes: itemsById[outfit.shoesId] || null
  }
}

export function indexById(items) {
  return items.reduce((acc, it) => {
    acc[it.id] = it
    return acc
  }, {})
}
