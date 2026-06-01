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

function DayModal({ date, plans, onSave, onClose }) {
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

function MonthPicker({ year, month, pickerYear, setPickerYear, onChange, onClose }) {
  return (
    <>
      <div className="fixed inset-0 z-20" onClick={onClose} />
      <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg z-30 p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setPickerYear(y => y - 1)} className="p-2 text-gray-500 hover:text-gray-800">◀</button>
          <span className="font-bold text-base">{pickerYear}年</span>
          <button onClick={() => setPickerYear(y => y + 1)} className="p-2 text-gray-500 hover:text-gray-800">▶</button>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
            <button
              key={m}
              onClick={() => { onChange(pickerYear, m - 1); onClose() }}
              className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                pickerYear === year && m - 1 === month
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-emerald-100'
              }`}
            >{m}月</button>
          ))}
        </div>
      </div>
    </>
  )
}

export default function Calendar() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [plans, setPlans] = useState([])
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [allPlans, setAllPlans] = useState(null) // loaded lazily on first search
  const [showPicker, setShowPicker] = useState(false)
  const [pickerYear, setPickerYear] = useState(today.getFullYear())

  const load = useCallback(() => {
    api.meals.list(year, month + 1).then(setPlans)
  }, [year, month])

  useEffect(() => { load() }, [load])

  // Load all plans the first time the user types a search query
  useEffect(() => {
    if (search && allPlans === null) {
      api.meals.list().then(setAllPlans)
    }
  }, [search, allPlans])

  const handleSave = useCallback(() => {
    load()
    setAllPlans(null) // invalidate cache so next search gets fresh data
    setSelected(null)
  }, [load])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  const plansMap = {}
  plans.forEach(p => {
    if (!plansMap[p.date]) plansMap[p.date] = []
    plansMap[p.date].push(p)
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

  // Use all plans when searching, current month plans otherwise
  const searchSource = search ? (allPlans ?? plans) : plans
  const filteredPlans = searchSource.filter(p =>
    !search || p.dish_name.includes(search) || (p.ingredients && p.ingredients.includes(search))
  )

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white border-b sticky top-0 z-10 relative">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={prevMonth} className="p-2 text-gray-500 hover:text-gray-800">◀</button>
          <button
            onClick={() => { setPickerYear(year); setShowPicker(v => !v) }}
            className="font-bold text-base hover:text-emerald-600 transition-colors px-2 py-1 rounded-lg"
          >
            {year}年{month + 1}月
          </button>
          <button onClick={nextMonth} className="p-2 text-gray-500 hover:text-gray-800">▶</button>
        </div>

        {showPicker && (
          <MonthPicker
            year={year}
            month={month}
            pickerYear={pickerYear}
            setPickerYear={setPickerYear}
            onChange={(y, m) => { setYear(y); setMonth(m) }}
            onClose={() => setShowPicker(false)}
          />
        )}
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
        <div className="flex items-center gap-2 mb-2">
          <h2 className="font-semibold text-sm text-gray-700 whitespace-nowrap">
            {search ? '検索結果' : '今月の献立'}
          </h2>
          <input
            className="flex-1 border rounded-lg px-2 py-1 text-xs"
            placeholder="料理名・食材で検索（全期間）..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {filteredPlans.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-4">
            {search ? '該当する献立がありません' : '日付をタップして献立を追加'}
          </p>
        ) : (
          <div className="space-y-2">
            {filteredPlans.map(p => (
              <div key={p.id} className="bg-white border rounded-xl p-3 flex justify-between items-start">
                <div>
                  <span className="text-xs text-gray-400">{p.date} {p.meal_type === 'lunch' ? '昼' : '夜'}</span>
                  <p className="font-medium text-sm">{p.dish_name}</p>
                  {p.ingredients && <p className="text-xs text-gray-500">{p.ingredients}</p>}
                </div>
                <button
                  onClick={async () => { await api.meals.delete(p.id); load(); setAllPlans(null) }}
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
          onSave={handleSave}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
