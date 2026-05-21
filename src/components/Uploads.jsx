import { useState, useRef } from 'react'
import { Loader, FileText, CheckCircle, AlertCircle } from 'lucide-react'
import { getApiKey } from '../lib/storage'
import { analyzeDocument } from '../lib/claude'

export default function Upload({ onDocumentAnalyzed }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const inputRef = useRef()

  async function handleFile(file) {
    if (!file) return
    const key = getApiKey()
    if (!key) { setError("Once Ayarlar'dan API anahtarini gir."); return }

    setError('')
    setResult(null)
    setLoading(true)

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target.result
      const base64 = dataUrl.split(',')[1]
      const mimeType = file.type

      if (file.type.startsWith('image/')) {
        setPreview(dataUrl)
      } else {
        setPreview(null)
      }

      try {
        const analyzed = await analyzeDocument(key, base64, mimeType)
        setResult(analyzed)
      } catch (err) {
        setError('Analiz hatasi: ' + err.message)
      }
      setLoading(false)
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleSave() {
    if (!result) return
    onDocumentAnalyzed(result)
    setResult(null)
    setPreview(null)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-base font-medium text-stone-800">Belge Yukle ve Analiz Et</h2>
        <span className="text-xs px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full font-medium">AI</span>
      </div>

      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current.click()}
        className="border-2 border-dashed border-stone-200 rounded-xl p-10 text-center cursor-pointer hover:border-stone-400 hover:bg-stone-50 transition-colors mb-4"
      >
        <FileText size={28} className="text-stone-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-stone-600">PDF veya gorsel surukle, ya da tikla</p>
        <p className="text-xs text-stone-400 mt-1">JPG, PNG, PDF desteklenir</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />
      </div>

      {loading && (
        <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-100 rounded-xl mb-4">
          <Loader size={16} className="animate-spin text-purple-600" />
          <div>
            <p className="text-sm font-medium text-purple-800">Belge analiz ediliyor...</p>
            <p className="text-xs text-purple-600">Metin okunuyor, ceviri yapiliyor, etiketler cikariliyor</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 mb-4">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {result && (
        <div className="border border-stone-200 rounded-xl overflow-hidden mb-4">
          <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 border-b border-emerald-100">
            <div className="flex items-center gap-2">
              <CheckCircle size={15} className="text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Analiz tamamlandi</span>
            </div>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 bg-stone-800 text-white text-xs rounded-lg hover:bg-stone-700"
            >
              Belgeye ekle ve kaydet
            </button>
          </div>

          <div className="p-4 space-y-3">
            {preview && (
              <img src={preview} alt="belge" className="w-full max-h-48 object-contain rounded-lg border border-stone-100 mb-2" />
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Baslik</p>
                <p className="text-sm font-medium text-stone-800">{result.title}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Tarih</p>
                <p className="text-sm text-stone-700">{result.date || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Departman</p>
                <p className="text-sm text-stone-700">{result.dept}</p>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-0.5">Dil</p>
                <p className="text-sm text-stone-700">{result.language || '-'}</p>
              </div>
            </div>

            {result.tags?.length > 0 && (
              <div>
                <p className="text-xs text-stone-400 mb-1">Etiketler</p>
                <div className="flex flex-wrap gap-1">
                  {result.tags.map(t => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {result.summary_tr && (
              <div>
                <p className="text-xs text-stone-400 mb-1">Turkce ozet</p>
                <p className="text-sm text-stone-700 leading-relaxed">{result.summary_tr}</p>
              </div>
            )}

            {result.translation_tr && (
              <div>
                <p className="text-xs text-stone-400 mb-1">Ceviri</p>
                <p className="text-sm text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-lg">{result.translation_tr}</p>
              </div>
            )}

            {result.key_entities && (
              <div>
                <p className="text-xs text-stone-400 mb-1.5">Anahtar varliklar</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.key_entities).map(([k, v]) => v?.length > 0 && (
                    <div key={k} className="bg-stone-50 rounded-lg p-2">
                      <p className="text-xs text-stone-400 capitalize mb-1">{k}</p>
                      <p className="text-xs text-stone-700">{v.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.research_note && (
  <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
    <p className="text-xs font-medium text-amber-800 mb-1">Arastirma notu</p>
    <p className="text-xs text-amber-700 leading-relaxed">{result.research_note}</p>
  </div>
)}

{result.original_text && (
  <div className="bg-stone-50 border border-stone-200 rounded-lg p-3">
    <p className="text-xs font-medium text-stone-600 mb-1">Orijinal metin</p>
    <p className="text-xs text-stone-600 leading-relaxed font-mono whitespace-pre-wrap">{result.original_text}</p>
  </div>
)}
          </div>
        </div>
      )}
    </div>
  )
}