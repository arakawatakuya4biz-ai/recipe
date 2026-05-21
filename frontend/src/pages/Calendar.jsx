import { useState, useEffect, useCallback } from 'react'
import { api } from '../api'

const DAYS = ['日', '月', '火', '水', '木', '金', '土']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

function MealBadge({ plan }) {
  return (
    <div className="text-xs leading-tight">
      <span className="text-gray-400">{plan.meal_type === 'lunch' ? '昼' : '夜'}</span>
      <span className="ml-0.5 text-gray-700">{plan.dish_name}</span>
    </div>
  )
}

function DayModal({ date, plans, onSave, onDelete, onClose }) {
  const lunch = plans.find(p => p.meal_type === 'lunch')
  const dinner = plans.find(p => p.meal_type === 'dinner')
  const [lunchData, setLunchData] = useState({ dish_name: lunch?.dish_name || '', ingredients: lunch?.ingredients || '' })
  const [dinnerData, setDinnerData] = useState({ dish_name: dinner?.dish_name || '', ingredients: dinner?.ingredients || '' })

  const save = async () => {
    const saves = []
    if (lunchData.dish_name.trim()) {
      saves.push(lunch
        ? api.meals.update(lunch.id, lunchData)
        : api.meals.create({ date, meal_type: 'lunch', ...lunchData })
      )
    } else if (lunch) {
      saves.push(api.meals.delete(lunch.id))
    }
    if (dinnerData.dish_name.trim()) {
      saves.push(dinner
        ? api.meals.update(dinner.id, dinnerData)
        : api.meals.create({ date, meal_type: 'dinner', ...dinnerData })
      )
    } else if (dinner) {
      saves.push(api.meals.delete(dinner.id))
    }
    await Promise.all(saves)
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end" onClick={onClose}>
      <div className="bg-white rounded-t-2xl w-full max-w-lg mx-auto p-4" onClick={e => e.stopPropagation()}>
        <h2 className="font-bold text-center text-base mb-4">{date}</h2>

        {[
          { label: '昼', data: lunchData, setData: setLunchData },
          { label: '夜', data: dinnerData, setData: setDinnerData },
        ].map(({ label, data, setData }) => (
          <div key={label} className="mb-3">
            <p className="text-sm font-semibold text-gray-600 mb-1">{label}ごはん</p>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm mb-1"
              placeholder="料理名"
              value={data.dish_name}
              onChange={e => setData({ ...data, dish_name: e.target.value })}
            />
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="使う食材（カンマ区切り）"
              value={data.ingredients}
              onChange={e => setData({ ...data, ingredients: e.target.value })}
            />
          </div>
        ))}

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 border rounded-lg text-sm text-gray-600">キャンセル</button>
          <button onClick={save} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium">保存</button>
        </div>
      </div>
    </div>
  )
}

export default function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [plans, setPlans] = useState([])
  const [selected, setSelected] = useState(null)

  const load = useCallback(() => {
    api.meals.list(year, month + 1).then(setPlans)
  }, [year, month])

  useEffect(() => { load() }, [load])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const plansMap = {}
  plans.forEach(p => {
    const key = p.date
    if (!plansMap[key]) plansMap[key] = []
    plansMap[key].push(p)
  })

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  const fmt = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const isToday = (d) => year === today.getFullYear() && month === today.getMonth() && d === today.getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white border-b sticky top-0 z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <button onClick={prevMonth} className="p-2 text-gray-500 hover:text-gray-800">◀</button>
          <h1 className="font-bold text-base">{year}年{month + 1}月</h1>
          <button onClick={nextMonth} className="p-2 text-gray-500 hover:text-gray-800">▶</button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-xs font-semibold py-1 bg-white border-b">
        {DAYS.map((d, i) => (
          <div key={d} className={i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} className="bg-gray-50 min-h-16" />
          const key = fmt(d)
          const dayPlans = plansMap[key] || []
          const dow = (firstDay + d - 1) % 7
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`bg-white min-h-16 p-1 text-left hover:bg-emerald-50 transition-colors ${
                isToday(d) ? 'bg-emerald-50' : ''
              }`}
            >
              <span className={`text-xs font-medium ${
                isToday(d) ? 'bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center' :
                dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-gray-600'
              }`}>{d}</span>
              <div className="mt-0.5 space-y-0.5">
                {dayPlans.map(p => <MealBadge key={p.id} plan={p} />)}
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-3">
        <h2 className="font-semibold text-sm text-gray-700 mb-2">今月の献立</h2>
        {plans.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">日付をタップして献立を追加</p>
        ) : (
          <div className="space-y-2">
            {plans.map(p => (
              <div key={p.id} className="bg-white border rounded-xl p-3 flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-400">{p.date} {p.meal_type === 'lunch' ? '昼' : '夜'}</span>
                  <p className="font-medium text-sm">{p.dish_name}</p>
                  {p.ingredients && <p className="text-xs text-gray-500">{p.ingredients}</p>}
                </div>
                <button
                  onClick={async () => { await api.meals.delete(p.id); load() }}
                  className="text-gray-300 hover:text-red-400 text-lg"
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <DayModal
          date={selected}
          plans={plansMap[selected] || []}
          onSave={() => { load(); setSelected(null) }}
          onDelete={() => { load(); setSelected(null) }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
