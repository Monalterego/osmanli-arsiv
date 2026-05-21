import { useState, useRef } from 'react'
import { Loader, FileText, CheckCircle, AlertCircle, X, Link } from 'lucide-react'
import { getApiKey } from '../lib/storage'
import { analyzeDocument } from '../lib/claude'
import { findBreadcrumb } from '../lib/archiveData'

export default function Upload({ onDocumentAnalyzed }) {
  const [saltUrl, setSaltUrl] = useState('')
  const [saltMeta, setSaltMeta] = useState(null)
  const [queue, setQueue] = useState([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef()

  function parseSaltUrl(url) {
    if (!url.includes('archives.saltresearch.org/handle/')) return null
    return { url, handle: url.split('/handle/')[1] }
  }

  function handleUrlSubmit() {
  const meta = parseSaltUrl(saltUrl.trim())
  if (!meta) { setError('Gecerli bir SALT URL girin.'); return }
  setError('')
  const breadcrumb = findBreadcrumb(saltUrl.trim())
  setSaltMeta({ ...meta, breadcrumb })
}

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

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function processQueue(currentQueue) {
    const key = getApiKey()
    setProcessing(true)

    for (let i = 0; i < currentQueue.length; i++) {
      if (currentQueue[i].status !== 'bekliyor') continue

      setQueue(prev => prev.map((item, idx) =>
        idx === i ? { ...item, status: 'isleniyor' } : item
      ))

      try {
        const base64 = await fileToBase64(currentQueue[i].file)
        const mimeType = currentQueue[i].file.type
        const context = saltMeta
          ? `Bu belge SALT Research arsivinde su klasorden alinmistir: ${saltMeta.url}`
          : ''
        const result = await analyzeDocument(key, base64, mimeType, context)

        setQueue(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'tamam', result } : item
        ))
      } catch (err) {
        setQueue(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'hata', error: err.message } : item
        ))
      }
    }
    setProcessing(false)
  }

  function handleDrop(e) {
    e.preventDefault()
    handleFiles(e.dataTransfer.files)
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

  function removeOne(idx) {
    setQueue(prev => prev.filter((_, i) => i !== idx))
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

      {/* SALT URL girisi */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
        <label className="block text-xs font-medium text-stone-500 mb-2">
          SALT Klasor URL (opsiyonel ama onerilen)
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Link size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={saltUrl}
              onChange={e => setSaltUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleUrlSubmit()}
              placeholder="https://archives.saltresearch.org/handle/123456789/2410"
              className="w-full pl-7 pr-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400"
            />
          </div>
          <button
            onClick={handleUrlSubmit}
            className="px-3 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700"
          >
            Ayarla
          </button>
        </div>
        {saltMeta && (
          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-700">
            <CheckCircle size={12} />
            Klasor ayarlandi: {saltMeta.breadcrumb || saltMeta.url}
            <button onClick={() => { setSaltMeta(null); setSaltUrl('') }} className="text-stone-400 hover:text-stone-600 ml-1">
              <X size={12} />
            </button>
          </div>
        )}
        {!saltMeta && (
          <p className="text-xs text-stone-400 mt-1.5">
            SALT URL girilirse AI belgeleri dogru bolum ve baglamda analiz eder.
          </p>
        )}
      </div>

      {/* Dosya yukle alani */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-stone-200 rounded-xl p-10 text-center cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors mb-4"
      >
        <FileText size={28} className="text-stone-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-stone-600">PDF veya gorsel surukle, ya da tikla</p>
        <p className="text-xs text-stone-400 mt-1">Coklu secim desteklenir</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 mb-4">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

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
                <button
                  onClick={() => processQueue(queue)}
                  className="px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg hover:bg-stone-700"
                >
                  {bekleyenler} belgeyi analiz et
                </button>
              )}
              {processing && (
                <div className="flex items-center gap-2 text-xs text-purple-600">
                  <Loader size={13} className="animate-spin" /> Analiz ediliyor...
                </div>
              )}
              {tamamlananlar > 0 && !processing && (
                <button
                  onClick={saveAll}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700"
                >
                  Tumunu kaydet ({tamamlananlar})
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {queue.map((item, idx) => (
              <div key={idx} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3">
                  {item.preview && (
                    <img src={item.preview} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 truncate">{item.name}</p>
                    {item.result && (
                      <p className="text-xs text-stone-400 truncate">{item.result.title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {item.status === 'bekliyor' && <span className="text-xs text-stone-400">Bekliyor</span>}
                    {item.status === 'isleniyor' && <Loader size={14} className="animate-spin text-purple-500" />}
                    {item.status === 'tamam' && (
                      <>
                        <CheckCircle size={14} className="text-emerald-500" />
                        <button
                          onClick={() => saveOne(item)}
                          className="text-xs px-2 py-1 bg-stone-800 text-white rounded-md hover:bg-stone-700"
                        >
                          Kaydet
                        </button>
                      </>
                    )}
                    {item.status === 'hata' && <span className="text-xs text-red-500">Hata</span>}
                    <button onClick={() => removeOne(idx)} className="text-stone-300 hover:text-stone-500">
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
                    {item.result.summary_tr && (
                      <p className="text-xs text-stone-500 mt-2 line-clamp-2">{item.result.summary_tr}</p>
                    )}
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
  )
}