import { useState, useEffect } from 'react'
import { api } from '../api'

const CATEGORIES = [
  { key: '', label: 'すべて' },
  { key: 'main', label: '主菜' },
  { key: 'side', label: '副菜' },
  { key: 'soup', label: '汁物' },
  { key: 'dessert', label: 'デザート' },
  { key: 'other', label: 'その他' },
]
const REACTIONS = [
  { key: '', label: 'すべて' },
  { key: 'good', label: '👍', title: 'また作りたい' },
  { key: 'ok', label: '😐', title: '普通' },
  { key: 'bad', label: '😞', title: 'いまいち' },
]
const CAT_LABELS = { main: '主菜', side: '副菜', soup: '汁物', dessert: 'デザート', other: 'その他' }
const CAT_COLORS = {
  main: 'bg-red-100 text-red-700',
  side: 'bg-green-100 text-green-700',
  soup: 'bg-blue-100 text-blue-700',
  dessert: 'bg-pink-100 text-pink-700',
  other: 'bg-gray-100 text-gray-600',
}
const REACTION_LABELS = { good: '👍', ok: '😐', bad: '😞' }

function EditSheet({ onClose, onSave, editForm, setEditForm }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-center text-base mb-4">レシピを編集</h2>
        <div className="space-y-2">
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="料理名 *"
            value={editForm.name}
            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
          />
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="🔗 レシピURL"
            value={editForm.url}
            onChange={e => setEditForm({ ...editForm, url: e.target.value })}
            type="url"
          />
          <div>
            <p className="text-xs text-gray-500 mb-1">カテゴリ</p>
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.slice(1).map(c => (
                <button key={c.key} type="button"
                  onClick={() => setEditForm({ ...editForm, category: c.key })}
                  className={`px-3 py-1 rounded-lg border text-xs transition-colors ${
                    editForm.category === c.key ? 'bg-emerald-100 border-emerald-400 text-emerald-700 font-semibold' : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >{c.label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">評価</p>
            <div className="flex gap-2">
              {REACTIONS.slice(1).map(r => (
                <button key={r.key} type="button"
                  onClick={() => setEditForm({ ...editForm, reaction: r.key })}
                  className={`flex-1 py-1.5 rounded-lg border text-sm transition-colors ${
                    editForm.reaction === r.key ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-200'
                  }`}
                  title={r.title}
                >{r.label} {r.title}</button>
              ))}
            </div>
          </div>
          <input
            className="w-full border rounded-lg px-3 py-2 text-sm"
            placeholder="食材（カンマ区切り）"
            value={editForm.ingredients}
            onChange={e => setEditForm({ ...editForm, ingredients: e.target.value })}
          />
          <textarea
            className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
            placeholder="メモ・感想..."
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

function RecipeCard({ recipe, onDelete, onEdit }) {
  return (
    <div className="bg-white border rounded-xl p-4 mb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_COLORS[recipe.category]}`}>
              {CAT_LABELS[recipe.category]}
            </span>
            <span className="text-base">{REACTION_LABELS[recipe.reaction]}</span>
          </div>
          <h3 className="font-semibold text-base text-gray-800">{recipe.name}</h3>
          {recipe.ingredients && <p className="text-xs text-gray-500 mt-1">🥘 {recipe.ingredients}</p>}
          {recipe.notes && <p className="text-xs text-gray-500 mt-1">{recipe.notes}</p>}
          {recipe.url && (
            <a href={recipe.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 underline mt-1.5">🔗 レシピを見る</a>
          )}
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => onEdit(recipe)} className="text-gray-300 hover:text-blue-400 text-base p-0.5">✏️</button>
          <button onClick={() => onDelete(recipe.id)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
        </div>
      </div>
    </div>
  )
}

export default function Recipes() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [filterCat, setFilterCat] = useState('')
  const [filterReaction, setFilterReaction] = useState('')
  const [filterIngredient, setFilterIngredient] = useState('')
  const [form, setForm] = useState({ name: '', url: '', category: 'main', ingredients: '', reaction: 'ok', notes: '' })
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})

  const load = () => {
    const params = {}
    if (filterCat) params.category = filterCat
    if (filterReaction) params.reaction = filterReaction
    if (filterIngredient) params.ingredient = filterIngredient
    api.recipes.list(params).then(setRecipes).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filterCat, filterReaction, filterIngredient])

  const add = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    const created = await api.recipes.create(form)
    setRecipes(prev => [created, ...prev])
    setForm({ name: '', url: '', category: 'main', ingredients: '', reaction: 'ok', notes: '' })
    setShowForm(false)
  }

  const del = async (id) => {
    await api.recipes.delete(id)
    setRecipes(prev => prev.filter(r => r.id !== id))
  }

  const startEdit = (recipe) => {
    setEditing(recipe)
    setEditForm({
      name: recipe.name,
      url: recipe.url || '',
      category: recipe.category,
      reaction: recipe.reaction,
      ingredients: recipe.ingredients || '',
      notes: recipe.notes || '',
    })
  }
  const saveEdit = async () => {
    const updated = await api.recipes.update(editing.id, editForm)
    setRecipes(prev => prev.map(r => r.id === editing.id ? updated : r))
    setEditing(null)
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="font-bold text-base">レシピ一覧</h1>
          <button
            onClick={() => setShowForm(v => !v)}
            className="w-9 h-9 bg-emerald-500 text-white rounded-full text-xl flex items-center justify-center"
          >+</button>
        </div>

        <div className="px-3 pb-3 space-y-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button key={c.key} onClick={() => setFilterCat(c.key)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  filterCat === c.key ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-gray-600 border-gray-200'
                }`}
              >{c.label}</button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex gap-1">
              {REACTIONS.map(r => (
                <button key={r.key} onClick={() => setFilterReaction(r.key)}
                  className={`px-2 py-1 rounded-lg border text-sm transition-colors ${
                    filterReaction === r.key ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-200'
                  }`}
                  title={r.title}
                >{r.label}</button>
              ))}
            </div>
            <input
              className="flex-1 border rounded-lg px-2 py-1 text-xs"
              placeholder="食材で検索..."
              value={filterIngredient}
              onChange={e => setFilterIngredient(e.target.value)}
            />
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={add} className="mx-3 mt-3 bg-white border rounded-xl p-3 space-y-2">
          <input autoFocus className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="料理名 *"
            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="🔗 レシピURL"
            value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} type="url" />
          <div>
            <p className="text-xs text-gray-500 mb-1">カテゴリ</p>
            <div className="flex flex-wrap gap-1">
              {CATEGORIES.slice(1).map(c => (
                <button key={c.key} type="button" onClick={() => setForm({ ...form, category: c.key })}
                  className={`px-3 py-1 rounded-lg border text-xs transition-colors ${
                    form.category === c.key ? 'bg-emerald-100 border-emerald-400 text-emerald-700 font-semibold' : 'bg-white border-gray-200 text-gray-500'
                  }`}
                >{c.label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">評価</p>
            <div className="flex gap-2">
              {REACTIONS.slice(1).map(r => (
                <button key={r.key} type="button" onClick={() => setForm({ ...form, reaction: r.key })}
                  className={`flex-1 py-1.5 rounded-lg border text-sm transition-colors ${
                    form.reaction === r.key ? 'bg-gray-200 border-gray-400' : 'bg-white border-gray-200'
                  }`}
                  title={r.title}
                >{r.label} {r.title}</button>
              ))}
            </div>
          </div>
          <input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="食材（カンマ区切り）"
            value={form.ingredients} onChange={e => setForm({ ...form, ingredients: e.target.value })} />
          <textarea className="w-full border rounded-lg px-3 py-2 text-sm resize-none" placeholder="メモ・感想..." rows={2}
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
        ) : recipes.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-12">右上の＋からレシピを追加してください</p>
        ) : (
          recipes.map(r => <RecipeCard key={r.id} recipe={r} onDelete={del} onEdit={startEdit} />)
        )}
      </div>

      {editing && (
        <EditSheet onClose={() => setEditing(null)} onSave={saveEdit} editForm={editForm} setEditForm={setEditForm} />
      )}
    </div>
  )
}
