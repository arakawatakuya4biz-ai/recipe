import { useState, useEffect } from 'react'
import { api } from '../api'

const STATUS_LABELS = { good: '○', ok: '△', low: '×' }
const STATUS_COLORS = {
  good: 'bg-green-100 text-green-700 border-green-300',
  ok: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-red-100 text-red-700 border-red-300',
}
const FREEZER_LABELS = { meat: '肉', fish: '魚', frozen: '冷食', other: 'その他' }
const FREEZER_COLORS = {
  meat: 'bg-red-50 border-red-200',
  fish: 'bg-blue-50 border-blue-200',
  frozen: 'bg-indigo-50 border-indigo-200',
  other: 'bg-gray-50 border-gray-200',
}

function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(dateStr)
  return Math.ceil((exp - today) / 86400000)
}

function ExpiryBadge({ date }) {
  const days = daysUntil(date)
  if (days === null) return null
  const cls =
    days <= 2 ? 'bg-red-100 text-red-700' :
    days <= 5 ? 'bg-orange-100 text-orange-700' :
    'bg-gray-100 text-gray-600'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
      {days < 0 ? `期限切れ${Math.abs(days)}日` : days === 0 ? '今日まで' : `あと${days}日`}
    </span>
  )
}

function EditSheet({ title, onClose, onSave, children }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-4" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-center text-base mb-4">{title}</h2>
        {children}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 border rounded-lg text-sm text-gray-600">キャンセル</button>
          <button onClick={onSave} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">保存</button>
        </div>
      </div>
    </div>
  )
}

