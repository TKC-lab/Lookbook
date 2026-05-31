import { useRef, useState } from 'react'
import { CATEGORIES } from '../lib/storage.js'
import { fileToDataURL, removeImageBackground } from '../lib/image.js'
import Sheet from '../components/Sheet.jsx'
import { PlusIcon, UploadIcon, TrashIcon, PencilIcon } from '../components/icons.jsx'

const FILTERS = ['All', ...CATEGORIES]

export default function Wardrobe({ items, onAdd, onUpdate, onDelete }) {
  const [filter, setFilter] = useState('All')
  const [adding, setAdding] = useState(false)
  const [editingItem, setEditingItem] = useState(null)

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
            <ItemTile
              key={item.id}
              item={item}
              onDelete={onDelete}
              onEdit={() => setEditingItem(item)}
            />
          ))}
        </div>
      )}

      <AddItemSheet open={adding} onClose={() => setAdding(false)} onAdd={onAdd} />

      {editingItem && (
        <EditItemSheet
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(patch) => {
            onUpdate(editingItem.id, patch)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

function ItemTile({ item, onDelete, onEdit }) {
  const [confirm, setConfirm] = useState(false)

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl2 bg-white shadow-card">
      <img src={item.image} alt={item.name || item.category} className="h-full w-full object-contain p-3" />
      <span className="absolute left-2 top-2 rounded-full bg-canvas/90 px-2 py-0.5 text-[10px] font-medium text-ink shadow-card">
        {item.category}
      </span>
      {item.name && (
        <span className="absolute bottom-2 left-2 right-2 truncate rounded-full bg-canvas/90 px-2 py-0.5 text-xs text-ink shadow-card">
          {item.name}
        </span>
      )}

      <div className="absolute right-2 top-2 flex flex-col gap-1">
        <button
          onClick={onEdit}
          className="grid h-7 w-7 place-items-center rounded-full bg-canvas/90 text-ink shadow-card"
          aria-label="Edit item"
        >
          <PencilIcon className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setConfirm(true)}
          className="grid h-7 w-7 place-items-center rounded-full bg-canvas/90 text-ink shadow-card"
          aria-label="Delete item"
        >
          <TrashIcon className="h-3.5 w-3.5" />
        </button>
      </div>

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
        <UploadIcon className="h-8 w-8 text-subtle" />
      </div>
      <p className="mt-4 font-medium">{filtered ? 'Nothing here yet' : 'Your closet is empty'}</p>
      <p className="mt-1 max-w-[16rem] text-sm text-subtle">
        Save product images from any website, then upload them here. Backgrounds are removed automatically.
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

// Each queue entry: { id, raw, processed, status: 'loading'|'removing'|'done'|'error' }
function AddItemSheet({ open, onClose, onAdd }) {
  const [queue, setQueue] = useState([])
  const [removeBg, setRemoveBg] = useState(true)
  const [category, setCategory] = useState(CATEGORIES[0])
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const reset = () => {
    setQueue([])
    setRemoveBg(true)
    setCategory(CATEGORIES[0])
    setName('')
    setError('')
  }

  const close = () => { reset(); onClose() }

  const processEntry = async (entryId, raw, shouldRemove) => {
    if (!shouldRemove) {
      setQueue((prev) => prev.map((e) => e.id === entryId ? { ...e, processed: raw, status: 'done' } : e))
      return
    }
    setQueue((prev) => prev.map((e) => e.id === entryId ? { ...e, status: 'removing' } : e))
    try {
      const result = await removeImageBackground(raw)
      setQueue((prev) => prev.map((e) => e.id === entryId ? { ...e, processed: result, status: 'done' } : e))
    } catch {
      setQueue((prev) => prev.map((e) => e.id === entryId ? { ...e, processed: raw, status: 'done' } : e))
    }
  }

  const onPick = async (e) => {
    const files = [...(e.target.files || [])]
    if (!files.length) return
    e.target.value = ''
    setError('')

    const newEntries = files.map((_, i) => ({
      id: Date.now() + i,
      raw: null,
      processed: null,
      status: 'loading'
    }))

    // Replace queue when repicking while single item shown; append otherwise.
    setQueue(newEntries)
    if (files.length === 1) setName('')

    files.forEach(async (file, i) => {
      const entryId = newEntries[i].id
      try {
        const resized = await fileToDataURL(file, { maxSize: 900, outputFormat: 'png' })
        setQueue((prev) => prev.map((e) => e.id === entryId ? { ...e, raw: resized } : e))
        await processEntry(entryId, resized, removeBg)
      } catch {
        setQueue((prev) => prev.map((e) => e.id === entryId ? { ...e, status: 'error' } : e))
      }
    })
  }

  const toggleRemoveBg = () => {
    const next = !removeBg
    setRemoveBg(next)
    setQueue((prev) => {
      prev.filter((e) => e.raw).forEach((e) => processEntry(e.id, e.raw, next))
      return prev
    })
  }

  const save = () => {
    const ready = queue.filter((e) => e.status === 'done' && e.processed)
    if (ready.length === 0) return
    for (const entry of ready) {
      const ok = onAdd({ image: entry.processed, category, name: ready.length === 1 ? name : '' })
      if (ok === false) {
        setError('Storage is full. Delete some items and try again.')
        return
      }
    }
    close()
  }

  const isSingle = queue.length <= 1
  const singleEntry = queue[0] || null
  const singleImage = singleEntry?.processed || null
  const allBusy = queue.some((e) => e.status === 'loading' || e.status === 'removing')
  const anyDone = queue.some((e) => e.status === 'done')
  const statusLabel = queue.some((e) => e.status === 'loading') ? 'Reading image…' : 'Removing background…'

  return (
    <Sheet open={open} title="Add item" onClose={close}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={onPick}
      />

      {/* Single-image preview */}
      {isSingle && (
        <button
          onClick={() => fileRef.current?.click()}
          disabled={allBusy}
          className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl2 border border-dashed border-line"
          style={{
            backgroundImage: singleImage
              ? 'repeating-conic-gradient(#e8e6e2 0% 25%, #f5f4f1 0% 50%)'
              : undefined,
            backgroundSize: '20px 20px'
          }}
        >
          {singleImage ? (
            <img src={singleImage} alt="Preview" className="h-full w-full object-contain p-2" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-subtle">
              <UploadIcon className="h-9 w-9" />
              <div className="text-center">
                <p className="text-sm font-medium text-ink">Choose photo(s)</p>
                <p className="mt-0.5 text-xs">Select one or multiple images from your library</p>
              </div>
            </div>
          )}

          {allBusy && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-canvas/80 backdrop-blur-sm">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-ink" />
              <span className="text-xs font-medium text-ink">{statusLabel}</span>
            </div>
          )}
        </button>
      )}

      {/* Multi-image grid */}
      {!isSingle && (
        <div>
          <div className="grid grid-cols-3 gap-2">
            {queue.map((entry) => (
              <div
                key={entry.id}
                className="relative aspect-square overflow-hidden rounded-xl bg-canvas"
                style={{
                  backgroundImage: entry.processed
                    ? 'repeating-conic-gradient(#e8e6e2 0% 25%, #f5f4f1 0% 50%)'
                    : undefined,
                  backgroundSize: '12px 12px'
                }}
              >
                {entry.processed && (
                  <img src={entry.processed} alt="" className="h-full w-full object-contain p-1" />
                )}
                {(entry.status === 'loading' || entry.status === 'removing') && (
                  <div className="absolute inset-0 flex items-center justify-center bg-canvas/70">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-line border-t-ink" />
                  </div>
                )}
                {entry.status === 'error' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-canvas/70">
                    <span className="text-[10px] text-red-500">Error</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-2 text-sm text-subtle underline underline-offset-2"
          >
            Choose different photos
          </button>
        </div>
      )}

      {/* Repick + remove-background toggle (single mode) */}
      {isSingle && singleImage && !allBusy && (
        <div className="mt-3 flex items-center justify-between">
          <button
            onClick={() => fileRef.current?.click()}
            className="text-sm text-subtle underline underline-offset-2"
          >
            Choose different photo(s)
          </button>
          <RemoveBgToggle value={removeBg} onToggle={toggleRemoveBg} />
        </div>
      )}

      {/* Remove-background toggle (multi mode) */}
      {!isSingle && (
        <div className="mt-3 flex justify-end">
          <RemoveBgToggle value={removeBg} onToggle={toggleRemoveBg} disabled={allBusy} />
        </div>
      )}

      {/* Category */}
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

      {/* Name (single only) */}
      {isSingle && (
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
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        onClick={save}
        disabled={!anyDone || allBusy}
        className="mt-5 w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-canvas shadow-card transition active:scale-[0.99] disabled:opacity-40"
      >
        {queue.length > 1 ? `Add ${queue.filter((e) => e.status === 'done').length} item${queue.filter((e) => e.status === 'done').length === 1 ? '' : 's'} to wardrobe` : 'Add to wardrobe'}
      </button>
    </Sheet>
  )
}

function RemoveBgToggle({ value, onToggle, disabled }) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className="flex items-center gap-2 text-sm disabled:opacity-50"
      aria-pressed={value}
    >
      <span className="text-subtle">Remove background</span>
      <span
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
          value ? 'bg-ink' : 'bg-line'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 translate-x-1 rounded-full bg-white shadow transition ${
            value ? 'translate-x-[18px]' : ''
          }`}
        />
      </span>
    </button>
  )
}

function EditItemSheet({ item, onClose, onSave }) {
  const [category, setCategory] = useState(item.category)
  const [name, setName] = useState(item.name || '')

  return (
    <Sheet open title="Edit item" onClose={onClose}>
      {/* Image preview (read-only) */}
      <div
        className="flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl2"
        style={{
          backgroundImage: 'repeating-conic-gradient(#e8e6e2 0% 25%, #f5f4f1 0% 50%)',
          backgroundSize: '20px 20px'
        }}
      >
        <img src={item.image} alt={item.name || item.category} className="h-full w-full object-contain p-2" />
      </div>

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

      <button
        onClick={() => onSave({ category, name })}
        className="mt-5 w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-canvas shadow-card transition active:scale-[0.99]"
      >
        Save changes
      </button>
    </Sheet>
  )
}
