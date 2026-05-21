import { useState, useEffect } from 'react'
import { BookOpen, FileText, Languages, Database, FolderOpen, Settings as SettingsIcon, Upload as UploadIcon } from 'lucide-react'
import Documents from './components/Documents'
import Translate from './components/Translate'
import Extract from './components/Extract'
import Archive from './components/Archive'
import Settings from './components/Settings'
import Upload from './components/Uploads'
import { getDocs, saveDoc, generateId } from './lib/storage'

const NAV = [
  { id: 'yukle', label: 'Belge Yukle', icon: UploadIcon },
  { id: 'belgeler', label: 'Belgelerim', icon: FileText },
  { id: 'ceviri', label: 'Ceviri', icon: Languages },
  { id: 'veri', label: 'Veri Cikarimi', icon: Database },
  { id: 'arsiv', label: 'Arsiv Yapisi', icon: FolderOpen },
  { id: 'ayarlar', label: 'Ayarlar', icon: SettingsIcon },
]

export default function App() {
  const [tab, setTab] = useState('yukle')
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [translateText, setTranslateText] = useState('')
  const [extractText, setExtractText] = useState('')

  useEffect(() => {
    getDocs().then(data => {
      setDocs(data)
      setLoading(false)
    })
  }, [])

  function handleTranslate(doc) {
    setTranslateText(doc.note || '')
    setTab('ceviri')
  }

  function handleExtract(doc) {
    setExtractText(doc.note || '')
    setTab('veri')
  }

  async function handleDocumentAnalyzed(result) {
    const doc = {
      id: generateId(),
      title: result.title || 'Isimsiz belge',
      dept: result.dept || 'Operation Department',
      type: result.type || 'Dosya / File',
      date: result.date || '',
      url: '',
      tags: result.tags || [],
      note: [
        result.summary_tr ? `OZET: ${result.summary_tr}` : '',
        result.research_note ? `ARASTIRMA NOTU: ${result.research_note}` : '',
        result.translation_tr ? `CEVIRI:\n${result.translation_tr}` : '',
        result.original_text ? `ORIJINAL METIN:\n${result.original_text}` : '',
      ].filter(Boolean).join('\n\n'),
    }
    await saveDoc(doc)
    setDocs(prev => [doc, ...prev])
    setTab('belgeler')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-stone-200 px-6 py-3.5 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-stone-800 flex items-center justify-center">
          <BookOpen size={14} className="text-white" />
        </div>
        <div>
          <h1 className="text-sm font-medium text-stone-800 leading-tight">Osmanli Bankasi Arsiv Araci</h1>
          <p className="text-xs text-stone-400">SALT Research koleksiyonu — kisisel arastirma yoneticisi</p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="w-48 bg-white border-r border-stone-200 py-3 flex-shrink-0">
          {NAV.map(item => {
            const Icon = item.icon
            const isActive = tab === item.id
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-stone-100 text-stone-900 font-medium'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                }`}
              >
                <Icon size={15} />
                {item.label}
                {item.id === 'belgeler' && docs.length > 0 && (
                  <span className="ml-auto text-xs bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded-full">
                    {docs.length}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <main className="flex-1 overflow-y-auto p-6 bg-stone-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-stone-400">Belgeler yukleniyor...</p>
            </div>
          ) : (
            <>
              {tab === 'yukle' && <Upload onDocumentAnalyzed={handleDocumentAnalyzed} />}
              {tab === 'belgeler' && (
                <Documents docs={docs} setDocs={setDocs} onTranslate={handleTranslate} onExtract={handleExtract} />
              )}
              {tab === 'ceviri' && <Translate key={translateText} initialText={translateText} />}
              {tab === 'veri' && <Extract key={extractText} initialText={extractText} />}
              {tab === 'arsiv' && <Archive />}
              {tab === 'ayarlar' && <Settings />}
            </>
          )}
        </main>
      </div>
    </div>
  )
}