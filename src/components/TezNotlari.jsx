import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { getTezNotlari, saveTezNotu, deleteTezNotu, generateId } from '../lib/storage'

const KATEGORILER = [
  'Tez Konusu',
  'Kaynak Notu',
  'Arşiv Gözlemi',
  'Danışman Görüşmesi',
  'Argüman',
  'Soru',
  'Genel',
]

function NotKarti({ not, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const renkler = {
    'Tez Konusu': 'bg-blue-50 border-blue-200 text-blue-800',
    'Kaynak Notu': 'bg-amber-50 border-amber-200 text-amber-800',
    'Arşiv Gözlemi': 'bg-emerald-50 border-emerald-200 text-emerald-800',
    'Danışman Görüşmesi': 'bg-purple-50 border-purple-200 text-purple-800',
    'Argüman': 'bg-red-50 border-red-200 text-red-800',
    'Soru': 'bg-orange-50 border-orange-200 text-orange-800',
    'Genel': 'bg-stone-50 border-stone-200 text-stone-700',
  }

  const renk = renkler[not.kategori] || renkler['Genel']

  return (
    <div className={`border rounded-xl p-4 ${renk}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium opacity-70">{not.kategori}</span>
            <span className="text-xs opacity-50">{new Date(not.created_at).toLocaleDateString('tr-TR')}</span>
          </div>
          <p className="text-sm font-medium mb-1">{not.baslik}</p>
          <p className={`text-xs leading-relaxed opacity-80 ${!expanded && not.icerik?.length > 200 ? 'line-clamp-3' : ''}`}>
            {not.icerik}
          </p>
          {not.icerik?.length > 200 && (
            <button onClick={() => setExpanded(e => !e)} className="text-xs opacity-60 hover:opacity-100 flex items-center gap-0.5 mt-1">
              {expanded ? <><ChevronUp size={11} /> Kapat</> : <><ChevronDown size={11} /> Devamini goster</>}
            </button>
          )}
          {not.etiketler?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {not.etiketler.map(e => (
                <span key={e} className="text-xs px-2 py-0.5 rounded-full bg-white bg-opacity-60">{e}</span>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => onDelete(not.id)} className="opacity-40 hover:opacity-80 flex-shrink-0">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

function NotEkleForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    baslik: '',
    icerik: '',
    kategori: 'Genel',
    etiketler: [],
  })
  const [etiketInput, setEtiketInput] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function addEtiket() {
    const e = etiketInput.trim()
    if (e && !form.etiketler.includes(e)) {
      set('etiketler', [...form.etiketler, e])
      setEtiketInput('')
    }
  }

  function handleSubmit() {
    if (!form.baslik.trim()) return alert('Baslik zorunludur.')
    onAdd({ ...form, id: generateId() })
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 mb-4">
      <h3 className="text-sm font-medium text-stone-800 mb-4">Yeni Not</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Baslik *</label>
          <input type="text" value={form.baslik} onChange={e => set('baslik', e.target.value)}
            placeholder="ornek: Tez konusu adayi - Emisyon imtiyazi (1863-1914)"
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Kategori</label>
          <select value={form.kategori} onChange={e => set('kategori', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-stone-400">
            {KATEGORILER.map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Icerik</label>
          <textarea value={form.icerik} onChange={e => set('icerik', e.target.value)}
            rows={4} placeholder="Notunuzu buraya yazin..."
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 resize-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Etiketler</label>
          <div className="flex gap-2">
            <input type="text" value={etiketInput} onChange={e => setEtiketInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addEtiket()}
              placeholder="Etiket ekle..."
              className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
            <button onClick={addEtiket} className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg hover:bg-stone-50">Ekle</button>
          </div>
          {form.etiketler.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {form.etiketler.map(e => (
                <span key={e} onClick={() => set('etiketler', form.etiketler.filter(x => x !== e))}
                  className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 cursor-pointer hover:bg-red-50 hover:text-red-600">
                  {e} ×
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={handleSubmit} className="px-4 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700">Kaydet</button>
          <button onClick={onCancel} className="px-4 py-2 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50">Iptal</button>
        </div>
      </div>
    </div>
  )
}

export default function TezNotlari() {
  const [notlar, setNotlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [kategoriFilter, setKategoriFilter] = useState('')

  useEffect(() => {
    getTezNotlari().then(data => { setNotlar(data); setLoading(false) })
  }, [])

  async function addNot(not) {
    await saveTezNotu(not)
    setNotlar(prev => [not, ...prev])
    setShowForm(false)
  }

  async function handleDelete(id) {
    if (!confirm('Bu not silinsin mi?')) return
    await deleteTezNotu(id)
    setNotlar(prev => prev.filter(n => n.id !== id))
  }

  const filtered = kategoriFilter ? notlar.filter(n => n.kategori === kategoriFilter) : notlar

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-stone-600" />
          <h2 className="text-base font-medium text-stone-800">Tez Notlari</h2>
          <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full">{notlar.length}</span>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700">
          <Plus size={14} /> Not ekle
        </button>
      </div>

      {showForm && <NotEkleForm onAdd={addNot} onCancel={() => setShowForm(false)} />}

      <div className="flex gap-2 mb-4 flex-wrap">
        <button onClick={() => setKategoriFilter('')}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${!kategoriFilter ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
          Tumu
        </button>
        {KATEGORILER.map(k => {
          const count = notlar.filter(n => n.kategori === k).length
          if (count === 0) return null
          return (
            <button key={k} onClick={() => setKategoriFilter(k)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${kategoriFilter === k ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'}`}>
              {k} ({count})
            </button>
          )
        })}
      </div>

      {loading ? (
        <p className="text-sm text-stone-400 text-center py-10">Yukleniyor...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm">Henuz not eklenmedi.</p>
          <button onClick={() => setShowForm(true)} className="mt-3 text-sm text-blue-600 hover:underline">
            Ilk notu ekle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(not => (
            <NotKarti key={not.id} not={not} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}