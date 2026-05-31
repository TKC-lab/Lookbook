// First-run starter wardrobe. Loads the bundled sample images into
// localStorage once, only when the closet is empty. Clearing data from
// Settings keeps the seed flag, so it won't repopulate behind the user.
import { ITEMS_KEY } from './storage.js'

// Vite bundles each image and gives us a (base-path aware) URL.
const urls = import.meta.glob('../seed-images/*.jpg', {
  eager: true,
  import: 'default',
  query: '?url'
})

function urlFor(file) {
  return urls[`../seed-images/${file}`]
}

// Ordered for a tidy grid: tops, then bottoms, then shoes.
const SEED = [
  { file: 'white-buttonup.jpg', category: 'Tops', name: 'White button-up' },
  { file: 'black-buttonup.jpg', category: 'Tops', name: 'Black button-up' },
  { file: 'white-polo.jpg', category: 'Tops', name: 'White polo' },
  { file: 'grey-polo.jpg', category: 'Tops', name: 'Grey polo' },
  { file: 'black-polo.jpg', category: 'Tops', name: 'Black polo' },
  { file: 'black-tee.jpg', category: 'Tops', name: 'Black tee' },
  { file: 'charcoal-tee.jpg', category: 'Tops', name: 'Charcoal tee' },
  { file: 'heather-grey-tee.jpg', category: 'Tops', name: 'Heather grey tee' },
  { file: 'plaid-flannel.jpg', category: 'Tops', name: 'Plaid flannel' },
  { file: 'black-trousers.jpg', category: 'Bottoms', name: 'Black trousers' },
  { file: 'black-slim-pants.jpg', category: 'Bottoms', name: 'Black slim pants' },
  { file: 'black-shorts.jpg', category: 'Bottoms', name: 'Black shorts' },
  { file: 'white-sneakers.jpg', category: 'Shoes', name: 'White sneakers' },
  { file: 'black-sneakers.jpg', category: 'Shoes', name: 'Black sneakers' }
]

const SEED_FLAG = 'lookbook.seeded.v1'

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
    console.error('Lookbook: starter wardrobe seed failed', err)
  }
}
