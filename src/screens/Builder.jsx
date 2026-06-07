import { useMemo, useState, useEffect } from 'react'
import { CATEGORIES, OCCASIONS } from '../lib/storage.js'
import SwipeStack from '../components/SwipeStack.jsx'
import Sheet from '../components/Sheet.jsx'
import { CheckIcon } from '../components/icons.jsx'

export default function Builder({ items, onSave, onGoToWardrobe }) {
  const byCat = useMemo(
    () => ({
      Tops: items.filter((it) => it.category === 'Tops'),
      Bottoms: items.filter((it) => it.category === 'Bottoms'),
      Shoes: items.filter((it) => it.category === 'Shoes')
    }),
    [items]
  )

  const [idx, setIdx] = useState({ Tops: 0, Bottoms: 0, Shoes: 0 })
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(false)

  // Keep indices in range as the wardrobe changes.
  useEffect(() => {
    setIdx((prev) => {
      const next = { ...prev }
      for (const c of CATEGORIES) {
        const len = byCat[c].length
        next[c] = len === 0 ? 0 : Math.min(prev[c], len - 1)
      }
      return next
    })
  }, [byCat])

  const selected = {
    Tops: byCat.Tops[idx.Tops] || null,
    Bottoms: byCat.Bottoms[idx.Bottoms] || null,
    Shoes: byCat.Shoes[idx.Shoes] || null
  }

  const hasAny = items.length > 0
  const canSave = selected.Tops && selected.Bottoms && selected.Shoes

  const handleSave = ({ name, occasion }) => {
    const ok = onSave({
      topId: selected.Tops.id,
      bottomId: selected.Bottoms.id,
      shoesId: selected.Shoes.id,
      name,
      occasion
    })
    if (ok === false) return false
    setSaving(false)
    setToast(true)
    setTimeout(() => setToast(false), 1800)
    return true
  }

  if (!hasAny) {
    return (
      <div className="px-4">
        <Header />
        <div className="mt-16 flex flex-col items-center text-center">
          <p className="font-medium">Nothing to style yet</p>
          <p className="mt-1 max-w-[16rem] text-sm text-subtle">
            Add a few tops, bottoms and shoes to start building outfits.
          </p>
          <button
            onClick={onGoToWardrobe}
            className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-canvas shadow-card transition active:scale-95"
          >
            Go to Wardrobe
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4">
      <Header />

      <div className="mt-4 space-y-4">
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

      <button
        onClick={() => setSaving(true)}
        disabled={!canSave}
        className="mt-6 w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-canvas shadow-card transition active:scale-[0.99] disabled:opacity-40"
      >
        {canSave ? 'Save outfit' : 'Pick one from each row'}
      </button>

      <SaveOutfitSheet
        open={saving}
        onClose={() => setSaving(false)}
        selected={selected}
        onSave={handleSave}
      />

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-canvas shadow-float">
          <CheckIcon className="h-4 w-4" />
          Outfit saved
        </div>
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="pt-2">
      <h1 className="text-2xl font-semibold tracking-tight">Build Outfit</h1>
      <p className="text-sm text-subtle">Swipe each row to mix and match</p>
    </header>
  )
}

function SaveOutfitSheet({ open, onClose, selected, onSave }) {
  const [name, setName] = useState('')
  const [occasion, setOccasion] = useState(OCCASIONS[0])
  const [error, setError] = useState('')

  const close = () => {
    setName('')
    setOccasion(OCCASIONS[0])
    setError('')
    onClose()
  }

  const submit = () => {
    const ok = onSave({ name, occasion })
    if (ok === false) {
      setError('Storage is full. Delete some outfits and try again.')
      return
    }
    setName('')
    setOccasion(OCCASIONS[0])
    setError('')
  }

  return (
    <Sheet open={open} title="Save outfit" onClose={close}>
      <div className="flex gap-2">
        {CATEGORIES.map((c) => (
          <div key={c} className="aspect-square flex-1 overflow-hidden rounded-xl2 bg-white shadow-card">
            {selected[c] ? (
              <img src={selected[c].image} alt={c} className="h-full w-full object-contain p-1" />
            ) : (
              <div className="grid h-full place-items-center text-xs text-subtle">{c}</div>
            )}
          </div>
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

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <button
        onClick={submit}
        className="mt-5 w-full rounded-full bg-ink py-3.5 text-sm font-semibold text-canvas shadow-card transition active:scale-[0.99]"
      >
        Save to outfits
      </button>
    </Sheet>
  )
}
