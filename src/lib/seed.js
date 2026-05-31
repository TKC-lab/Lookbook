// First-run starter wardrobe. Loads the bundled sample images into
// localStorage once, only when the closet is empty. Clearing data from
// Settings keeps the seed flag, so it won't repopulate behind the user.
import { ITEMS_KEY } from './storage.js'

// Vite bundles each image and gives us a (base-path aware) URL.
const urls = import.meta.glob('../seed-images/*', {
  eager: true,
  import: 'default',
  query: '?url'
})

function urlFor(file) {
  return urls[`../seed-images/${file}`]
}

// Ordered for a tidy grid: tops, then bottoms, then shoes.
const SEED = [
  { file: 'white-buttonup.jpg',      category: 'Tops',    name: 'White button-up' },
  { file: 'black-buttonup.jpg',      category: 'Tops',    name: 'Black button-up' },
  { file: 'white-polo.jpg',          category: 'Tops',    name: 'White polo' },
  { file: 'grey-polo.jpg',           category: 'Tops',    name: 'Grey polo' },
  { file: 'black-polo.jpg',          category: 'Tops',    name: 'Black polo' },
  { file: 'white-tee.jpg',           category: 'Tops',    name: 'White tee' },
  { file: 'black-tee.jpg',           category: 'Tops',    name: 'Black tee' },
  { file: 'charcoal-tee.jpg',        category: 'Tops',    name: 'Charcoal tee' },
  { file: 'plaid-flannel.jpg',       category: 'Tops',    name: 'Plaid flannel' },
  { file: 'grey-hoodie.jpg',         category: 'Tops',    name: 'Grey hoodie' },
  { file: 'black-quarter-zip.jpg',   category: 'Tops',    name: 'Black quarter-zip' },
  { file: 'black-trousers.jpg',      category: 'Bottoms', name: 'Black trousers' },
  { file: 'black-slim-pants.jpg',    category: 'Bottoms', name: 'Black slim pants' },
  { file: 'black-joggers.jpg',       category: 'Bottoms', name: 'Black joggers' },
  { file: 'black-shorts.jpg',        category: 'Bottoms', name: 'Black shorts' },
  { file: 'grey-shorts.jpg',         category: 'Bottoms', name: 'Grey shorts' },
  { file: 'adidas-samba.webp',       category: 'Shoes',   name: 'Adidas Samba' },
  { file: 'new-balance-574.webp',    category: 'Shoes',   name: 'New Balance 574' },
  { file: 'black-loafers.webp',      category: 'Shoes',   name: 'Black loafers' },
  { file: 'birkenstock-arizona.webp',category: 'Shoes',   name: 'Birkenstock Arizona' },
]

const SEED_FLAG = 'fitcheck.seeded.v1'

export function seedIfNeeded() {
  try {
    if (localStorage.getItem(SEED_FLAG)) return
    const existing = JSON.parse(localStorage.getItem(ITEMS_KEY) || '[]')
    if (existing.length > 0) {
      localStorage.setItem(SEED_FLAG, '1')
      return
    }
    const now = Date.now()
    const items = SEED.map((s, i) => ({
      id: `seed-${i}`,
      image: urlFor(s.file),
      category: s.category,
      name: s.name,
      createdAt: now - i * 1000
    })).filter((it) => it.image)
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items))
    localStorage.setItem(SEED_FLAG, '1')
  } catch (err) {
    console.error('Fit Check: starter wardrobe seed failed', err)
  }
}
