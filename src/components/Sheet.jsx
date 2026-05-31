import { useEffect } from 'react'
import { CloseIcon } from './icons.jsx'

// Bottom sheet modal. Renders nothing when `open` is false.
export default function Sheet({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="no-scrollbar relative max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-[1.75rem] bg-canvas p-5 pb-safe shadow-float animate-[sheet_0.22s_ease]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-line" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-white text-ink shadow-card"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
      <style>{`@keyframes sheet{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
    </div>
  )
}
