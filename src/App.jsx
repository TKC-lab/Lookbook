import { useEffect, useState } from 'react'
import * as store from './lib/storage.js'
import BottomNav from './components/BottomNav.jsx'
import Wardrobe from './screens/Wardrobe.jsx'
import Builder from './screens/Builder.jsx'
import Outfits from './screens/Outfits.jsx'
import Settings from './screens/Settings.jsx'

export default function App() {
  const [tab, setTab] = useState('wardrobe')
  const [items, setItems] = useState(() => store.getItems())
  const [outfits, setOutfits] = useState(() => store.getOutfits())

  // Refresh from storage when the tab regains focus (e.g. another tab edited it).
  useEffect(() => {
    const sync = () => {
      setItems(store.getItems())
      setOutfits(store.getOutfits())
    }
    window.addEventListener('focus', sync)
    return () => window.removeEventListener('focus', sync)
  }, [])

  const addItem = (data) => {
    const created = store.addItem(data)
    if (!created) return false
    setItems(store.getItems())
    return true
  }

  const deleteItem = (id) => {
    store.deleteItem(id)
    setItems(store.getItems())
    setOutfits(store.getOutfits())
  }

  const addOutfit = (data) => {
    const created = store.addOutfit(data)
    if (!created) return false
    setOutfits(store.getOutfits())
    return true
  }

  const deleteOutfit = (id) => {
    store.deleteOutfit(id)
    setOutfits(store.getOutfits())
  }

  const updateOutfit = (id, patch) => {
    store.updateOutfit(id, patch)
    setOutfits(store.getOutfits())
  }

  const reorderOutfits = (orderedIds) => {
    store.reorderOutfits(orderedIds)
    setOutfits(store.getOutfits())
  }

  const clearAll = () => {
    items.forEach((it) => store.deleteItem(it.id))
    store.getOutfits().forEach((o) => store.deleteOutfit(o.id))
    setItems(store.getItems())
    setOutfits(store.getOutfits())
  }

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col">
      <main className="flex-1 pb-28 pt-safe">
        {tab === 'wardrobe' && (
          <Wardrobe items={items} onAdd={addItem} onDelete={deleteItem} />
        )}
        {tab === 'build' && (
          <Builder
            items={items}
            onSave={addOutfit}
            onGoToWardrobe={() => setTab('wardrobe')}
          />
        )}
        {tab === 'outfits' && (
          <Outfits
            items={items}
            outfits={outfits}
            onDelete={deleteOutfit}
            onUpdate={updateOutfit}
            onReorder={reorderOutfits}
            onGoToBuild={() => setTab('build')}
          />
        )}
        {tab === 'settings' && (
          <Settings items={items} outfits={outfits} onClearAll={clearAll} />
        )}
      </main>

      <BottomNav active={tab} onChange={setTab} />
    </div>
  )
}
