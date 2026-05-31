import { useState } from 'react'
import { ITEMS_KEY, OUTFITS_KEY } from '../lib/storage.js'

export default function Settings({ items, outfits, onClearAll }) {
  const [confirm, setConfirm] = useState(false)

  // Rough estimate of how much localStorage Fit Check is using.
  const usedKb = (() => {
    try {
      const bytes =
        (localStorage.getItem(ITEMS_KEY)?.length || 0) +
        (localStorage.getItem(OUTFITS_KEY)?.length || 0)
      return Math.round(bytes / 1024)
    } catch {
      return 0
    }
  })()

  return (
    <div className="px-4">
      <header className="pt-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-subtle">Manage your closet data</p>
      </header>

      <div className="mt-5 space-y-3">
        <StatRow label="Wardrobe items" value={items.length} />
        <StatRow label="Saved outfits" value={outfits.length} />
        <StatRow label="Storage used" value={`~${usedKb} KB`} />
      </div>

      <div className="mt-6 rounded-xl2 bg-white p-4 shadow-card">
        <p className="font-medium">Reset everything</p>
        <p className="mt-1 text-sm text-subtle">
          Permanently delete all wardrobe items and saved outfits from this device.
        </p>
        {confirm ? (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setConfirm(false)}
              className="flex-1 rounded-full bg-canvas py-2.5 text-sm font-medium text-ink"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClearAll()
                setConfirm(false)
              }}
              className="flex-1 rounded-full bg-red-500 py-2.5 text-sm font-medium text-white"
            >
              Delete all
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirm(true)}
            disabled={items.length === 0 && outfits.length === 0}
            className="mt-3 w-full rounded-full border border-red-200 py-2.5 text-sm font-medium text-red-500 disabled:opacity-40"
          >
            Clear all data
          </button>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-subtle">
        Fit Check · all data stays on your device
      </p>
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl2 bg-white px-4 py-3.5 shadow-card">
      <span className="text-sm text-subtle">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
