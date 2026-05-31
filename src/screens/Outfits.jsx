import { useEffect, useMemo, useRef, useState } from 'react'
import { indexById, resolveOutfit, CATEGORIES, OCCASIONS } from '../lib/storage.js'
import SwipeStack from '../components/SwipeStack.jsx'
import Sheet from '../components/Sheet.jsx'
import {
  TrashIcon,
  LayersIcon,
  GripIcon,
  PencilIcon,
  CloseIcon
} from '../components/icons.jsx'

const OCCASION_FILTERS = ['All', ...OCCASIONS]

export default function Outfits({ items, outfits, onDelete, onUpdate, onReorder, onGoToBuild }) {
  const itemsById = useMemo(() => indexById(items), [items])

  // Local mirror of the outfit order so dragging feels live; committed on drop.
  const [order, setOrder] = useState(outfits)
  const orderRef = useRef(order)
  useEffect(() => setOrder(outfits), [outfits])
  useEffect(() => {
    orderRef.current = order
  }, [order])

  const [occasionFilter, setOccasionFilter] = useState('All')
  const [draggingId, setDraggingId] = useState(null)
  const listRef = useRef(null)

  const [expandedId, setExpandedId] = useState(null)
  const [editingId, setEditingId] = useState(null)

  const visible = occasionFilter === 'All' ? order : order.filter((o) => o.occasion === occasionFilter)

  const startDrag = (e, id) => {
    e.preventDefault()
    setDraggingId(id)

    const onMove = (ev) => {
      const y = ev.clientY
      const cards = [...listRef.current.querySelectorAll('[data-oid]')]
      const mids = cards.map((c) => {
        const r = c.getBoundingClientRect()
        return { id: c.dataset.oid, mid: r.top + r.height / 2 }
      })
      const newIndex = mids.filter((m) => m.id !== id && m.mid < y).length
      setOrder((prev) => {
        const cur = prev.findIndex((o) => o.id === id)
        if (cur === -1 || cur === newIndex) return prev
        const next = prev.slice()
        const [moved] = next.splice(cur, 1)
        next.splice(newIndex, 0, moved)
        return next
      })
    }
    const onUp = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      setDraggingId(null)
      onReorder(orderRef.current.map((o) => o.id))
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const expanded = order.find((o) => o.id === expandedId)
  const editing = order.find((o) => o.id === editingId)

  return (
    <div className="px-4">
      <header className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight">Outfits</h1>
        <p className="text-sm text-subtle">
          {outfits.length} saved look{outfits.length === 1 ? '' : 's'}
          {outfits.length > 1 && occasionFilter === 'All' && ' · drag to reorder'}
        </p>
      </header>

      {outfits.length > 0 && (
        <div className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
          {OCCASION_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setOccasionFilter(f)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${
                occasionFilter === f ? 'bg-ink text-canvas' : 'bg-white text-subtle shadow-card'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      {outfits.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-white shadow-card">
            <LayersIcon className="h-8 w-8 text-subtle" />
          </div>
          <p className="mt-4 font-medium">No saved outfits</p>
          <p className="mt-1 max-w-[16rem] text-sm text-subtle">
            Build a combination and save it to see your looks here.
          </p>
          <button
            onClick={onGoToBuild}
            className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas shadow-card transition active:scale-95"
          >
            Build an outfit
          </button>
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <p className="font-medium">No {occasionFilter} outfits</p>
          <p className="mt-1 text-sm text-subtle">Save an outfit with this occasion to see it here.</p>
        </div>
      ) : (
        <div
          ref={listRef}
          className="mt-4 space-y-3"
          style={{ touchAction: draggingId ? 'none' : undefined }}
        >
          {visible.map((o) => (
            <OutfitCard
              key={o.id}
              outfit={o}
              itemsById={itemsById}
              dragging={draggingId === o.id}
              dimmed={draggingId && draggingId !== o.id}
              onStartDrag={occasionFilter === 'All' ? (e) => startDrag(e, o.id) : null}
              onExpand={() => setExpandedId(o.id)}
              onEdit={() => setEditingId(o.id)}
              onDelete={() => onDelete(o.id)}
            />
          ))}
        </div>
      )}

      {expanded && (
        <OutfitDetail
          outfit={expanded}
          itemsById={itemsById}
          onClose={() => setExpandedId(null)}
          onEdit={() => setEditingId(expanded.id)}
        />
      )}

      {editing && (
        <EditOutfitSheet
          outfit={editing}
          items={items}
          onClose={() => setEditingId(null)}
          onSave={(patch) => {
            onUpdate(editing.id, patch)
            setEditingId(null)
          }}
        />
      )}
    </div>
  )
}

function OutfitCard({ outfit, itemsById, dragging, dimmed, onStartDrag, onExpand, onEdit, onDelete }) {
  const [confirm, setConfirm] = useState(false)
  const resolved = resolveOutfit(outfit, itemsById)

  return (
    <div
      data-oid={outfit.id}
      className={`rounded-xl2 bg-white p-3 shadow-card transition ${
        dragging ? 'relative z-10 scale-[1.02] shadow-float' : ''
      } ${dimmed ? 'opacity-60' : ''}`}
    >
      <button onClick={onExpand} className="flex w-full gap-2 text-left">
        {CATEGORIES.map((c) => (
          <div key={c} className="aspect-square flex-1 overflow-hidden rounded-xl bg-canvas">
            {resolved[c] ? (
              <img src={resolved[c].image} alt={c} className="h-full w-full object-contain p-1" />
            ) : (
              <div className="grid h-full place-items-center px-1 text-center text-[10px] text-subtle">
                Item removed
              </div>
            )}
          </div>
        ))}
      </button>

      <div className="mt-3 flex items-center justify-between gap-2">
        <button onClick={onExpand} className="min-w-0 text-left">
          <p className="truncate font-medium">{outfit.name || 'Untitled look'}</p>
          <span className="mt-0.5 inline-block rounded-full bg-canvas px-2.5 py-0.5 text-xs text-subtle">
            {outfit.occasion}
          </span>
        </button>

        {confirm ? (
          <div className="flex shrink-0 gap-2">
            <button
              onClick={() => setConfirm(false)}
              className="rounded-full bg-canvas px-3 py-1.5 text-xs font-medium text-ink"
            >
              Cancel
            </button>
            <button
              onClick={onDelete}
              className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-medium text-white"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={onEdit}
              className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-ink active:scale-95"
              aria-label="Edit outfit"
            >
              <PencilIcon className="h-[18px] w-[18px]" />
            </button>
            <button
              onClick={() => setConfirm(true)}
              className="grid h-9 w-9 place-items-center rounded-full bg-canvas text-ink active:scale-95"
              aria-label="Delete outfit"
            >
              <TrashIcon className="h-[18px] w-[18px]" />
            </button>
            {onStartDrag && (
              <button
                onPointerDown={onStartDrag}
                className="grid h-9 w-9 cursor-grab touch-none place-items-center rounded-full bg-canvas text-subtle active:cursor-grabbing"
                aria-label="Drag to reorder"
              >
                <GripIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Full-screen vertical view: top over bottom over shoes.
function OutfitDetail({ outfit, itemsById, onClose, onEdit }) {
  const resolved = resolveOutfit(outfit, itemsById)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas">
      <header className="grid grid-cols-3 items-center px-4 pb-3 pt-safe">
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center justify-self-start rounded-full bg-white text-ink shadow-card"
          aria-label="Close"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        <div className="text-center">
          <p className="truncate font-semibold">{outfit.name || 'Untitled look'}</p>
          <span className="text-xs text-subtle">{outfit.occasion}</span>
        </div>
        <button
          onClick={onEdit}
          className="justify-self-end rounded-full bg-ink px-4 py-2 text-sm font-medium text-canvas shadow-card active:scale-95"
        >
          Edit
        </button>
      </header>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 pb-10 pt-2">
        <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
          {CATEGORIES.map((c) => (
            <div
              key={c}
              className="w-full overflow-hidden rounded-xl2 bg-white shadow-card"
            >
              {resolved[c] ? (
                <img
                  src={resolved[c].image}
                  alt={resolved[c].name || c}
                  className="h-60 w-full object-contain p-3"
                />
              ) : (
                <div className="grid h-60 place-items-center text-sm text-subtle">
                  {c} · item removed
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EditOutfitSheet({ outfit, items, onClose, onSave }) {
  const byCat = useMemo(
    () => ({
      Tops: items.filter((it) => it.category === 'Tops'),
      Bottoms: items.filter((it) => it.category === 'Bottoms'),
      Shoes: items.filter((it) => it.category === 'Shoes')
    }),
    [items]
  )

  const startIndex = (cat, id) => {
    const i = byCat[cat].findIndex((it) => it.id === id)
    return i < 0 ? 0 : i
  }

  const [idx, setIdx] = useState({
    Tops: startIndex('Tops', outfit.topId),
    Bottoms: startIndex('Bottoms', outfit.bottomId),
    Shoes: startIndex('Shoes', outfit.shoesId)
  })
  const [name, setName] = useState(outfit.name || '')
  const [occasion, setOccasion] = useState(outfit.occasion || OCCASIONS[0])

  const selected = {
    Tops: byCat.Tops[idx.Tops] || null,
    Bottoms: byCat.Bottoms[idx.Bottoms] || null,
    Shoes: byCat.Shoes[idx.Shoes] || null
  }
  const canSave = selected.Tops && selected.Bottoms && selected.Shoes

  const submit = () => {
    if (!canSave) return
    onSave({
      topId: selected.Tops.id,
      bottomId: selected.Bottoms.id,
      shoesId: selected.Shoes.id,
      name,
      occasion
    })
  }

  return (
    <Sheet open title="Edit outfit" onClose={onClose}>
      <div className="space-y-4">
        {CATEGORIES.map((c) => (
          <SwipeStack
            key={c}
            category={c}
            items={byCat[c]}
            index={idx[c]}
            onIndexChange={(i) => setIdx((p) => ({ ...p, [c]: i }))}
          />
        ))}
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">Name (optional)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Friday brunch"
          maxLength={40}
          className="w-full rounded-xl2 border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink"
        />
      </div>

      <div className="mt-4">
        <p className="mb-2 text-sm font-medium">Occasion</p>
        <div className="grid grid-cols-2 gap-2">
          {OCCASIONS.map((o) => (
            <button
              key={o}
              onClick={() => setOccasion(o)}
              className={`rounded-full py-2 text-sm font-medium transition ${
                occasion === o ? 'bg-ink text-canvas' : 'bg-white text-subtle shadow-card'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={submit}
        disabled={!canSave}
        className="mt-5 w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-canvas shadow-card transition active:scale-[0.99] disabled:opacity-40"
      >
        Save changes
      </button>
    </Sheet>
  )
}
