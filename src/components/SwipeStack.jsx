import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from './icons.jsx'

// A single category row in the outfit builder.
// Cycles through `items` with swipe gestures or arrow buttons.
export default function SwipeStack({ category, items, index, onIndexChange }) {
  const [drag, setDrag] = useState(0)
  const [animating, setAnimating] = useState(false)
  const start = useRef(null)
  const count = items.length

  const go = (dir) => {
    if (count === 0) return
    const next = (index + dir + count) % count
    setAnimating(true)
    onIndexChange(next)
    // Reset drag after the transition settles.
    setTimeout(() => setAnimating(false), 220)
    setDrag(0)
  }

  const onPointerDown = (e) => {
    if (count <= 1) return
    start.current = e.clientX
    setAnimating(false)
  }
  const onPointerMove = (e) => {
    if (start.current === null) return
    setDrag(e.clientX - start.current)
  }
  const onPointerUp = () => {
    if (start.current === null) return
    const threshold = 60
    if (drag <= -threshold) go(1)
    else if (drag >= threshold) go(-1)
    else {
      setAnimating(true)
      setDrag(0)
      setTimeout(() => setAnimating(false), 220)
    }
    start.current = null
  }

  const current = count > 0 ? items[index] : null

  return (
    <section className="select-none">
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold tracking-wide text-ink">{category}</h3>
        <span className="text-xs text-subtle">
          {count > 0 ? `${index + 1} / ${count}` : 'Empty'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => go(-1)}
          disabled={count <= 1}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ink shadow-card transition active:scale-95 disabled:opacity-30"
          aria-label={`Previous ${category}`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div
          className="relative h-44 flex-1 touch-pan-y overflow-hidden rounded-xl2 bg-white shadow-card"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {current ? (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                transform: `translateX(${drag}px)`,
                transition: animating ? 'transform 0.2s ease' : 'none',
                opacity: 1 - Math.min(Math.abs(drag) / 400, 0.4)
              }}
            >
              <img
                src={current.image}
                alt={current.name || category}
                className="h-full w-full object-contain p-3"
                draggable={false}
              />
              {current.name && (
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-canvas px-3 py-0.5 text-xs text-ink shadow-card">
                  {current.name}
                </span>
              )}
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center text-subtle">
              <span className="text-sm">No {category.toLowerCase()} yet</span>
              <span className="text-xs">Add some in your Wardrobe</span>
            </div>
          )}
        </div>

        <button
          onClick={() => go(1)}
          disabled={count <= 1}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-ink shadow-card transition active:scale-95 disabled:opacity-30"
          aria-label={`Next ${category}`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  )
}
