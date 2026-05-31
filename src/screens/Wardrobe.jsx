import { useRef, useState } from 'react'
import { CATEGORIES } from '../lib/storage.js'
import { fileToCompressedDataURL } from '../lib/image.js'
import Sheet from '../components/Sheet.jsx'
import { PlusIcon, CameraIcon, TrashIcon } from '../components/icons.jsx'

const FILTERS = ['All', ...CATEGORIES]

export default function Wardrobe({ items, onAdd, onDelete }) {
  const [filter, setFilter] = useState('All')
  const [adding, setAdding] = useState(false)

  const visible = filter === 'All' ? items : items.filter((it) => it.category === filter)

  return (
    <div className="px-4">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wardrobe</h1>
          <p className="text-sm text-subtle">{items.length} item{items.length === 1 ? '' : 's'}</p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="grid h-11 w-11 place-items-center rounded-full bg-ink text-canvas shadow-card transition active:scale-95"
          aria-label="Add item"
        >
          <PlusIcon className="h-6 w-6" />
        </button>
      </header>

      <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filter === f ? 'bg-ink text-canvas' : 'bg-white text-subtle shadow-card'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState onAdd={() => setAdding(true)} filtered={filter !== 'All'} />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {visible.map((item) => (
            <ItemTile key={item.id} item={item} onDelete={onDelete} />
          ))}
        </div>
      )}

      <AddItemSheet open={adding} onClose={() => setAdding(false)} onAdd={onAdd} />
    </div>
  )
}

function ItemTile({ item, onDelete }) {
  const [confirm, setConfirm] = useState(false)
  const pressTimer = useRef(null)

  const startPress = () => {
    pressTimer.current = setTimeout(() => setConfirm(true), 500)
  }
  const cancelPress = () => clearTimeout(pressTimer.current)

  return (
    <div
      className="relative aspect-[3/4] overflow-hidden rounded-xl2 bg-white shadow-card"
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
    >
      <img src={item.image} alt={item.name || item.category} className="h-full w-full object-cover" />
      <span className="absolute left-2 top-2 rounded-full bg-canvas/90 px-2 py-0.5 text-[10px] font-medium text-ink shadow-card">
        {item.category}
      </span>
      {item.name && (
        <span className="absolute bottom-2 left-2 right-2 truncate rounded-full bg-canvas/90 px-2 py-0.5 text-xs text-ink shadow-card">
          {item.name}
        </span>
      )}

      <button
        onClick={() => setConfirm(true)}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-canvas/90 text-ink shadow-card"
        aria-label="Delete item"
      >
        <TrashIcon className="h-4 w-4" />
      </button>

      {confirm && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/70 p-3 text-center">
          <p className="text-sm font-medium text-canvas">Delete this item?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirm(false)}
              className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink"
            >
              Cancel
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="rounded-full bg-red-500 px-3 py-1 text-xs font-medium text-white"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({ onAdd, filtered }) {
  return (
    <div className="mt-16 flex flex-col items-center text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-card">
        <CameraIcon className="h-8 w-8 text-subtle" />
      </div>
      <p className="mt-4 font-medium">{filtered ? 'Nothing here yet' : 'Your closet is empty'}</p>
      <p className="mt-1 max-w-[16rem] text-sm text-subtle">
        Snap or upload a photo of a piece to start building your wardrobe.
      </p>
      {!filtered && (
        <button
          onClick={onAdd}
          className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas shadow-card transition active:scale-95"
        >
          Add your first item
        </button>
      )}
    </div>
  )
}

function AddItemSheet({ open, onClose, onAdd }) {
  const [image, setImage] = useState(null)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const reset = () => {
    setImage(null)
    setCategory(CATEGORIES[0])
    setName('')
    setError('')
    setBusy(false)
  }

  const close = () => {
    reset()
    onClose()
  }

  const onPick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    try {
      const dataUrl = await fileToCompressedDataURL(file)
      setImage(dataUrl)
    } catch (err) {
      setError('Could not read that image. Try another.')
    } finally {
      setBusy(false)
      e.target.value = ''
    }
  }

  const save = () => {
    if (!image) return
    const ok = onAdd({ image, category, name })
    if (ok === false) {
      setError('Storage is full. Delete some items and try again.')
      return
    }
    close()
  }

  return (
    <Sheet open={open} title="Add item" onClose={close}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onPick}
      />

      <button
        onClick={() => fileRef.current?.click()}
        className="relative flex aspect-[3/4] w-full items-center justify-center overflow-hidden rounded-xl2 border border-dashed border-line bg-white"
      >
        {image ? (
          <img src={image} alt="Preview" className="h-full w-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-subtle">
            <CameraIcon className="h-8 w-8" />
            <span className="text-sm font-medium">{busy ? 'Processing…' : 'Take photo or upload'}</span>
          </div>
        )}
      </button>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">Category</p>
        <div className="flex gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-1 rounded-full py-2 text-sm font-medium transition ${
                category === c ? 'bg-ink text-canvas' : 'bg-white text-subtle shadow-card'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">Name (optional)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. White linen shirt"
          maxLength={40}
          className="w-full rounded-xl2 border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        onClick={save}
        disabled={!image || busy}
        className="mt-5 w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-canvas shadow-card transition active:scale-[0.99] disabled:opacity-40"
      >
        Add to wardrobe
      </button>
    </Sheet>
  )
}
