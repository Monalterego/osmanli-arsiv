import { useState, useMemo } from 'react'
import { Plus, ExternalLink, Trash2, Tag, Search, Languages, Database, ChevronDown, ChevronUp } from 'lucide-react'
import { generateId, saveDoc, deleteDoc } from '../lib/storage'
import { ARCHIVE_STRUCTURE, DOC_TYPES, THESIS_TAGS } from '../lib/archiveData'

function DocCard({ doc, onDelete, onTranslate, onExtract }) {
  const [open, setOpen] = useState(false)
  const [showCeviri, setShowCeviri] = useState(false)
  const [showOrijinal, setShowOrijinal] = useState(false)

  const blocks = doc.note ? doc.note.split('\n\n') : []
  const ozet = blocks.find(b => b.startsWith('OZET:'))
  const arastirmaNotu = blocks.find(b => b.startsWith('ARASTIRMA NOTU:'))
  const ceviri = blocks.find(b => b.startsWith('CEVIRI:'))
  const orijinal = blocks.find(b => b.startsWith('ORIJINAL METIN:'))

  return (
    <div style={{background:'#F7F6FB', border: open ? '0.5px solid rgba(127,119,221,0.35)' : '0.5px solid rgba(30,27,46,0.1)', borderRadius:'8px', overflow:'hidden'}}>
      {/* Kapalı görünüm */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', cursor:'pointer', background: open ? 'rgba(127,119,221,0.04)' : 'transparent'}}
      >
        <div style={{width:'28px', height:'28px', background:'rgba(127,119,221,0.12)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
          <Tag size={13} color="#534AB7" />
        </div>
        <div style={{flex:1, minWidth:0}}>
          <p style={{fontSize:'12px', fontWeight:500, color:'#1E1B2E', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {doc.title_tr || doc.title}
          </p>
          {doc.title_original && doc.title_original !== (doc.title_tr || doc.title) && (
            <p style={{fontSize:'10px', color:'#9B97B8', fontStyle:'italic', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
              {doc.title_original}
            </p>
          )}
          <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'4px', flexWrap:'wrap'}}>
            {doc.dept && <span style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(30,27,46,0.07)', color:'#3C3489'}}>{doc.dept}</span>}
            {doc.date && <span style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(61,100,34,0.08)', color:'#3B6D11'}}>{doc.date}</span>}
            {doc.salt_klasor && (
              <span style={{fontSize:'10px', color:'#9B97B8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'200px'}}>
                {doc.salt_klasor.split(' > ').slice(-1)[0]}
              </span>
            )}
          </div>
        </div>
        <div style={{display:'flex', gap:'4px', flexShrink:0}}>
          {doc.tags?.slice(0, 2).map(t => (
            <span key={t} style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(30,27,46,0.06)', color:'#6B6488'}}>{t}</span>
          ))}
        </div>
        {open ? <ChevronUp size={14} color="#9B97B8" /> : <ChevronDown size={14} color="#9B97B8" />}
      </div>

      {/* Açık görünüm */}
      {open && (
        <div style={{borderTop:'0.5px solid rgba(30,27,46,0.07)', padding:'12px 14px', display:'flex', flexDirection:'column', gap:'8px'}}>
          
          {/* Tüm etiketler */}
          {doc.tags?.length > 0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>
              {doc.tags.map(t => (
                <span key={t} style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(30,27,46,0.06)', color:'#6B6488'}}>{t}</span>
              ))}
              {doc.type && <span style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(127,119,221,0.1)', color:'#534AB7'}}>{doc.type}</span>}
            </div>
          )}

          {/* Özet */}
          {ozet && (
            <div style={{background:'rgba(127,119,221,0.07)', borderLeft:'2px solid #7F77DD', borderRadius:'0 4px 4px 0', padding:'8px 10px'}}>
              <p style={{fontSize:'10px', fontWeight:500, color:'#534AB7', marginBottom:'3px'}}>Ozet</p>
              <p style={{fontSize:'11px', color:'#26215C', lineHeight:1.6}}>{ozet.replace('OZET:', '').trim()}</p>
            </div>
          )}

          {/* Araştırma notu */}
          {arastirmaNotu && (
            <div style={{background:'rgba(30,27,46,0.04)', borderLeft:'2px solid rgba(30,27,46,0.15)', borderRadius:'0 4px 4px 0', padding:'8px 10px'}}>
              <p style={{fontSize:'10px', fontWeight:500, color:'#6B6488', marginBottom:'3px'}}>Arastirma notu</p>
              <p style={{fontSize:'11px', color:'#3C3862', lineHeight:1.6}}>{arastirmaNotu.replace('ARASTIRMA NOTU:', '').trim()}</p>
            </div>
          )}

          {/* Toggle butonları */}
          {(ceviri || orijinal) && (
            <div style={{display:'flex', gap:'6px'}}>
              {ceviri && (
                <button
                  onClick={() => setShowCeviri(s => !s)}
                  style={{fontSize:'10px', padding:'3px 8px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'4px', background: showCeviri ? 'rgba(127,119,221,0.1)' : 'transparent', color: showCeviri ? '#534AB7' : '#6B6488', cursor:'pointer'}}
                >
                  {showCeviri ? 'Ceviriyi gizle' : 'Ceviriyi goster'}
                </button>
              )}
              {orijinal && (
                <button
                  onClick={() => setShowOrijinal(s => !s)}
                  style={{fontSize:'10px', padding:'3px 8px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'4px', background: showOrijinal ? 'rgba(127,119,221,0.1)' : 'transparent', color: showOrijinal ? '#534AB7' : '#6B6488', cursor:'pointer'}}
                >
                  {showOrijinal ? 'Orijinali gizle' : 'Orijinal metni goster'}
                </button>
              )}
            </div>
          )}

          {/* Çeviri */}
          {showCeviri && ceviri && (
            <div style={{background:'rgba(30,27,46,0.03)', borderRadius:'4px', padding:'8px 10px'}}>
              <p style={{fontSize:'10px', fontWeight:500, color:'#6B6488', marginBottom:'3px'}}>Ceviri</p>
              <p style={{fontSize:'11px', color:'#2E2A42', lineHeight:1.6}}>{ceviri.replace('CEVIRI:', '').trim()}</p>
            </div>
          )}

          {/* Orijinal metin */}
          {showOrijinal && orijinal && (
            <div style={{background:'rgba(30,27,46,0.04)', borderRadius:'4px', padding:'8px 10px'}}>
              <p style={{fontSize:'10px', fontWeight:500, color:'#6B6488', marginBottom:'3px'}}>Orijinal metin</p>
              <p style={{fontSize:'11px', color:'#3C3862', lineHeight:1.6, fontFamily:'monospace'}}>{orijinal.replace('ORIJINAL METIN:', '').trim()}</p>
            </div>
          )}

          {/* Aksiyon butonları */}
          <div style={{display:'flex', gap:'6px', paddingTop:'4px', borderTop:'0.5px solid rgba(30,27,46,0.07)'}}>
            {doc.url && (
              <button onClick={e => { e.stopPropagation(); window.open(doc.url, '_blank') }}
                style={{fontSize:'10px', padding:'4px 10px', border:'none', borderRadius:'4px', background:'#1E1B2E', color:'#EAE8F5', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'}}>
                <ExternalLink size={11} /> SALT
              </button>
            )}
            <button onClick={e => { e.stopPropagation(); onTranslate(doc) }}
              style={{fontSize:'10px', padding:'4px 10px', border:'0.5px solid rgba(30,27,46,0.12)', borderRadius:'4px', background:'transparent', color:'#3C3489', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'}}>
              <Languages size={11} /> Cevir
            </button>
            <button onClick={e => { e.stopPropagation(); onExtract(doc) }}
              style={{fontSize:'10px', padding:'4px 10px', border:'0.5px solid rgba(30,27,46,0.12)', borderRadius:'4px', background:'transparent', color:'#3C3489', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'}}>
              <Database size={11} /> Veri cikar
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete(doc.id) }}
              style={{fontSize:'10px', padding:'4px 10px', border:'0.5px solid rgba(153,60,29,0.2)', borderRadius:'4px', background:'transparent', color:'#993C1D', cursor:'pointer', marginLeft:'auto', display:'flex', alignItems:'center', gap:'4px'}}>
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      )}
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
    <div style={{background:'#F7F6FB', border:'0.5px solid rgba(30,27,46,0.12)', borderRadius:'12px', padding:'20px', maxWidth:'600px', marginBottom:'16px'}}>
      <h3 style={{fontSize:'13px', fontWeight:500, color:'#1E1B2E', marginBottom:'16px'}}>Yeni Belge Ekle</h3>
      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Baslik *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
            style={{width:'100%', padding:'7px 10px', fontSize:'13px', border:'0.5px solid rgba(30,27,46,0.2)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none'}} />
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <div>
            <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Departman</label>
            <select value={form.dept} onChange={e => set('dept', e.target.value)}
              style={{width:'100%', padding:'7px 10px', fontSize:'13px', border:'0.5px solid rgba(30,27,46,0.2)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none'}}>
              {ARCHIVE_STRUCTURE.map(d => <option key={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Tur</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              style={{width:'100%', padding:'7px 10px', fontSize:'13px', border:'0.5px solid rgba(30,27,46,0.2)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none'}}>
              {DOC_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <div>
            <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Tarih</label>
            <input type="text" value={form.date} onChange={e => set('date', e.target.value)}
              style={{width:'100%', padding:'7px 10px', fontSize:'13px', border:'0.5px solid rgba(30,27,46,0.2)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none'}} />
          </div>
          <div>
            <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>SALT URL</label>
            <input type="text" value={form.url} onChange={e => set('url', e.target.value)}
              style={{width:'100%', padding:'7px 10px', fontSize:'13px', border:'0.5px solid rgba(30,27,46,0.2)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none'}} />
          </div>
        </div>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'6px'}}>Etiketler</label>
          <div style={{display:'flex', flexWrap:'wrap', gap:'4px', marginBottom:'6px'}}>
            {THESIS_TAGS.map(t => (
              <button key={t} onClick={() => toggleTag(t)}
                style={{fontSize:'10px', padding:'2px 8px', borderRadius:'10px', border:'0.5px solid', cursor:'pointer',
                  background: form.tags.includes(t) ? '#534AB7' : 'transparent',
                  borderColor: form.tags.includes(t) ? '#534AB7' : 'rgba(30,27,46,0.2)',
                  color: form.tags.includes(t) ? '#EAE8F5' : '#6B6488'
                }}>{t}</button>
            ))}
          </div>
          <div style={{display:'flex', gap:'6px'}}>
            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomTag()}
              placeholder="Ozel etiket..."
              style={{flex:1, padding:'6px 10px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.2)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none'}} />
            <button onClick={addCustomTag}
              style={{padding:'6px 12px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.2)', borderRadius:'6px', background:'transparent', color:'#6B6488', cursor:'pointer'}}>Ekle</button>
          </div>
        </div>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Not</label>
          <textarea value={form.note} onChange={e => set('note', e.target.value)} rows={3}
            style={{width:'100%', padding:'7px 10px', fontSize:'13px', border:'0.5px solid rgba(30,27,46,0.2)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none', resize:'none'}} />
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <button onClick={handleSubmit}
            style={{padding:'7px 16px', background:'#3C3489', color:'#EAE8F5', fontSize:'13px', borderRadius:'6px', border:'none', cursor:'pointer'}}>
            Kaydet
          </button>
          <button onClick={onCancel}
            style={{padding:'7px 16px', background:'transparent', color:'#6B6488', fontSize:'13px', borderRadius:'6px', border:'0.5px solid rgba(30,27,46,0.2)', cursor:'pointer'}}>
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
    <div style={{width:'180px', flexShrink:0}}>
      <div style={{background:'#E8E5F0', border:'0.5px solid rgba(30,27,46,0.08)', borderRadius:'10px', overflow:'hidden'}}>
        <button
          onClick={() => { setDeptFilter(''); setKlasorFilter('') }}
          style={{width:'100%', textAlign:'left', padding:'8px 12px', fontSize:'12px', fontWeight: !deptFilter && !klasorFilter ? 500 : 400,
            background: !deptFilter && !klasorFilter ? 'rgba(127,119,221,0.1)' : 'transparent',
            color: !deptFilter && !klasorFilter ? '#26215C' : '#6B6488',
            borderBottom:'0.5px solid rgba(30,27,46,0.07)', cursor:'pointer', border:'none',
            borderRight: !deptFilter && !klasorFilter ? '2px solid #7F77DD' : '2px solid transparent'
          }}
        >
          Tum belgeler <span style={{color:'#9B97B8', fontSize:'10px'}}>({docs.length})</span>
        </button>

        {ARCHIVE_STRUCTURE.map(dept => {
          const count = deptCounts[dept.name] || 0
          if (count === 0) return null
          const isActive = deptFilter === dept.name
          const isOpen = openDept === dept.name
          const deptKlasorler = Object.keys(klasorCounts).filter(k => k.includes(dept.name))

          return (
            <div key={dept.name} style={{borderBottom:'0.5px solid rgba(30,27,46,0.05)'}}>
              <div style={{display:'flex', alignItems:'center'}}>
                <button
                  onClick={() => { setDeptFilter(dept.name); setKlasorFilter('') }}
                  style={{flex:1, textAlign:'left', padding:'7px 12px', fontSize:'11px', fontWeight: isActive ? 500 : 400,
                    background: isActive ? 'rgba(127,119,221,0.1)' : 'transparent',
                    color: isActive ? '#26215C' : '#6B6488', cursor:'pointer', border:'none',
                    borderRight: isActive ? '2px solid #7F77DD' : '2px solid transparent'
                  }}
                >
                  {dept.name} <span style={{color:'#9B97B8', fontSize:'10px'}}>({count})</span>
                </button>
                {deptKlasorler.length > 0 && (
                  <button onClick={() => setOpenDept(isOpen ? null : dept.name)}
                    style={{padding:'7px 8px', background:'transparent', border:'none', cursor:'pointer', color:'#9B97B8'}}>
                    {isOpen ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                )}
              </div>
              {isOpen && deptKlasorler.map(k => (
                <button key={k}
                  onClick={() => { setKlasorFilter(k); setDeptFilter(dept.name) }}
                  style={{width:'100%', textAlign:'left', padding:'5px 12px 5px 20px', fontSize:'10px',
                    background: klasorFilter === k ? 'rgba(127,119,221,0.08)' : 'transparent',
                    color: klasorFilter === k ? '#534AB7' : '#9B97B8', cursor:'pointer', border:'none',
                    borderTop:'0.5px solid rgba(30,27,46,0.04)'
                  }}
                >
                  {k.split(' > ').slice(-1)[0]} <span style={{color:'#B8B5CC'}}>({klasorCounts[k]})</span>
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
      const matchSearch = !q || (d.title_tr || d.title || '').toLowerCase().includes(q) || (d.note || '').toLowerCase().includes(q)
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
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <h2 style={{fontSize:'15px', fontWeight:500, color:'#1E1B2E'}}>Belgelerim</h2>
          <span style={{fontSize:'11px', padding:'1px 8px', borderRadius:'10px', background:'rgba(30,27,46,0.07)', color:'#6B6488'}}>{docs.length}</span>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          style={{display:'inline-flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'#3C3489', color:'#EAE8F5', fontSize:'12px', borderRadius:'6px', border:'none', cursor:'pointer'}}>
          <Plus size={13} /> Belge ekle
        </button>
      </div>

      {showForm && <AddDocForm onAdd={addDoc} onCancel={() => setShowForm(false)} />}

      <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
        <div style={{position:'relative', flex:1}}>
          <Search size={12} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#9B97B8'}} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Belgede ara..."
            style={{width:'100%', paddingLeft:'30px', paddingRight:'10px', paddingTop:'7px', paddingBottom:'7px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'#F7F6FB', color:'#1E1B2E', outline:'none'}} />
        </div>
        <select value={tagFilter} onChange={e => setTagFilter(e.target.value)}
          style={{padding:'7px 10px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'#F7F6FB', color:'#6B6488', outline:'none'}}>
          <option value="">Tum etiketler</option>
          {allTags.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div style={{display:'flex', gap:'16px'}}>
        <DeptFilterPanel docs={docs} deptFilter={deptFilter} setDeptFilter={setDeptFilter} klasorFilter={klasorFilter} setKlasorFilter={setKlasorFilter} />

        <div style={{flex:1, display:'flex', flexDirection:'column', gap:'6px'}}>
          {filtered.length === 0 ? (
            <div style={{textAlign:'center', padding:'60px 0', color:'#9B97B8'}}>
              <p style={{fontSize:'13px'}}>{docs.length === 0 ? 'Henuz belge eklenmedi.' : 'Sonuc bulunamadi.'}</p>
              {docs.length === 0 && (
                <button onClick={() => setShowForm(true)}
                  style={{marginTop:'12px', fontSize:'12px', color:'#7F77DD', background:'none', border:'none', cursor:'pointer'}}>
                  Ilk belgeyi ekle →
                </button>
              )}
            </div>
          ) : (
            filtered.map(doc => (
              <DocCard key={doc.id} doc={doc} onDelete={handleDelete} onTranslate={onTranslate} onExtract={onExtract} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}