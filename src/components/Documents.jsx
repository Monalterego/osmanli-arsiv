import { useState, useMemo } from 'react'
import { Plus, ExternalLink, Trash2, Tag, Search, Languages, Database, ChevronDown, ChevronUp } from 'lucide-react'
import { generateId, saveDocs } from '../lib/storage'
import { DEPARTMENTS, DOC_TYPES, THESIS_TAGS } from '../lib/archiveData'

function DocCard({ doc, onDelete, onTranslate, onExtract }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 hover:border-stone-300 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Tag size={14} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800 leading-snug">{doc.title}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{doc.dept}</span>
            {doc.date && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{doc.date}</span>}
            {doc.type && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">{doc.type}</span>}
            {doc.tags?.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{t}</span>
            ))}
          </div>
          {doc.note && (
            <div className="mt-2">
              <p className={`text-xs text-stone-500 leading-relaxed ${!expanded && 'line-clamp-2'}`}>{doc.note}</p>
              {doc.note.length > 120 && (
                <button onClick={() => setExpanded(e => !e)} className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-0.5 mt-0.5">
                  {expanded ? <><ChevronUp size={12} /> Kapat</> : <><ChevronDown size={12} /> Devamını gör</>}
                </button>
              )}
            </div>
          )}
          <div className="flex gap-2 mt-3 flex-wrap">
            {doc.url && (
              <a href={doc.url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 border border-stone-200 rounded-md hover:bg-stone-50 text-stone-600">
                <ExternalLink size={11} /> SALT'ta aç
              </a>
            )}
            <button onClick={() => onTranslate(doc)}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 border border-stone-200 rounded-md hover:bg-stone-50 text-stone-600">
              <Languages size={11} /> Çevir
            </button>
            <button onClick={() => onExtract(doc)}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 border border-stone-200 rounded-md hover:bg-stone-50 text-stone-600">
              <Database size={11} /> Veri çıkar
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
    title: '', dept: DEPARTMENTS[0], type: DOC_TYPES[0],
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
    if (!form.title.trim()) return alert('Başlık zorunludur.')
    onAdd({ ...form, id: generateId() })
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 max-w-2xl">
      <h3 className="text-sm font-medium text-stone-800 mb-4">Yeni Belge Ekle</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Belge başlığı *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            placeholder="örn. Lettre concernant les opérations de change, 1887"
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Departman</label>
            <select value={form.dept} onChange={e => set('dept', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-stone-400">
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1">Belge türü</label>
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
              placeholder="örn. 1887-03 veya 1887"
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
              placeholder="Özel etiket ekle..."
              className="flex-1 px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
            <button onClick={addCustomTag}
              className="px-3 py-1.5 text-xs border border-stone-200 rounded-lg hover:bg-stone-50">Ekle</button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-stone-500 mb-1">Araştırma notu</label>
          <textarea value={form.note} onChange={e => set('note', e.target.value)}
            rows={3} placeholder="Tez konusuyla bağlantısı, dikkat çeken noktalar, sonraki adımlar..."
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 resize-none" />
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={handleSubmit}
            className="px-4 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700">
            Kaydet
          </button>
          <button onClick={onCancel}
            className="px-4 py-2 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50">
            İptal
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Documents({ docs, setDocs, onTranslate, onExtract }) {
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')

  const allTags = useMemo(() => [...new Set(docs.flatMap(d => d.tags || []))], [docs])

  const filtered = useMemo(() => {
    return docs.filter(d => {
      const q = search.toLowerCase()
      const matchSearch = !q || d.title.toLowerCase().includes(q) || (d.note || '').toLowerCase().includes(q)
      const matchDept = !deptFilter || d.dept === deptFilter
      const matchTag = !tagFilter || (d.tags || []).includes(tagFilter)
      return matchSearch && matchDept && matchTag
    })
  }, [docs, search, deptFilter, tagFilter])

  function addDoc(doc) {
    const updated = [doc, ...docs]
    setDocs(updated)
    saveDocs(updated)
    setShowForm(false)
  }

  function deleteDoc(id) {
    if (!confirm('Bu belge silinsin mi?')) return
    const updated = docs.filter(d => d.id !== id)
    setDocs(updated)
    saveDocs(updated)
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

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Belgede ara..."
            className="w-full pl-7 pr-3 py-1.5 text-sm border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
          className="px-2.5 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none">
          <option value="">Tüm departmanlar</option>
          {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          className="px-2.5 py-1.5 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none">
          <option value="">Tüm etiketler</option>
          {allTags.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-stone-400">
          <p className="text-sm">{docs.length === 0 ? 'Henüz belge eklenmedi.' : 'Sonuç bulunamadı.'}</p>
          {docs.length === 0 && (
            <button onClick={() => setShowForm(true)}
              className="mt-3 text-sm text-blue-600 hover:underline">İlk belgeyi ekle →</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(doc => (
            <DocCard key={doc.id} doc={doc} onDelete={deleteDoc}
              onTranslate={onTranslate} onExtract={onExtract} />
          ))}
        </div>
      )}
    </div>
  )
}