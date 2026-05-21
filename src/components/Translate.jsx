import { useState } from 'react'
import { Languages, Copy, Check, AlertCircle, Loader } from 'lucide-react'
import { getApiKey } from '../lib/storage'
import { callClaude } from '../lib/claude'

const SYSTEM = `Sen Osmanlı dönemi Fransızca arşiv belgelerini inceleyen bir tarih araştırmacısısın. 
Görevin:
1. Fransızca metni akıcı, akademik Türkçeye çevirmek
2. Osmanlı bankacılık ve iktisat tarihi terminolojisini doğru kullanmak
3. Çevirinin ardından kısa bir araştırma özeti eklemek

Format (kesinlikle bu yapıyı kullan):
## Çeviri
[Türkçe çeviri buraya]

## Araştırma Özeti
[Tez bağlamı için 3-5 cümle: belgenin içeriği, önemi, dikkat edilmesi gereken noktalar]

## Anahtar Kavramlar
[Belgede geçen önemli isimler, kurumlar, miktarlar, tarihler — madde madde]`

export default function Translate({ initialText = '' }) {
  const [frText, setFrText] = useState(initialText)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleTranslate() {
    const key = getApiKey()
    if (!key) { setError('Önce Ayarlar\'dan API anahtarını gir.'); return }
    if (!frText.trim()) { setError('Metin giriniz.'); return }
    setError('')
    setLoading(true)
    setResult('')
    try {
      const res = await callClaude(key, SYSTEM, frText)
      setResult(res)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-stone-800">Fransızca → Türkçe</h2>
          <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">AI</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-stone-500">Fransızca metin</label>
          <textarea
            value={frText}
            onChange={e => setFrText(e.target.value)}
            rows={14}
            placeholder={"Belge metnini buraya yapıştırın...\n\nexemple:\nLa direction de la Banque Ottomane a décidé d'accorder un crédit de 50.000 francs..."}
            className="flex-1 px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:border-stone-400 resize-none font-mono leading-relaxed"
          />
          <button
            onClick={handleTranslate}
            disabled={loading}
            className="w-full py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader size={14} className="animate-spin" /> Çevriliyor...</> : <><Languages size={14} /> Çevir ve analiz et</>}
          </button>
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700">
              <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-stone-500">Türkçe çeviri + analiz</label>
            {result && (
              <button onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Kopyalandı' : 'Kopyala'}
              </button>
            )}
          </div>
          <div className="flex-1 px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-stone-50 min-h-64 leading-relaxed overflow-y-auto whitespace-pre-wrap">
            {result || <span className="text-stone-400 text-xs">Çeviri burada görünecek...</span>}
          </div>
        </div>
      </div>
    </div>
  )
}