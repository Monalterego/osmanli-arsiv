import { useState, useMemo } from 'react'
import { Plus, ExternalLink, Trash2, Tag, Search, Languages, Database, ChevronDown, ChevronUp } from 'lucide-react'
import { generateId, saveDoc, deleteDoc } from '../lib/storage'
import { ARCHIVE_STRUCTURE, DOC_TYPES, THESIS_TAGS } from '../lib/archiveData'

function DocCard({ doc, onDelete, onTranslate, onExtract }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Tag size={14} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800 leading-snug">{doc.title_tr || doc.title}</p>
{doc.title_original && doc.title_original !== doc.title_tr && (
  <p className="text-xs text-stone-400 mt-0.5 italic">{doc.title_original}</p>
)}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{doc.dept}</span>
            {doc.date && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{doc.date}</span>}
            {doc.type && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{doc.type}</span>}
            {doc.tags?.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{t}</span>
            ))}
            {doc.salt_klasor && (
              <button onClick={() => window.open(doc.salt_klasor.startsWith('http') ? doc.salt_klasor : '#', '_blank')}
                className="text-xs px-2 py-0.5 rounded-full bg-stone-800 text-white hover:bg-stone-600">
                SALT
              </button>
            )}
          </div>
          {doc.note && (
            <div className="mt-2 space-y-2">
              {doc.note.split('\n\n').map((block, i) => {
                const isOzet = block.startsWith('OZET:')
                const isCeviri = block.startsWith('CEVIRI:')
                const isNot = block.startsWith('ARASTIRMA NOTU:')
                const isOrijinal = block.startsWith('ORIJINAL METIN:')
                if (!expanded && i > 0) return null
                return (
                  <div key={i} className={`text-xs rounded-lg p-2 ${
                    isOzet ? 'bg-blue-50 text-blue-800' :
                    isCeviri ? 'bg-stone-50 text-stone-700' :
                    isNot ? 'bg-amber-50 text-amber-800' :
                    isOrijinal ? 'bg-stone-100 text-stone-600 font-mono' :
                    'text-stone-500'
                  }`}>
                    <span className="font-medium block mb-0.5">
                      {isOzet ? 'Ozet' : isCeviri ? 'Ceviri' : isNot ? 'Arastirma notu' : isOrijinal ? 'Orijinal metin' : ''}
                    </span>
                    <span className="leading-relaxed">{block.replace(/^(OZET|CEVIRI|ARASTIRMA NOTU|ORIJINAL METIN):/, '').trim()}</span>
                  </div>
                )
              })}
              {doc.note.split('\n\n').length > 1 && (
                <button onClick={() => setExpanded(e => !e)} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-0.5">
                  {expanded ? <><ChevronUp size={12} /> Kapat</> : <><ChevronDown size={12} /> Tamamini goster</>}
                </button>
              )}
            </div>
          )}
          <div className="flex gap-2 mt-3 flex-wrap">
            {doc.url && (
              <button onClick={() => window.open(doc.url, '_blank')}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 border border-stone-200 rounded-md hover:bg-stone-50 text-stone-600">
                <ExternalLink size={11} /> SALT
              </button>
            )}
            <button onClick={() => onTranslate(doc)}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 border border-stone-200 rounded-md hover:bg-stone-50 text-stone-600">
              <Languages size={11} /> Cevir
            </button>
            <button onClick={() => onExtract(doc)}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 border border-stone-200 rounded-md hover:bg-stone-50 text-stone-600">
              <Database size={11} /> Veri cikar
            </button>
            <button onClick={() => onDelete(doc.id)}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 border border-red-100 rounded-md hover:bg-red-50 text-red-500 ml-auto">
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function AddDocForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    title: '', dept: ARCHIVE_STRUCTURE[0].name, type: DOC_TYPES[0],
    date: '', url: '', tags: [], note: '',
  })
  const [tagInput, setTagInput] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function toggleTag(t) {
    set('tags', form.tags.includes(t) ? form.tags.filter(x => x !== t) : [...form.tags, t])
  }

  function addCustomTag() {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) { set('tags', [...form.tags, t]); setTagInput('') }
  }

  function handleSubmit() {
    if (!form.title.trim()) return alert('Baslik zorunludur.')
    onAdd({ ...form, id: generateId() })
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 max-w-2xl">
      <h3 className="text-sm font-medium text-stone-800 mb-4">Yeni Belge Ekle</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Belge basligi *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="ornek: Lettre concernant les operations de change, 1887"
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Departman</label>
            <select value={form.dept} onChange={e => set('dept', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-stone-400">
              {ARCHIVE_STRUCTURE.map(d => <option key={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Belge turu</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-stone-400">
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Tarih</label>
            <input type="text" value={form.date} onChange={e => set('date', e.target.value)}
              placeholder="ornek: 1887-03 veya 1887"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">SALT URL</label>
            <input type="text" value={form.url} onChange={e => set('url', e.target.value)}
              placeholder="archives.saltresearch.org/handle/..."
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1.5">Etiketler</label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {THESIS_TAGS.map(t => (
              <button key={t} onClick={() => toggleTag(t)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  form.tags.includes(t)
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-400'
                }`}>{t}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomTag()}
              placeholder="Ozel etiket ekle..."
              className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
            <button onClick={addCustomTag}
              className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg hover:bg-stone-50">Ekle</button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Arastirma notu</label>
          <textarea value={form.note} onChange={e => set('note', e.target.value)}
            rows={3} placeholder="Tez konusuyla baglantisi, dikkat ceken noktalar..."
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 resize-none" />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={handleSubmit}
            className="px-4 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700">
            Kaydet
          </button>
          <button onClick={onCancel}
            className="px-4 py-2 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50">
            Iptal
          </button>
        </div>
      </div>
    </div>
  )
}

function DeptFilterPanel({ docs, deptFilter, setDeptFilter, klasorFilter, setKlasorFilter }) {
  const [openDept, setOpenDept] = useState(null)

  const deptCounts = useMemo(() => {
    const counts = {}
    docs.forEach(d => { counts[d.dept] = (counts[d.dept] || 0) + 1 })
    return counts
  }, [docs])

  const klasorCounts = useMemo(() => {
    const counts = {}
    docs.forEach(d => { if (d.salt_klasor) counts[d.salt_klasor] = (counts[d.salt_klasor] || 0) + 1 })
    return counts
  }, [docs])

  return (
    <div className="w-52 flex-shrink-0">
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <button
          onClick={() => { setDeptFilter(''); setKlasorFilter('') }}
          className={`w-full text-left px-3 py-2.5 text-sm font-medium border-b border-stone-100 ${
            !deptFilter && !klasorFilter ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50'
          }`}
        >
          Tum belgeler
          <span className="ml-1 text-xs text-stone-400">({docs.length})</span>
        </button>

        {ARCHIVE_STRUCTURE.map(dept => {
          const count = deptCounts[dept.name] || 0
          if (count === 0) return null
          const isOpen = openDept === dept.name
          const isActive = deptFilter === dept.name

          const deptKlasorler = Object.keys(klasorCounts).filter(k =>
  k.includes(dept.name) || k.startsWith(dept.name)
)

          return (
            <div key={dept.name} className="border-b border-stone-100 last:border-0">
              <div className="flex items-center">
                <button
                  onClick={() => { setDeptFilter(dept.name); setKlasorFilter('') }}
                  className={`flex-1 text-left px-3 py-2 text-xs ${
                    isActive ? 'font-medium text-stone-900 bg-stone-50' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {dept.name}
                  <span className="ml-1 text-stone-400">({count})</span>
                </button>
                {deptKlasorler.length > 0 && (
                  <button
                    onClick={() => setOpenDept(isOpen ? null : dept.name)}
                    className="px-2 py-2 text-stone-400 hover:text-stone-600"
                  >
                    {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                )}
              </div>

              {isOpen && deptKlasorler.map(k => (
                <button
                  key={k}
                  onClick={() => { setKlasorFilter(k); setDeptFilter(dept.name) }}
                  className={`w-full text-left px-4 py-1.5 text-xs border-t border-stone-50 ${
                    klasorFilter === k ? 'bg-blue-50 text-blue-700 font-medium' : 'text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  <span className="block truncate">
                    {k.split(' > ').slice(-1)[0]}
                  </span>
                  <span className="text-stone-400">({klasorCounts[k]})</span>
                </button>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Documents({ docs, setDocs, onTranslate, onExtract }) {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [klasorFilter, setKlasorFilter] = useState('')

  const allTags = useMemo(() => [...new Set(docs.flatMap(d => d.tags || []))], [docs])

  const filtered = useMemo(() => {
    return docs.filter(d => {
      const q = search.toLowerCase()
      const matchSearch = !q || d.title.toLowerCase().includes(q) || (d.note || '').toLowerCase().includes(q)
      const matchDept = !deptFilter || d.dept === deptFilter
      const matchTag = !tagFilter || (d.tags || []).includes(tagFilter)
      const matchKlasor = !klasorFilter || d.salt_klasor === klasorFilter
      return matchSearch && matchDept && matchTag && matchKlasor
    })
  }, [docs, search, deptFilter, tagFilter, klasorFilter])

  async function addDoc(doc) {
    await saveDoc(doc)
    setDocs(prev => [doc, ...prev])
    setShowForm(false)
  }

  async function handleDelete(id) {
    if (!confirm('Bu belge silinsin mi?')) return
    await deleteDoc(id)
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-medium text-stone-800">Belgelerim</h2>
          <span className="text-xs px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full">{docs.length}</span>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700">
          <Plus size={14} /> Belge ekle
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <AddDocForm onAdd={addDoc} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="mb-3 flex gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Belgede ara..."
            className="w-full pl-7 pr-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
        </div>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          className="px-2.5 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none">
          <option value="">Tum etiketler</option>
          {allTags.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="flex gap-4">
        <DeptFilterPanel
          docs={docs}
          deptFilter={deptFilter}
          setDeptFilter={setDeptFilter}
          klasorFilter={klasorFilter}
          setKlasorFilter={setKlasorFilter}
        />

        <div className="flex-1 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-stone-400">
              <p className="text-sm">{docs.length === 0 ? 'Henuz belge eklenmedi.' : 'Sonuc bulunamadi.'}</p>
              {docs.length === 0 && (
                <button onClick={() => setShowForm(true)}
                  className="mt-3 text-sm text-blue-600 hover:underline">Ilk belgeyi ekle</button>
              )}
            </div>
          ) : (
            filtered.map(doc => (
              <DocCard key={doc.id} doc={doc} onDelete={handleDelete}
                onTranslate={onTranslate} onExtract={onExtract} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}