function ItemRow({ item, onUpdate, onDelete, onEdit, children }) {
  return (
    <div className={`border rounded-xl p-3 mb-2 bg-white ${item.planned_use ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-2">
        <button
          onClick={() => onUpdate(item.id, { planned_use: !item.planned_use })}
          className={`mt-1 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
            item.planned_use ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'
          }`}
        >
          {item.planned_use && <span className="text-xs">✓</span>}
        </button>
        <div className="flex-1 min-w-0">{children}</div>
        <button onClick={() => onEdit(item)} className="text-gray-300 hover:text-blue-400 text-base leading-none px-1">✏️</button>
        <button onClick={() => onDelete(item.id)} className="text-gray-300 hover:text-red-400 text-lg leading-none">×</button>
      </div>
      {item.planned_dish && (
        <div className="ml-8 mt-1 text-xs text-emerald-700 bg-emerald-50 rounded px-2 py-1">
          📌 {item.planned_dish}
        </div>
      )}
    </div>
  )
}

function PlanInput({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [v, setV] = useState(value)
  if (!editing) return (
    <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-emerald-600">
      {value || '+ 使う料理をメモ'}
    </button>
  )
  return (
    <input
      autoFocus
      className="text-xs border rounded px-2 py-1 w-full"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => { onChange(v); setEditing(false) }}
      onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
      placeholder="使う料理をメモ..."
    />
  )
}

function VegetablesTab() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', is_staple: false, status: 'good' })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => { api.vegetables.list().then(setItems).finally(() => setLoading(false)) }, [])

  const update = async (id, data) => {
    const updated = await api.vegetables.update(id, data)
    setItems(items.map(i => i.id === id ? updated : i))
  }
  const del = async (id) => {
    await api.vegetables.delete(id)
    setItems(items.filter(i => i.id !== id))
  }
  const add = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const created = await api.vegetables.create(form)
    setItems([...items, created])
    setForm({ name: '', is_staple: false, status: 'good' })
  }
  const startEdit = (item) => {
    setEditing(item)
    setEditForm({ name: item.name, is_staple: item.is_staple, status: item.status })
  }
  const saveEdit = async () => {
    await update(editing.id, editForm)
    setEditing(null)
  }

  const staples = items.filter(i => i.is_staple)
  const others = items.filter(i => !i.is_staple)

  if (loading) return <div className="text-center py-8 text-gray-400">読み込み中...</div>

  return (
    <div>
      <form onSubmit={add} className="bg-white border rounded-xl p-3 mb-4">
        <div className="flex gap-2 mb-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            placeholder="野菜名"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <label className="flex items-center gap-1 text-sm text-gray-600">
            <input type="checkbox" checked={form.is_staple} onChange={e => setForm({ ...form, is_staple: e.target.checked })} />
            常備
          </label>
        </div>
        <div className="flex gap-2">
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <button
              key={k} type="button"
              onClick={() => setForm({ ...form, status: k })}
              className={`flex-1 py-1 rounded-lg border text-sm font-bold transition-colors ${
                form.status === k ? STATUS_COLORS[k] : 'bg-white border-gray-200 text-gray-400'
              }`}
            >{v}</button>
          ))}
          <button type="submit" className="flex-1 py-1 bg-emerald-500 text-white rounded-lg text-sm font-medium">追加</button>
        </div>
      </form>

      {staples.length > 0 && (
        <>
          <h3 className="text-xs font-semibold text-gray-500 mb-2">常備野菜</h3>
          {staples.map(item => (
            <ItemRow key={item.id} item={item} onUpdate={update} onDelete={del} onEdit={startEdit}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-sm">{item.name}</span>
                <div className="flex gap-1">
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <button
                      key={k}
                      onClick={() => update(item.id, { status: k })}
                      className={`w-8 h-7 rounded border text-sm font-bold ${
                        item.status === k ? STATUS_COLORS[k] : 'bg-white border-gray-200 text-gray-300'
                      }`}
                    >{v}</button>
                  ))}
                </div>
              </div>
              <PlanInput value={item.planned_dish} onChange={v => update(item.id, { planned_dish: v })} />
            </ItemRow>
          ))}
        </>
      )}

      {others.length > 0 && (
        <>
          <h3 className="text-xs font-semibold text-gray-500 mb-2 mt-4">その他の野菜</h3>
          {others.map(item => (
            <ItemRow key={item.id} item={item} onUpdate={update} onDelete={del} onEdit={startEdit}>
              <span className="font-medium text-sm">{item.name}</span>
              <div className="mt-1">
                <PlanInput value={item.planned_dish} onChange={v => update(item.id, { planned_dish: v })} />
              </div>
            </ItemRow>
          ))}
        </>
      )}

      {items.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">野菜を追加してください</p>
      )}

      {editing && (
        <EditSheet title="野菜を編集" onClose={() => setEditing(null)} onSave={saveEdit}>
          <div className="flex gap-2 mb-3">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder="野菜名"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
            />
            <label className="flex items-center gap-1 text-sm text-gray-600">
              <input type="checkbox" checked={editForm.is_staple} onChange={e => setEditForm({ ...editForm, is_staple: e.target.checked })} />
              常備
            </label>
          </div>
          <div className="flex gap-2">
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <button
                key={k} type="button"
                onClick={() => setEditForm({ ...editForm, status: k })}
                className={`flex-1 py-1 rounded-lg border text-sm font-bold transition-colors ${
                  editForm.status === k ? STATUS_COLORS[k] : 'bg-white border-gray-200 text-gray-400'
                }`}
              >{v}</button>
            ))}
          </div>
        </EditSheet>
      )}
    </div>
  )
}

function FridgeTab() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', expiry_date: '' })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => { api.fridge.list().then(setItems).finally(() => setLoading(false)) }, [])

  const update = async (id, data) => {
    const updated = await api.fridge.update(id, data)
    setItems(items.map(i => i.id === id ? updated : i))
  }
  const del = async (id) => {
    await api.fridge.delete(id)
    setItems(items.filter(i => i.id !== id))
  }
  const add = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const created = await api.fridge.create({ ...form, expiry_date: form.expiry_date || null })
    setItems([...items, created])
    setForm({ name: '', expiry_date: '' })
  }
  const startEdit = (item) => {
    setEditing(item)
    setEditForm({ name: item.name, expiry_date: item.expiry_date || '' })
  }
  const saveEdit = async () => {
    await update(editing.id, { ...editForm, expiry_date: editForm.expiry_date || null })
    setEditing(null)
  }

  if (loading) return <div className="text-center py-8 text-gray-400">読み込み中...</div>

  return (
    <div>
      <form onSubmit={add} className="bg-white border rounded-xl p-3 mb-4 flex gap-2 flex-wrap">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm min-w-32"
          placeholder="食材名"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="date"
          className="border rounded-lg px-2 py-2 text-sm"
          value={form.expiry_date}
          onChange={e => setForm({ ...form, expiry_date: e.target.value })}
        />
        <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">追加</button>
      </form>

      {items.map(item => (
        <ItemRow key={item.id} item={item} onUpdate={update} onDelete={del} onEdit={startEdit}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{item.name}</span>
            <ExpiryBadge date={item.expiry_date} />
          </div>
          <PlanInput value={item.planned_dish} onChange={v => update(item.id, { planned_dish: v })} />
        </ItemRow>
      ))}

      {items.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">冷蔵庫の食材を追加してください</p>
      )}

      {editing && (
        <EditSheet title="冷蔵食材を編集" onClose={() => setEditing(null)} onSave={saveEdit}>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            placeholder="食材名"
            value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
          />
          <label className="block text-xs text-gray-500 mb-1">賞味期限</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={editForm.expiry_date}
            onChange={e => setEditForm({ ...editForm, expiry_date: e.target.value })}
          />
        </EditSheet>
      )}
    </div>
  )
}

function FreezerTab() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', quantity: '', category: 'meat' })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => { api.freezer.list().then(setItems).finally(() => setLoading(false)) }, [])

  const update = async (id, data) => {
    const updated = await api.freezer.update(id, data)
    setItems(items.map(i => i.id === id ? updated : i))
  }
  const del = async (id) => {
    await api.freezer.delete(id)
    setItems(items.filter(i => i.id !== id))
  }
  const add = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    try {
      const created = await api.freezer.create(form)
      setItems([...items, created])
      setForm({ name: '', quantity: '', category: form.category })
    } catch (err) {
      alert('追加に失敗しました: ' + err.message)
    }
  }
  const startEdit = (item) => {
    setEditing(item)
    setEditForm({ name: item.name, category: item.category, quantity: item.quantity || '' })
  }
  const saveEdit = async () => {
    await update(editing.id, editForm)
    setEditing(null)
  }

  const grouped = Object.fromEntries(
    Object.keys(FREEZER_LABELS).map(k => [k, items.filter(i => i.category === k)])
  )

  if (loading) return <div className="text-center py-8 text-gray-400">読み込み中...</div>

  return (
    <div>
      <form onSubmit={add} className="bg-white border rounded-xl p-3 mb-4">
        <div className="flex gap-1 mb-2">
          {Object.entries(FREEZER_LABELS).map(([k, v]) => (
            <button
              key={k} type="button"
              onClick={() => setForm({ ...form, category: k })}
              className={`flex-1 py-1.5 rounded-lg border text-sm transition-colors ${
                form.category === k ? 'bg-indigo-100 border-indigo-400 text-indigo-700 font-semibold' : 'bg-white border-gray-200 text-gray-500'
              }`}
            >{v}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
            placeholder="食材名"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          {form.category === 'meat' && (
            <input
              className="w-20 border rounded-lg px-3 py-2 text-sm"
              placeholder="量"
              value={form.quantity}
              onChange={e => setForm({ ...form, quantity: e.target.value })}
            />
          )}
          <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">追加</button>
        </div>
      </form>

      {Object.entries(FREEZER_LABELS).map(([cat, label]) => (
        grouped[cat].length > 0 ? (
          <div key={cat} className="mb-4">
            <h3 className={`text-xs font-semibold mb-2 px-2 py-1 rounded-lg inline-block border ${FREEZER_COLORS[cat]}`}>{label}</h3>
            {grouped[cat].map(item => (
              <ItemRow key={item.id} item={item} onUpdate={update} onDelete={del} onEdit={startEdit}>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{item.name}</span>
                  {cat === 'meat' && item.quantity && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.quantity}</span>
                  )}
                </div>
                <div className="mt-1">
                  <PlanInput value={item.planned_dish} onChange={v => update(item.id, { planned_dish: v })} />
                </div>
              </ItemRow>
            ))}
          </div>
        ) : null
      ))}

      {items.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">冷凍食材を追加してください</p>
      )}

      {editing && (
        <EditSheet title="冷凍食材を編集" onClose={() => setEditing(null)} onSave={saveEdit}>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            placeholder="食材名"
            value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
          />
          <div className="flex gap-1 mb-3">
            {Object.entries(FREEZER_LABELS).map(([k, v]) => (
              <button
                key={k} type="button"
                onClick={() => setEditForm({ ...editForm, category: k })}
                className={`flex-1 py-1.5 rounded-lg border text-sm transition-colors ${
                  editForm.category === k ? 'bg-indigo-100 border-indigo-400 text-indigo-700 font-semibold' : 'bg-white border-gray-200 text-gray-500'
                }`}
              >{v}</button>
            ))}
          </div>
          {editForm.category === 'meat' && (
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="量（例：300g）"
              value={editForm.quantity}
              onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
            />
          )}
        </EditSheet>
      )}
    </div>
  )
}

function RoomTempTab() {
  const [items, setItems] = useState([])
  const [form, setForm] = useState({ name: '', quantity: '', expiry_date: '' })
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => { api.roomTemp.list().then(setItems).finally(() => setLoading(false)) }, [])

  const update = async (id, data) => {
    const updated = await api.roomTemp.update(id, data)
    setItems(items.map(i => i.id === id ? updated : i))
  }
  const del = async (id) => {
    await api.roomTemp.delete(id)
    setItems(items.filter(i => i.id !== id))
  }
  const add = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const created = await api.roomTemp.create({ ...form, expiry_date: form.expiry_date || null })
    setItems([...items, created])
    setForm({ name: '', quantity: '', expiry_date: '' })
  }
  const startEdit = (item) => {
    setEditing(item)
    setEditForm({ name: item.name, quantity: item.quantity || '', expiry_date: item.expiry_date || '' })
  }
  const saveEdit = async () => {
    await update(editing.id, { ...editForm, expiry_date: editForm.expiry_date || null })
    setEditing(null)
  }

  if (loading) return <div className="text-center py-8 text-gray-400">読み込み中...</div>

  return (
    <div>
      <form onSubmit={add} className="bg-white border rounded-xl p-3 mb-4 flex gap-2 flex-wrap">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm min-w-24"
          placeholder="食材名"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-20 border rounded-lg px-3 py-2 text-sm"
          placeholder="量"
          value={form.quantity}
          onChange={e => setForm({ ...form, quantity: e.target.value })}
        />
        <input
          type="date"
          className="border rounded-lg px-2 py-2 text-sm"
          value={form.expiry_date}
          onChange={e => setForm({ ...form, expiry_date: e.target.value })}
        />
        <button type="submit" className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">追加</button>
      </form>

      {items.map(item => (
        <ItemRow key={item.id} item={item} onUpdate={update} onDelete={del} onEdit={startEdit}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm">{item.name}</span>
            {item.quantity && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.quantity}</span>
            )}
            <ExpiryBadge date={item.expiry_date} />
          </div>
          <PlanInput value={item.planned_dish} onChange={v => update(item.id, { planned_dish: v })} />
        </ItemRow>
      ))}

      {items.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-8">常温食材を追加してください</p>
      )}

      {editing && (
        <EditSheet title="常温食材を編集" onClose={() => setEditing(null)} onSave={saveEdit}>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            placeholder="食材名"
            value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
          />
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
            placeholder="量（例：1袋）"
            value={editForm.quantity}
            onChange={e => setEditForm({ ...editForm, quantity: e.target.value })}
          />
          <label className="block text-xs text-gray-500 mb-1">賞味期限</label>
          <input
            type="date"
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={editForm.expiry_date}
            onChange={e => setEditForm({ ...editForm, expiry_date: e.target.value })}
          />
        </EditSheet>
      )}
    </div>
  )
}

const TABS = [
  { key: 'vegetables', label: '🥦 野菜' },
  { key: 'fridge', label: '❄️ 冷蔵' },
  { key: 'freezer', label: '🧊 冷凍' },
  { key: 'room_temp', label: '🌡️ 常温' },
]

export default function Inventory() {
  const [tab, setTab] = useState('vegetables')

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white border-b sticky top-0 z-10">
        <h1 className="text-center font-bold text-base py-3 text-gray-800">在庫管理</h1>
        <div className="flex">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === key ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500'
              }`}
            >{label}</button>
          ))}
        </div>
      </div>
      <div className="p-3">
        {tab === 'vegetables' && <VegetablesTab />}
        {tab === 'fridge' && <FridgeTab />}
        {tab === 'freezer' && <FreezerTab />}
        {tab === 'room_temp' && <RoomTempTab />}
      </div>
    </div>
  )
}
