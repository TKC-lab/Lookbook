import { GridIcon, HangerIcon, LayersIcon, SettingsIcon } from './icons.jsx'

const TABS = [
  { key: 'outfits', label: 'Outfits', Icon: LayersIcon },
  { key: 'build', label: 'Build', Icon: HangerIcon },
  { key: 'wardrobe', label: 'Wardrobe', Icon: GridIcon },
  { key: 'settings', label: 'Settings', Icon: SettingsIcon }
]

export default function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-line bg-canvas/90 backdrop-blur-md pb-safe">
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = active === key
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors"
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  isActive ? 'text-ink' : 'text-subtle/60'
                }`}
              />
              <span
                className={`text-[11px] font-medium transition-colors ${
                  isActive ? 'text-ink' : 'text-subtle/60'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
