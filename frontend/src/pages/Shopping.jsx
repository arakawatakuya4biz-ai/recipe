import { useState, useEffect, useRef } from 'react'
import { api } from '../api'

const STORES = [
  { key: 'life',    label: 'ライフ',   bg: 'bg-green-100',  border: 'border-green-400',  text: 'text-green-800',  badge: 'bg-green-500' },
  { key: 'ropia',   label: 'ロピア',   bg: 'bg-red-100',    border: 'border-red-400',    text: 'text-red-800',    badge: 'bg-red-500' },
  { key: 'marusan', label: 'マルサン', bg: 'bg-blue-100',   border: 'border-blue-400',   text: 'text-blue-800',   badge: 'bg-blue-500' },
  { key: 'aeon',    label: 'イオン',   bg: 'bg-orange-100', border: 'border-orange-400', text: 'text-orange-800', badge: 'bg-orange-500' },
  { key: 'unknown', label: '未定',     bg: 'bg-gray-100',   border: 'border-gray-400',   text: 'text-gray-700',   badge: 'bg-gray-400' },
]

function EditSheet({ onClose, onSave, editForm, setEditForm }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-4" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-center text-base mb-4">アイテムを編集</h2>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
          placeholder="商品名"
          value={editForm.name}
          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
        />
        <div className="flex flex-wrap gap-1.5 mb-3">
          {STORES.map(s => (
            <button
              key={s.key} type="button"
              onClick={() => setEditForm({ ...editForm, store: s.key })}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                editForm.store === s.key ? `${s.bg} ${s.border} ${s.text} font-semibold` : 'bg-white border-gray-200 text-gray-500'
              }`}
            >{s.label}</button>
          ))}
        </div>
        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
          placeholder="メモ..."
          rows={2}
          value={editForm.notes}
          onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
        />
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 border rounded-lg text-sm text-gray-600">キャンセル</button>
          <button onClick={onSave} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">保存</button>
        </div>
      </div>
    </div>
  )
}

export default function Shopping() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', store: 'unknown', notes: '' })
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [dragging, setDragging] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  // Refs so touch event handlers (registered once) can always read latest state
  const itemsRef = useRef(items)
  const touchDragRef = useRef(null)
  useEffect(() => { itemsRef.current = items }, [items])

  useEffect(() => { api.shopping.list().then(setItems).finally(() => setLoading(false)) }, [])

  const applyReorder = (currentItems, dragId, targetId) => {
    const draggedItem = currentItems.find(i => i.id === dragId)
    const targetItem = currentItems.find(i => i.id === targetId)
    if (!draggedItem || !targetItem || draggedItem.store !== targetItem.store) return null
    const newItems = [...currentItems]
    const fromIdx = newItems.findIndex(i => i.id === dragId)
    const toIdx = newItems.findIndex(i => i.id === targetId)
    const [moved] = newItems.splice(fromIdx, 1)
    newItems.splice(toIdx, 0, moved)
    return { newItems, store: draggedItem.store }
  }

  const saveOrder = async (newItems, store) => {
    const storeItems = newItems.filter(i => i.store === store)
    await Promise.all(storeItems.map((item, idx) => api.shopping.update(item.id, { sort_order: idx })))
  }

  // Touch DnD — registered once, reads state via refs
  useEffect(() => {
    const onTouchMove = (e) => {
      if (!touchDragRef.current) return
      e.preventDefault() // prevent scroll while dragging; requires non-passive listener
      const touch = e.touches[0]
      const els = document.elementsFromPoint(touch.clientX, touch.clientY)
      const itemEl = els.find(el => el.dataset.itemId && parseInt(el.dataset.itemId) !== touchDragRef.current)
      setDragOver(itemEl ? parseInt(itemEl.dataset.itemId) : null)
    }

    const onTouchEnd = async (e) => {
      const dragId = touchDragRef.current
      if (!dragId) return
      touchDragRef.current = null
      setDragging(null)
      setDragOver(null)

      const touch = e.changedTouches[0]
      const els = document.elementsFromPoint(touch.clientX, touch.clientY)
      const itemEl = els.find(el => el.dataset.itemId && parseInt(el.dataset.itemId) !== dragId)
      if (!itemEl) return

      const targetId = parseInt(itemEl.dataset.itemId)
      const result = applyReorder(itemsRef.current, dragId, targetId)
      if (!result) return
      setItems(result.newItems)
      await saveOrder(result.newItems, result.store)
    }

    // passive: false is required so we can call e.preventDefault() in touchmove
    document.addEventListener('touchmove', onTouchMove, { passive: false })
    document.addEventListener('touchend', onTouchEnd)
    return () => {
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  // HTML5 DnD (desktop)
  const handleDragStart = (e, itemId) => {
    setDragging(itemId)
    e.dataTransfer.effectAllowed = 'move'
  }
  const handleDragOver = (e, itemId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOver(itemId)
  }
  const handleDrop = async (e, targetItem) => {
    e.preventDefault()
    const dragId = dragging
    setDragging(null)
    setDragOver(null)
    const result = applyReorder(itemsRef.current, dragId, targetItem.id)
    if (!result) return
    setItems(result.newItems)
    await saveOrder(result.newItems, result.store)
  }
  const handleDragEnd = () => { setDragging(null); setDragOver(null) }

  const add = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    try {
      const created = await api.shopping.create(form)
      setItems(prev => [...prev, created])
      setForm({ name: '', store: form.store, notes: '' })
      setShowForm(false)
    } catch (err) {
      alert('追加に失敗しました: ' + err.message)
    }
  }

  const toggle = async (item) => {
    const updated = await api.shopping.update(item.id, { checked: !item.checked })
    setItems(prev => prev.map(i => i.id === item.id ? updated : i))
  }

  const del = async (id) => {
    await api.shopping.delete(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const clearChecked = async () => {
    await api.shopping.clearChecked()
    setItems(prev => prev.filter(i => !i.checked))
  }

  const startEdit = (item) => {
    setEditing(item)
    setEditForm({ name: item.name, store: item.store, notes: item.notes || '' })
  }
  const saveEdit = async () => {
    const updated = await api.shopping.update(editing.id, editForm)
    setItems(prev => prev.map(i => i.id === editing.id ? updated : i))
    setEditing(null)
  }

  const checkedCount = items.filter(i => i.checked).length
  const grouped = STORES.map(s => ({
    ...s,
    items: items.filter(i => i.store === s.key)
  })).filter(s => s.items.length > 0)

  if (loading) return <div className="text-center py-8 text-gray-400">読み込み中...</div>

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-bold text-base">買い物リスト</h1>
          <div className="flex gap-2 items-center">
            {checkedCount > 0 && (
              <button
                onClick={clearChecked}
                className="text-xs px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg"
              >
                チェック済み削除 ({checkedCount})
              </button>
            )}
            <button
              onClick={() => setShowForm(v => !v)}
              className="w-9 h-9 bg-emerald-500 text-white rounded-full text-xl flex items-center justify-center"
            >+</button>
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={add} className="mx-3 mt-3 bg-white border rounded-xl p-3">
          <input
            autoFocus
            className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
            placeholder="商品名"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <div className="flex flex-wrap gap-1.5 mb-2">
            {STORES.map(s => (
              <button
                key={s.key} type="button"
                onClick={() => setForm({ ...form, store: s.key })}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                  form.store === s.key ? `${s.bg} ${s.border} ${s.text} font-semibold` : 'bg-white border-gray-200 text-gray-500'
                }`}
              >{s.label}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-lg text-sm text-gray-600">キャンセル</button>
            <button type="submit" className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">追加</button>
          </div>
        </form>
      )}

      <div className="p-3 space-y-4">
        {grouped.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">
            右上の＋から買い物リストに追加してください
          </p>
        ) : (
          grouped.map(store => (
            <div key={store.key}>
              <div className={`flex items-center gap-2 mb-2 px-2 py-1 rounded-lg ${store.bg}`}>
                <span className={`w-2 h-2 rounded-full ${store.badge}`} />
                <span className={`font-semibold text-sm ${store.text}`}>{store.label}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {store.items.filter(i => i.checked).length}/{store.items.length}
                </span>
              </div>
              <div className="space-y-2">
                {store.items.map(item => (
                  <div
                    key={item.id}
                    data-item-id={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item.id)}
                    onDragOver={(e) => handleDragOver(e, item.id)}
                    onDrop={(e) => handleDrop(e, item)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      dragOver === item.id
                        ? `${store.bg} ${store.border} border-dashed`
                        : item.checked
                          ? 'bg-gray-50 border-gray-200 opacity-60'
                          : `bg-white ${store.border}`
                    } ${dragging === item.id ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    <span
                      className="text-gray-300 cursor-grab active:cursor-grabbing text-lg select-none px-0.5 touch-none"
                      onTouchStart={(e) => { touchDragRef.current = item.id; setDragging(item.id) }}
                    >⠿</span>
                    <button
                      onClick={() => toggle(item)}
                      className={`w-9 h-9 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        item.checked ? `${store.badge} border-transparent text-white` : 'border-gray-300 bg-white'
                      }`}
                    >
                      {item.checked && <span className="text-base">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className={`font-medium text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {item.name}
                      </span>
                      {item.notes ? <p className="text-xs text-gray-400 truncate">{item.notes}</p> : null}
                    </div>
                    <button onClick={() => startEdit(item)} className="text-gray-300 hover:text-blue-400 text-sm p-1 flex-shrink-0">✏️</button>
                    <button onClick={() => del(item.id)} className="text-gray-300 hover:text-red-400 text-lg p-1 flex-shrink-0">×</button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {editing && (
        <EditSheet
          onClose={() => setEditing(null)}
          onSave={saveEdit}
          editForm={editForm}
          setEditForm={setEditForm}
        />
      )}
    </div>
  )
}
