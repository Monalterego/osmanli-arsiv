import { useState, useRef } from 'react'
import { Loader, FileText, CheckCircle, AlertCircle, X, Link, BookOpen } from 'lucide-react'
import { getApiKey, saveDoc, generateId } from '../lib/storage'
import { analyzeDocument, callClaude } from '../lib/claude'
import { findBreadcrumb } from '../lib/archiveData'

export default function Upload({ onDocumentAnalyzed }) {
  const [mode, setMode] = useState('tekil')
  const [saltUrl, setSaltUrl] = useState('')
  const [saltMeta, setSaltMeta] = useState(null)
  const [queue, setQueue] = useState([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  // Defter modu state
  const [defterAdi, setDefterAdi] = useState('')
  const [defterRows, setDefterRows] = useState([])
  const [defterProcessing, setDefterProcessing] = useState(false)
  const [defterDone, setDefterDone] = useState(false)

  const inputRef = useRef()
  const defterInputRef = useRef()

  function handleUrlSubmit() {
    const url = saltUrl.trim()
    if (!url.includes('archives.saltresearch.org/handle/')) {
      setError('Gecerli bir SALT URL girin.')
      return
    }
    setError('')
    const breadcrumb = findBreadcrumb(url)
    setSaltMeta({ url, breadcrumb })
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // TEKİL MOD
  async function handleFiles(files) {
    const key = getApiKey()
    if (!key) { setError("Once Ayarlar'dan API anahtarini gir."); return }
    setError('')
    const newItems = Array.from(files).map(file => ({
      file,
      name: file.name,
      status: 'bekliyor',
      result: null,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))
    setQueue(prev => [...prev, ...newItems])
  }

  async function processQueue(currentQueue) {
    const key = getApiKey()
    setProcessing(true)
    for (let i = 0; i < currentQueue.length; i++) {
      if (currentQueue[i].status !== 'bekliyor') continue
      setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'isleniyor' } : item))
      try {
        const base64 = await fileToBase64(currentQueue[i].file)
        const mimeType = currentQueue[i].file.type
        const context = saltMeta ? `Bu belge SALT Research arsivinde su klasorden alinmistir: ${saltMeta.url}` : ''
        const result = await analyzeDocument(key, base64, mimeType, context)
        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'tamam', result } : item))
      } catch (err) {
        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'hata', error: err.message } : item))
      }
    }
    setProcessing(false)
  }

  async function saveAll() {
    const ready = queue.filter(item => item.status === 'tamam' && item.result)
    for (const item of ready) {
      await onDocumentAnalyzed(item.result, saltMeta?.breadcrumb || saltMeta?.url)
    }
    setQueue([])
  }

  async function saveOne(item) {
    await onDocumentAnalyzed(item.result, saltMeta?.breadcrumb || saltMeta?.url)
    setQueue(prev => prev.filter(q => q !== item))
  }

  // DEFTER MODU
  async function handleDefterFiles(files) {
    const key = getApiKey()
    if (!key) { setError("Once Ayarlar'dan API anahtarini gir."); return }
    if (!defterAdi.trim()) { setError('Defter adini girin.'); return }
    setError('')
    setDefterProcessing(true)
    setDefterDone(false)

    const fileList = Array.from(files)
    const newRows = []

    for (const file of fileList) {
      try {
        const base64 = await fileToBase64(file)
        const mimeType = file.type
        const context = saltMeta ? `Defter: ${defterAdi}. SALT klasoru: ${saltMeta.url}` : `Defter: ${defterAdi}`

        const systemPrompt = `Sen Osmanli Bankasi defter ve kayit defterlerini analiz eden bir tarih veri analistisin.
Bu bir defterin tek sayfasidir. Sayfadan yapisal veriyi cikart.
SADECE JSON yaz, baska hicbir sey yazma:
{
  "sayfa_no": "sayfa veya folyo numarasi varsa",
  "tarih": "YYYY-MM-DD veya YYYY formatinda",
  "taraflar": ["isim1", "isim2"],
  "mulk_veya_konu": "gayrimenkul adi, konu, islem tipi",
  "lokasyon": "sehir veya adres",
  "tutar": "miktar ve para birimi",
  "notlar": "diger onemli bilgiler",
  "orijinal_metin": "sayfadaki orijinal metnin tamami"
}`

        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
          },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1000,
            system: systemPrompt,
            messages: [{
              role: 'user',
              content: [
                { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
                { type: 'text', text: `${context}. Bu defter sayfasini analiz et.` }
              ]
            }]
          })
        })

        const data = await res.json()
        const raw = data.content[0].text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(raw)
        newRows.push({ dosya: file.name, ...parsed })
        setDefterRows(prev => [...prev, { dosya: file.name, ...parsed }])
      } catch (err) {
        newRows.push({ dosya: file.name, hata: err.message })
        setDefterRows(prev => [...prev, { dosya: file.name, hata: err.message }])
      }
    }

    setDefterProcessing(false)
    setDefterDone(true)
  }

  async function saveDefter() {
    const key = getApiKey()
    const validRows = defterRows.filter(r => !r.hata)
    const note = [
      `DEFTER: ${defterAdi}`,
      `SAYFA SAYISI: ${validRows.length}`,
      ``,
      `SAYFALAR:`,
      ...validRows.map((r, i) => [
        `--- Sayfa ${i + 1} (${r.dosya}) ---`,
        r.tarih ? `Tarih: ${r.tarih}` : '',
        r.taraflar?.length ? `Taraflar: ${r.taraflar.join(', ')}` : '',
        r.mulk_veya_konu ? `Konu: ${r.mulk_veya_konu}` : '',
        r.lokasyon ? `Lokasyon: ${r.lokasyon}` : '',
        r.tutar ? `Tutar: ${r.tutar}` : '',
        r.notlar ? `Notlar: ${r.notlar}` : '',
        r.orijinal_metin ? `Orijinal: ${r.orijinal_metin}` : '',
      ].filter(Boolean).join('\n'))
    ].join('\n')

    const doc = {
      id: generateId(),
      title: defterAdi,
      dept: 'Real Estates Department',
      type: 'Defter / Register',
      date: validRows[0]?.tarih || '',
      url: saltMeta?.url || '',
      salt_klasor: saltMeta?.breadcrumb || saltMeta?.url || '',
      tags: ['defter', 'gayrimenkul'],
      note,
    }

    await saveDoc(doc)
    setDefterRows([])
    setDefterAdi('')
    setDefterDone(false)
    alert('Defter kaydedildi!')
  }

  function exportDefterCSV() {
    const validRows = defterRows.filter(r => !r.hata)
    const header = 'Dosya,Sayfa No,Tarih,Taraflar,Mulk/Konu,Lokasyon,Tutar,Notlar'
    const rows = validRows.map(r =>
      `"${r.dosya}","${r.sayfa_no || ''}","${r.tarih || ''}","${(r.taraflar || []).join('; ')}","${r.mulk_veya_konu || ''}","${r.lokasyon || ''}","${r.tutar || ''}","${r.notlar || ''}"`
    )
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${defterAdi || 'defter'}.csv`
    a.click()
  }

  const bekleyenler = queue.filter(q => q.status === 'bekliyor').length
  const tamamlananlar = queue.filter(q => q.status === 'tamam').length
  const hatalilar = queue.filter(q => q.status === 'hata').length

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-medium text-stone-800">Belge Yukle ve Analiz Et</h2>
        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">AI</span>
      </div>

      {/* Mod secimi */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('tekil')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors ${
            mode === 'tekil' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <FileText size={14} /> Tekil Belge
        </button>
        <button
          onClick={() => setMode('defter')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm border transition-colors ${
            mode === 'defter' ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
          }`}
        >
          <BookOpen size={14} /> Defter Modu
        </button>
      </div>

      {/* SALT URL */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
        <label className="block text-xs font-medium text-stone-500 mb-2">SALT Klasor URL</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={saltUrl}
              onChange={e => setSaltUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="https://archives.saltresearch.org/handle/..."
              className="w-full pl-7 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
            />
          </div>
          <button onClick={handleUrlSubmit} className="px-3 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700">
            Ayarla
          </button>
        </div>
        {saltMeta && (
          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle size={12} />
            {saltMeta.breadcrumb}
            <button onClick={() => { setSaltMeta(null); setSaltUrl('') }} className="text-stone-400 hover:text-stone-600 ml-1">
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 mb-4">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* TEKİL MOD */}
      {mode === 'tekil' && (
        <div>
          <div
            onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current.click()}
            className="border-2 border-dashed border-stone-200 rounded-xl p-10 text-center cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors mb-4"
          >
            <FileText size={28} className="text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-600">PDF veya gorsel surukle, ya da tikla</p>
            <p className="text-xs text-stone-400 mt-1">Coklu secim desteklenir</p>
            <input ref={inputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          </div>

          {queue.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-500">{queue.length} dosya</span>
                  {bekleyenler > 0 && <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-600 rounded-full">{bekleyenler} bekliyor</span>}
                  {tamamlananlar > 0 && <span className="text-xs px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">{tamamlananlar} tamam</span>}
                  {hatalilar > 0 && <span className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full">{hatalilar} hata</span>}
                </div>
                <div className="flex gap-2">
                  {bekleyenler > 0 && !processing && (
                    <button onClick={() => processQueue(queue)} className="px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg hover:bg-stone-700">
                      {bekleyenler} belgeyi analiz et
                    </button>
                  )}
                  {processing && (
                    <div className="flex items-center gap-2 text-xs text-purple-600">
                      <Loader size={13} className="animate-spin" /> Analiz ediliyor...
                    </div>
                  )}
                  {tamamlananlar > 0 && !processing && (
                    <button onClick={saveAll} className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700">
                      Tumunu kaydet ({tamamlananlar})
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {queue.map((item, idx) => (
                  <div key={idx} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3">
                      {item.preview && <img src={item.preview} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-700 truncate">{item.name}</p>
                        {item.result && <p className="text-xs text-stone-400 truncate">{item.result.title}</p>}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.status === 'bekliyor' && <span className="text-xs text-stone-400">Bekliyor</span>}
                        {item.status === 'isleniyor' && <Loader size={14} className="animate-spin text-purple-500" />}
                        {item.status === 'tamam' && (
                          <>
                            <CheckCircle size={14} className="text-emerald-500" />
                            <button onClick={() => saveOne(item)} className="text-xs px-2 py-1 bg-stone-800 text-white rounded-md hover:bg-stone-700">Kaydet</button>
                          </>
                        )}
                        {item.status === 'hata' && <span className="text-xs text-red-500">Hata</span>}
                        <button onClick={() => setQueue(prev => prev.filter((_, i) => i !== idx))} className="text-stone-300 hover:text-stone-500">
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    {item.status === 'tamam' && item.result && (
                      <div className="border-t border-stone-100 px-4 py-3 bg-stone-50">
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{item.result.dept}</span>
                          {item.result.date && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{item.result.date}</span>}
                          {item.result.tags?.slice(0, 4).map(t => (
                            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{t}</span>
                          ))}
                        </div>
                        {item.result.summary_tr && <p className="text-xs text-stone-500 mt-2 line-clamp-2">{item.result.summary_tr}</p>}
                      </div>
                    )}
                    {item.status === 'hata' && (
                      <div className="border-t border-red-100 px-4 py-2 bg-red-50">
                        <p className="text-xs text-red-600">{item.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DEFTER MODU */}
      {mode === 'defter' && (
        <div>
          <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
            <label className="block text-xs font-medium text-stone-500 mb-2">Defter adi *</label>
            <input
              type="text"
              value={defterAdi}
              onChange={e => setDefterAdi(e.target.value)}
              placeholder="ornek: Grand livre des immeubles, 1884-1888"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
            />
          </div>

          <div
            onDrop={e => { e.preventDefault(); handleDefterFiles(e.dataTransfer.files) }}
            onDragOver={e => e.preventDefault()}
            onClick={() => defterInputRef.current.click()}
            className="border-2 border-dashed border-amber-200 rounded-xl p-10 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors mb-4"
          >
            <BookOpen size={28} className="text-amber-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-stone-600">Defter sayfalarini surukle veya tikla</p>
            <p className="text-xs text-stone-400 mt-1">Her sayfadan tarih, taraf, tutar, lokasyon otomatik cikarilir</p>
            <input ref={defterInputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={e => handleDefterFiles(e.target.files)} />
          </div>

          {defterProcessing && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl mb-4">
              <Loader size={16} className="animate-spin text-amber-600" />
              <div>
                <p className="text-sm font-medium text-amber-800">Defter sayfalari isleniyor...</p>
                <p className="text-xs text-amber-600">{defterRows.length} sayfa tamamlandi</p>
              </div>
            </div>
          )}

          {defterRows.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden mb-4">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
                <span className="text-sm font-medium text-stone-800">{defterRows.filter(r => !r.hata).length} sayfa islendi</span>
                <div className="flex gap-2">
                  <button onClick={exportDefterCSV} className="px-3 py-1.5 border border-stone-200 text-stone-600 text-xs rounded-lg hover:bg-stone-50">
                    CSV indir
                  </button>
                  {defterDone && (
                    <button onClick={saveDefter} className="px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg hover:bg-stone-700">
                      Defter olarak kaydet
                    </button>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-stone-100">
                      <th className="text-left px-3 py-2 text-stone-400 font-medium">Dosya</th>
                      <th className="text-left px-3 py-2 text-stone-400 font-medium">Tarih</th>
                      <th className="text-left px-3 py-2 text-stone-400 font-medium">Taraflar</th>
                      <th className="text-left px-3 py-2 text-stone-400 font-medium">Konu</th>
                      <th className="text-left px-3 py-2 text-stone-400 font-medium">Lokasyon</th>
                      <th className="text-left px-3 py-2 text-stone-400 font-medium">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {defterRows.map((row, i) => (
                      <tr key={i} className="border-b border-stone-50 hover:bg-stone-50">
                        <td className="px-3 py-2 text-stone-500 max-w-24 truncate">{row.dosya}</td>
                        <td className="px-3 py-2 text-stone-700">{row.hata ? <span className="text-red-500">Hata</span> : row.tarih || '-'}</td>
                        <td className="px-3 py-2 text-stone-700">{row.taraflar?.join(', ') || '-'}</td>
                        <td className="px-3 py-2 text-stone-700 max-w-40 truncate">{row.mulk_veya_konu || '-'}</td>
                        <td className="px-3 py-2 text-stone-700">{row.lokasyon || '-'}</td>
                        <td className="px-3 py-2 text-stone-700">{row.tutar || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}