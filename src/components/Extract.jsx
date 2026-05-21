import { useState } from 'react'
import { Database, Download, Loader, AlertCircle, Sparkles } from 'lucide-react'
import { getApiKey } from '../lib/storage'
import { callClaude } from '../lib/claude'

const SYSTEM = `Sen Osmanlı Bankası arşiv belgelerinden yapısal veri çıkaran bir tarih veri analistisin.
Verilen metinden TÜM varlıkları çıkar. Yanıt SADECE geçerli JSON olsun, başka hiçbir şey yazma.

Format:
{
  "entities": [
    {"type": "kisi", "value": "...", "role": "...", "context": "..."},
    {"type": "tarih", "value": "...", "format": "...", "context": "..."},
    {"type": "miktar", "value": "...", "birim": "...", "context": "..."},
    {"type": "yer", "value": "...", "context": "..."},
    {"type": "kurum", "value": "...", "context": "..."}
  ]
}

type değerleri: kisi | tarih | miktar | yer | kurum`

const TYPE_LABELS = {
  kisi: { label: 'Kişi', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' },
  tarih: { label: 'Tarih', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' },
  miktar: { label: 'Miktar', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-100' },
  yer: { label: 'Yer', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' },
  kurum: { label: 'Kurum', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-100' },
}

export default function Extract({ initialText = '' }) {
  const [text, setText] = useState(initialText)
  const [entities, setEntities] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleExtract() {
    const key = getApiKey()
    if (!key) { setError("Önce Ayarlar'dan API anahtarını gir."); return }
    if (!text.trim()) { setError('Metin giriniz.'); return }
    setError('')
    setLoading(true)
    setEntities(null)
    try {
      const raw = await callClaude(key, SYSTEM, text)
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      setEntities(parsed.entities || [])
    } catch (e) {
      setError('Varlık çıkarılamadı: ' + e.message)
    }
    setLoading(false)
  }

  function exportCSV() {
    if (!entities) return
    const header = 'Tür,Değer,Rol/Format/Birim,Bağlam'
    const rows = entities.map(e => {
      const extra = e.role || e.format || e.birim || ''
      return `${e.type},"${e.value}","${extra}","${(e.context || '').replace(/"/g, "'")}"`
    })
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'varliklar.csv'
    a.click()
  }

  const grouped = entities
    ? Object.entries(
        entities.reduce((acc, e) => {
          ;(acc[e.type] = acc[e.type] || []).push(e)
          return acc
        }, {})
      )
    : []

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-medium text-stone-800">Veri Çıkarımı</h2>
        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">AI</span>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-stone-500 mb-1.5">
          Metin (Fransızca veya Türkçe)
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
          placeholder="Belgeden metin yapıştırın — kişi adları, tarihler, miktarlar, yer ve kurum adları otomatik olarak çıkarılacak..."
          className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 resize-none font-mono"
        />
      </div>

      <button
        onClick={handleExtract}
        disabled={loading}
        className="px-4 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700 disabled:opacity-50 flex items-center gap-2 mb-4"
      >
        {loading ? <><Loader size={14} className="animate-spin" /> Çıkarılıyor...</> : <><Sparkles size={14} /> Varlıkları çıkar</>}
      </button>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 mb-4">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {entities && entities.length === 0 && (
        <p className="text-sm text-stone-400">Varlık bulunamadı.</p>
      )}

      {entities && entities.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">{entities.length} varlık bulundu</p>
            <button onClick={exportCSV}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 text-stone-600">
              <Download size={12} /> CSV indir
            </button>
          </div>
          {grouped.map(([type, items]) => {
            const style = TYPE_LABELS[type] || { label: type, bg: 'bg-stone-50', text: 'text-stone-600', border: 'border-stone-100' }
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border} font-medium`}>
                    {style.label}
                  </span>
                  <span className="text-xs text-stone-400">{items.length} adet</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((e, i) => (
                    <div key={i} className="flex gap-3 text-sm p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="font-medium text-stone-800 min-w-32">{e.value}</span>
                      {(e.role || e.format || e.birim) && (
                        <span className="text-stone-500 text-xs">{e.role || e.format || e.birim}</span>
                      )}
                      <span className="text-stone-400 text-xs ml-auto text-right max-w-xs">{e.context}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}