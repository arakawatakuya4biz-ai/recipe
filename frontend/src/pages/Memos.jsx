import { useState, useEffect } from 'react'
import { api } from '../api'

function EditSheet({ onClose, onSave, editForm, setEditForm }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-4" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-center text-base mb-4">メモを編集</h2>
        <div className="space-y-2">
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="料理名 *"
            value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
          />
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="🔗 レシピサイトURL"
            value={editForm.url}
            onChange={e => setEditForm({ ...editForm, url: e.target.value })}
            type="url"
          />
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="🎬 ショート動画URL"
            value={editForm.video_url}
            onChange={e => setEditForm({ ...editForm, video_url: e.target.value })}
            type="url"
          />
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="メモ..."
            rows={2}
            value={editForm.notes}
            onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 border rounded-lg text-sm text-gray-600">キャンセル</button>
          <button onClick={onSave} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">保存</button>
        </div>
      </div>
    </div>
  )
}

function MemoCard({ memo, onDelete, onEdit }) {
  return (
    <div className="bg-white border rounded-xl p-4 mb-3">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-base text-gray-800 flex-1 pr-2">{memo.name}</h3>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(memo)} className="text-gray-300 hover:text-blue-400 text-base p-0.5">✏️</button>
          <button onClick={() => onDelete(memo.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
        </div>
      </div>
      <div className="mt-2 space-y-1.5">
        {memo.url && (
          <a href={memo.url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800">
            <span>🔗</span>
            <span className="underline truncate">{memo.url}</span>
          </a>
        )}
        {memo.video_url && (
          <a href={memo.video_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-800">
            <span>🎬</span>
            <span className="underline truncate">{memo.video_url}</span>
          </a>
        )}
        {memo.notes && <p className="text-sm text-gray-500 mt-2">{memo.notes}</p>}
      </div>
    </div>
  )
}

export default function Memos() {
  const [memos, setMemos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', url: '', video_url: '', notes: '' })
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => { api.memos.list().then(setMemos).finally(() => setLoading(false)) }, [])

  const add = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const created = await api.memos.create(form)
    setMemos(prev => [created, ...prev])
    setForm({ name: '', url: '', video_url: '', notes: '' })
    setShowForm(false)
  }

  const del = async (id) => {
    await api.memos.delete(id)
    setMemos(prev => prev.filter(m => m.id !== id))
  }

  const startEdit = (memo) => {
    setEditing(memo)
    setEditForm({ name: memo.name, url: memo.url || '', video_url: memo.video_url || '', notes: memo.notes || '' })
  }
  const saveEdit = async () => {
    const updated = await api.memos.update(editing.id, editForm)
    setMemos(prev => prev.map(m => m.id === editing.id ? updated : m))
    setEditing(null)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-bold text-base">作りたいメモ</h1>
          <button
            onClick={() => setShowForm(v => !v)}
            className="w-9 h-9 bg-emerald-500 text-white rounded-full text-xl flex items-center justify-center"
          >+</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={add} className="mx-3 mt-3 bg-white border rounded-xl p-3 space-y-2">
          <input autoFocus className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="料理名 *"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="🔗 レシピサイトURL"
            value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} type="url" />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="🎬 ショート動画URL"
            value={form.video_url} onChange={e => setForm({ ...form, video_url: e.target.value })} type="url" />
          <textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none" placeholder="メモ..." rows={2}
            value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 border rounded-lg text-sm text-gray-600">キャンセル</button>
            <button type="submit" className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">保存</button>
          </div>
        </form>
      )}

      <div className="p-3">
        {loading ? (
          <div className="text-center py-8 text-gray-400">読み込み中...</div>
        ) : memos.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">右上の＋から作りたい料理をメモしましょう</p>
        ) : (
          memos.map(m => <MemoCard key={m.id} memo={m} onDelete={del} onEdit={startEdit} />)
        )}
      </div>

      {editing && (
        <EditSheet onClose={() => setEditing(null)} onSave={saveEdit} editForm={editForm} setEditForm={setEditForm} />
      )}
    </div>
  )
}
