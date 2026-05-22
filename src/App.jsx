import { useState, useEffect } from 'react'
import { BookOpen, FileText, Languages, Database, FolderOpen, Settings as SettingsIcon, Upload as UploadIcon, Notebook } from 'lucide-react'
import Documents from './components/Documents'
import Translate from './components/Translate'
import Extract from './components/Extract'
import Archive from './components/Archive'
import Settings from './components/Settings'
import Upload from './components/Uploads'
import TezNotlari from './components/TezNotlari'
import { getDocs, saveDoc, generateId } from './lib/storage'

const NAV = [
  { id: 'yukle', label: 'Belge Yukle', icon: UploadIcon },
  { id: 'belgeler', label: 'Belgelerim', icon: FileText },
  { id: 'ceviri', label: 'Ceviri', icon: Languages },
  { id: 'veri', label: 'Veri Cikarimi', icon: Database },
  { id: 'arsiv', label: 'Arsiv Yapisi', icon: FolderOpen },
  { id: 'tez', label: 'Tez Notlari', icon: BookOpen },
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

  async function handleDocumentAnalyzed(result, saltUrl = '') {
    const doc = {
      id: generateId(),
      title: result.title_tr || result.title || 'Isimsiz belge',
      title_tr: result.title_tr || '',
      title_original: result.title_original || '',
      dept: saltUrl ? saltUrl.split(' > ')[0] : (result.dept || 'Operation Department'),
      type: result.type || 'Dosya / File',
      date: result.date || '',
      url: saltUrl || '',
      salt_klasor: saltUrl || '',
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
    <div className="min-h-screen flex flex-col" style={{background:'#F0EEF5'}}>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="flex flex-col flex-shrink-0" style={{width:'200px', background:'#1E1B2E'}}>
          <div className="px-4 py-4" style={{borderBottom:'1px solid rgba(255,255,255,0.07)'}}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center mb-2" style={{background:'#7F77DD'}}>
              <BookOpen size={13} color="#EAE8F5" />
            </div>
            <p className="text-xs font-medium leading-snug" style={{color:'#EAE8F5'}}>Osmanli Bankasi<br/>Arsiv Araci</p>
            <p className="text-xs mt-0.5" style={{color:'rgba(234,232,245,0.4)'}}>SALT Research</p>
          </div>
          <div className="py-2 flex-1">
            {NAV.map(item => {
              const Icon = item.icon
              const isActive = tab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-xs transition-colors text-left"
                  style={{
                    color: isActive ? '#AFA9EC' : 'rgba(234,232,245,0.5)',
                    background: isActive ? 'rgba(127,119,221,0.12)' : 'transparent',
                    borderRight: isActive ? '2px solid #7F77DD' : '2px solid transparent',
                  }}
                >
                  <Icon size={14} />
                  {item.label}
                  {item.id === 'belgeler' && docs.length > 0 && (
                    <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full" style={{background:'rgba(127,119,221,0.2)', color:'#AFA9EC'}}>
                      {docs.length}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Main */}
        <main className="flex-1 overflow-y-auto" style={{background:'#F0EEF5'}}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm" style={{color:'#6B6488'}}>Yukleniyor...</p>
            </div>
          ) : (
            <div className="p-6">
              {tab === 'yukle' && <Upload onDocumentAnalyzed={handleDocumentAnalyzed} />}
              {tab === 'belgeler' && (
                <Documents docs={docs} setDocs={setDocs} onTranslate={handleTranslate} onExtract={handleExtract} />
              )}
              {tab === 'ceviri' && <Translate key={translateText} initialText={translateText} />}
              {tab === 'veri' && <Extract key={extractText} initialText={extractText} />}
              {tab === 'arsiv' && <Archive />}
              {tab === 'tez' && <TezNotlari />}
              {tab === 'ayarlar' && <Settings />}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}