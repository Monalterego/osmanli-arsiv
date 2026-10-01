import { useState, useRef, useMemo } from 'react'
import {
  Loader, FileText, CheckCircle, AlertCircle, X, Link2, PenLine,
  Sparkles, ChevronDown, ChevronUp, ExternalLink, Trash2, Search, Plus, BookOpen,
} from 'lucide-react'
import { getApiKey, saveLiteratureItem, deleteLiteratureItem, generateId, saveTezNotu } from '../lib/storage'
import { analyzeLiteraturePDF, analyzeLiteratureText, findNicheGaps } from '../lib/claude'
import { LITERATURE_TYPES } from '../lib/archiveData'

const TUR_STYLE = {
  'Makale':              { bg: 'rgba(24,95,165,0.1)',   color: '#185FA5' },
  'Yuksek Lisans Tezi':  { bg: 'rgba(127,119,221,0.12)', color: '#534AB7' },
  'Doktora Tezi':        { bg: 'rgba(60,52,137,0.14)',  color: '#3C3489' },
  'Kitap':               { bg: 'rgba(61,100,34,0.1)',   color: '#3B6D11' },
  'Kitap Bolumu':        { bg: 'rgba(61,100,34,0.08)',  color: '#3B6D11' },
  'Rapor':               { bg: 'rgba(186,117,23,0.1)',  color: '#854F0B' },
  'Diger':               { bg: 'rgba(30,27,46,0.06)',   color: '#6B6488' },
}

const inputStyle = { width:'100%', padding:'7px 10px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'#F7F6FB', color:'#1E1B2E', outline:'none' }
const btnPrimary = { padding:'7px 14px', background:'#3C3489', color:'#EAE8F5', fontSize:'12px', borderRadius:'6px', border:'none', cursor:'pointer' }
const btnSecondary = { padding:'7px 14px', background:'transparent', color:'#6B6488', fontSize:'12px', borderRadius:'6px', border:'0.5px solid rgba(30,27,46,0.15)', cursor:'pointer' }

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function LitCard({ item, onDelete }) {
  const [open, setOpen] = useState(false)
  const s = TUR_STYLE[item.tur] || TUR_STYLE['Diger']

  return (
    <div style={{background:'#F7F6FB', border: open ? '0.5px solid rgba(127,119,221,0.35)' : '0.5px solid rgba(30,27,46,0.1)', borderRadius:'8px', overflow:'hidden'}}>
      <div onClick={() => setOpen(o => !o)}
        style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', cursor:'pointer', background: open ? 'rgba(127,119,221,0.04)' : 'transparent'}}>
        <div style={{width:'28px', height:'28px', background:s.bg, borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
          <BookOpen size={13} color={s.color} />
        </div>
        <div style={{flex:1, minWidth:0}}>
          <p style={{fontSize:'12px', fontWeight:500, color:'#1E1B2E', lineHeight:1.3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
            {item.title_tr || item.title}
          </p>
          <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'4px', flexWrap:'wrap'}}>
            {item.tur && <span style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:s.bg, color:s.color}}>{item.tur}</span>}
            {item.authors && <span style={{fontSize:'10px', color:'#9B97B8'}}>{item.authors}</span>}
            {item.year && <span style={{fontSize:'10px', color:'#9B97B8'}}>({item.year})</span>}
          </div>
        </div>
        {open ? <ChevronUp size={14} color="#9B97B8" /> : <ChevronDown size={14} color="#9B97B8" />}
      </div>

      {open && (
        <div style={{borderTop:'0.5px solid rgba(30,27,46,0.07)', padding:'12px 14px', display:'flex', flexDirection:'column', gap:'8px'}}>
          {item.temalar?.length > 0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>
              {item.temalar.map(t => (
                <span key={t} style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(30,27,46,0.06)', color:'#6B6488'}}>{t}</span>
              ))}
            </div>
          )}

          {item.ozet_tr && (
            <div style={{background:'rgba(127,119,221,0.07)', borderLeft:'2px solid #7F77DD', borderRadius:'0 4px 4px 0', padding:'8px 10px'}}>
              <p style={{fontSize:'10px', fontWeight:500, color:'#534AB7', marginBottom:'3px'}}>Ozet</p>
              <p style={{fontSize:'11px', color:'#26215C', lineHeight:1.6}}>{item.ozet_tr}</p>
            </div>
          )}

          {item.ana_argumanlar && (
            <div style={{background:'rgba(30,27,46,0.04)', borderLeft:'2px solid rgba(30,27,46,0.15)', borderRadius:'0 4px 4px 0', padding:'8px 10px'}}>
              <p style={{fontSize:'10px', fontWeight:500, color:'#6B6488', marginBottom:'3px'}}>Ana argumanlar</p>
              <p style={{fontSize:'11px', color:'#3C3862', lineHeight:1.6}}>{item.ana_argumanlar}</p>
            </div>
          )}

          {item.bosluk_notu && (
            <div style={{background:'rgba(186,117,23,0.07)', borderLeft:'2px solid #BA7517', borderRadius:'0 4px 4px 0', padding:'8px 10px'}}>
              <p style={{fontSize:'10px', fontWeight:500, color:'#854F0B', marginBottom:'3px'}}>Olasi bosluk / nis ipucu</p>
              <p style={{fontSize:'11px', color:'#5C3B0C', lineHeight:1.6}}>{item.bosluk_notu}</p>
            </div>
          )}

          {item.arastirma_notu && (
            <div style={{background:'rgba(61,100,34,0.06)', borderLeft:'2px solid #3B6D11', borderRadius:'0 4px 4px 0', padding:'8px 10px'}}>
              <p style={{fontSize:'10px', fontWeight:500, color:'#3B6D11', marginBottom:'3px'}}>Teze katkisi</p>
              <p style={{fontSize:'11px', color:'#27500A', lineHeight:1.6}}>{item.arastirma_notu}</p>
            </div>
          )}

          {item.yayin_yeri && (
            <p style={{fontSize:'11px', color:'#9B97B8'}}>{item.yayin_yeri}{item.dil ? ` · ${item.dil}` : ''}</p>
          )}

          <div style={{display:'flex', gap:'6px', paddingTop:'4px', borderTop:'0.5px solid rgba(30,27,46,0.07)'}}>
            {item.kaynak_url && (
              <button onClick={e => { e.stopPropagation(); window.open(item.kaynak_url, '_blank') }}
                style={{fontSize:'10px', padding:'4px 10px', border:'none', borderRadius:'4px', background:'#1E1B2E', color:'#EAE8F5', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'}}>
                <ExternalLink size={11} /> Kaynagi ac
              </button>
            )}
            <button onClick={e => { e.stopPropagation(); onDelete(item.id) }}
              style={{fontSize:'10px', padding:'4px 10px', border:'0.5px solid rgba(153,60,29,0.2)', borderRadius:'4px', background:'transparent', color:'#993C1D', cursor:'pointer', marginLeft:'auto', display:'flex', alignItems:'center', gap:'4px'}}>
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ManuelForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({
    title: '', title_tr: '', authors: '', year: '', tur: LITERATURE_TYPES[0], dil: 'Turkce',
    yayin_yeri: '', kaynak_url: '', ozet_tr: '', ana_argumanlar: '', bosluk_notu: '', arastirma_notu: '', temalar: [],
  })
  const [temaInput, setTemaInput] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }
  function addTema() {
    const t = temaInput.trim()
    if (t && !form.temalar.includes(t)) { set('temalar', [...form.temalar, t]); setTemaInput('') }
  }
  function handleSubmit() {
    if (!form.title.trim()) return alert('Baslik zorunludur.')
    onAdd({ ...form, id: generateId() })
  }

  return (
    <div style={{background:'#F7F6FB', border:'0.5px solid rgba(30,27,46,0.12)', borderRadius:'12px', padding:'20px', marginBottom:'16px'}}>
      <h3 style={{fontSize:'13px', fontWeight:500, color:'#1E1B2E', marginBottom:'16px'}}>Elle Literatur Kaydi Ekle</h3>
      <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Baslik *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)} style={inputStyle} />
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <div>
            <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Yazar(lar)</label>
            <input type="text" value={form.authors} onChange={e => set('authors', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Yil</label>
            <input type="text" value={form.year} onChange={e => set('year', e.target.value)} style={inputStyle} />
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
          <div>
            <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Tur</label>
            <select value={form.tur} onChange={e => set('tur', e.target.value)} style={inputStyle}>
              {LITERATURE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Yayin yeri</label>
            <input type="text" value={form.yayin_yeri} onChange={e => set('yayin_yeri', e.target.value)}
              placeholder="dergi / universite / yayinevi" style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Kaynak URL</label>
          <input type="text" value={form.kaynak_url} onChange={e => set('kaynak_url', e.target.value)}
            placeholder="dergipark, YOK Tez Merkezi, yayinevi sayfasi vb." style={inputStyle} />
        </div>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Ozet</label>
          <textarea value={form.ozet_tr} onChange={e => set('ozet_tr', e.target.value)} rows={3} style={{...inputStyle, resize:'none'}} />
        </div>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Olasi bosluk / nis ipucu</label>
          <textarea value={form.bosluk_notu} onChange={e => set('bosluk_notu', e.target.value)} rows={2} style={{...inputStyle, resize:'none'}} />
        </div>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'6px'}}>Temalar</label>
          <div style={{display:'flex', gap:'6px'}}>
            <input type="text" value={temaInput} onChange={e => setTemaInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTema()} placeholder="tema ekle..."
              style={{flex:1, ...inputStyle}} />
            <button onClick={addTema} style={btnSecondary}>Ekle</button>
          </div>
          {form.temalar.length > 0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap:'4px', marginTop:'6px'}}>
              {form.temalar.map(t => (
                <span key={t} onClick={() => set('temalar', form.temalar.filter(x => x !== t))}
                  style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(127,119,221,0.1)', color:'#534AB7', cursor:'pointer'}}>{t} ×</span>
              ))}
            </div>
          )}
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <button onClick={handleSubmit} style={btnPrimary}>Kaydet</button>
          <button onClick={onCancel} style={btnSecondary}>Iptal</button>
        </div>
      </div>
    </div>
  )
}

function NicheAnalysisPanel({ items, onClose, onSaved }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  async function run() {
    const key = getApiKey()
    if (!key) { setError("Once Ayarlar'dan API anahtarini gir."); return }
    setError(''); setLoading(true); setResult('')
    try {
      const text = await findNicheGaps(key, items)
      setResult(text)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function saveAsTezNotu() {
    await saveTezNotu({ id: generateId(), baslik: 'Nis Analizi — Literatur Taramasi', icerik: result, kategori: 'Tez Konusu', etiketler: ['nis-analizi'] })
    setSaved(true)
    onSaved?.()
  }

  return (
    <div style={{background:'rgba(186,117,23,0.05)', border:'0.5px solid rgba(186,117,23,0.25)', borderRadius:'10px', padding:'16px', marginBottom:'16px'}}>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <Sparkles size={14} color="#854F0B" />
          <h3 style={{fontSize:'13px', fontWeight:500, color:'#4A3520'}}>Nis Analizi</h3>
        </div>
        <button onClick={onClose} style={{background:'none', border:'none', cursor:'pointer', color:'rgba(30,27,46,0.3)'}}><X size={14} /></button>
      </div>

      {!result && !loading && (
        <div>
          <p style={{fontSize:'12px', color:'#6B6488', marginBottom:'10px'}}>
            {items.length} literatur kaydi analiz edilecek: en cok islenen temalar, goreceli bosluklar ve 3-5 somut nis tez acisi onerisi uretilecek.
          </p>
          <button onClick={run} disabled={items.length < 2}
            style={{...btnPrimary, background: items.length < 2 ? 'rgba(60,52,137,0.4)' : '#3C3489', cursor: items.length < 2 ? 'not-allowed' : 'pointer'}}>
            Analizi calistir
          </button>
          {items.length < 2 && <p style={{fontSize:'11px', color:'#9B97B8', marginTop:'6px'}}>En az 2 literatur kaydi gerekir.</p>}
        </div>
      )}

      {loading && (
        <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'12px', color:'#854F0B'}}>
          <Loader size={14} style={{animation:'spin 1s linear infinite'}} /> Literatur sentezleniyor...
        </div>
      )}

      {error && (
        <div style={{display:'flex', alignItems:'flex-start', gap:'6px', padding:'10px', background:'rgba(162,45,45,0.06)', border:'0.5px solid rgba(162,45,45,0.15)', borderRadius:'6px', fontSize:'11px', color:'#A32D2D'}}>
          <AlertCircle size={13} style={{flexShrink:0, marginTop:'1px'}} /> {error}
        </div>
      )}

      {result && (
        <div>
          <div style={{background:'#FFFDF9', border:'0.5px solid rgba(186,117,23,0.2)', borderRadius:'8px', padding:'14px', fontSize:'12px', color:'#2E2A42', lineHeight:1.7, whiteSpace:'pre-wrap', maxHeight:'420px', overflowY:'auto', marginBottom:'10px'}}>
            {result}
          </div>
          <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
            <button onClick={saveAsTezNotu} disabled={saved} style={{...btnPrimary, background: saved ? '#27500A' : '#3C3489'}}>
              {saved ? 'Tez Notu olarak kaydedildi' : 'Tez Notu olarak kaydet'}
            </button>
            <button onClick={run} style={btnSecondary}>Yeniden calistir</button>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function Literature({ items, setItems }) {
  const [showAdd, setShowAdd] = useState(false)
  const [mode, setMode] = useState('pdf')
  const [showNiche, setShowNiche] = useState(false)
  const [search, setSearch] = useState('')
  const [turFilter, setTurFilter] = useState('')

  // PDF modu
  const [queue, setQueue] = useState([])
  const [processing, setProcessing] = useState(false)
  const [ipucu, setIpucu] = useState('')
  const inputRef = useRef()

  // Metin modu
  const [metin, setMetin] = useState('')
  const [metinUrl, setMetinUrl] = useState('')
  const [metinResult, setMetinResult] = useState(null)
  const [metinLoading, setMetinLoading] = useState(false)

  const [error, setError] = useState('')

  const filtered = useMemo(() => items.filter(i => {
    const q = search.toLowerCase()
    const matchSearch = !q || (i.title_tr || i.title || '').toLowerCase().includes(q) ||
      (i.authors || '').toLowerCase().includes(q) || (i.temalar || []).join(' ').toLowerCase().includes(q)
    const matchTur = !turFilter || i.tur === turFilter
    return matchSearch && matchTur
  }), [items, search, turFilter])

  async function persist(item) {
    await saveLiteratureItem(item)
    setItems(prev => [item, ...prev.filter(p => p.id !== item.id)])
  }

  async function handleDelete(id) {
    if (!confirm('Bu literatur kaydi silinsin mi?')) return
    await deleteLiteratureItem(id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  // ---- PDF modu ----
  function handleFiles(files) {
    const key = getApiKey()
    if (!key) { setError("Once Ayarlar'dan API anahtarini gir."); return }
    setError('')
    const newItems = Array.from(files).map(file => ({ file, name: file.name, status: 'bekliyor', result: null }))
    setQueue(prev => [...prev, ...newItems])
  }

  async function processQueue(currentQueue) {
    const key = getApiKey()
    setProcessing(true)
    for (let i = 0; i < currentQueue.length; i++) {
      if (currentQueue[i].status !== 'bekliyor') continue
      setQueue(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'isleniyor' } : it))
      try {
        const base64 = await fileToBase64(currentQueue[i].file)
        const result = await analyzeLiteraturePDF(key, base64, currentQueue[i].file.type, ipucu)
        setQueue(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'tamam', result } : it))
      } catch (err) {
        setQueue(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'hata', error: err.message } : it))
      }
    }
    setProcessing(false)
  }

  async function saveQueueItem(it) {
    await persist({ id: generateId(), ...it.result })
    setQueue(prev => prev.filter(q => q !== it))
  }

  async function saveAllQueue() {
    const ready = queue.filter(it => it.status === 'tamam' && it.result)
    for (const it of ready) await persist({ id: generateId(), ...it.result })
    setQueue(prev => prev.filter(it => it.status !== 'tamam'))
  }

  // ---- Metin modu ----
  async function handleMetinAnalyze() {
    const key = getApiKey()
    if (!key) { setError("Once Ayarlar'dan API anahtarini gir."); return }
    if (!metin.trim()) { setError('Baslik, yazar veya ozet metni yapistirin.'); return }
    setError(''); setMetinLoading(true); setMetinResult(null)
    try {
      const context = metinUrl ? `Kaynak URL: ${metinUrl}` : ''
      const result = await analyzeLiteratureText(key, metin, context)
      setMetinResult(result)
    } catch (e) {
      setError(e.message)
    }
    setMetinLoading(false)
  }

  async function saveMetinResult() {
    await persist({ id: generateId(), ...metinResult, kaynak_url: metinUrl })
    setMetinResult(null); setMetin(''); setMetinUrl('')
  }

  const bekleyenler = queue.filter(q => q.status === 'bekliyor').length
  const tamamlananlar = queue.filter(q => q.status === 'tamam').length

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <h2 style={{fontSize:'15px', fontWeight:500, color:'#1E1B2E'}}>Literatur Taramasi</h2>
          <span style={{fontSize:'11px', padding:'1px 8px', borderRadius:'10px', background:'rgba(30,27,46,0.07)', color:'#6B6488'}}>{items.length}</span>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <button onClick={() => setShowNiche(s => !s)}
            style={{display:'inline-flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'rgba(186,117,23,0.1)', color:'#854F0B', fontSize:'12px', borderRadius:'6px', border:'0.5px solid rgba(186,117,23,0.3)', cursor:'pointer'}}>
            <Sparkles size={13} /> Nis Analizi
          </button>
          <button onClick={() => setShowAdd(s => !s)}
            style={{display:'inline-flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'#3C3489', color:'#EAE8F5', fontSize:'12px', borderRadius:'6px', border:'none', cursor:'pointer'}}>
            <Plus size={13} /> Kaynak ekle
          </button>
        </div>
      </div>

      {showNiche && <NicheAnalysisPanel items={items} onClose={() => setShowNiche(false)} />}

      {error && (
        <div style={{display:'flex', alignItems:'flex-start', gap:'6px', padding:'10px', background:'rgba(162,45,45,0.06)', border:'0.5px solid rgba(162,45,45,0.15)', borderRadius:'6px', fontSize:'11px', color:'#A32D2D', marginBottom:'12px'}}>
          <AlertCircle size={13} style={{flexShrink:0}} /> {error}
        </div>
      )}

      {showAdd && (
        <div style={{background:'#F7F6FB', border:'0.5px solid rgba(30,27,46,0.1)', borderRadius:'12px', padding:'16px', marginBottom:'16px'}}>
          <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
            {[['pdf', 'PDF Yukle', FileText], ['metin', 'Link / Metin', Link2], ['elle', 'Elle Ekle', PenLine]].map(([id, label, Icon]) => (
              <button key={id} onClick={() => setMode(id)}
                style={{display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', fontSize:'12px', borderRadius:'6px', border:'0.5px solid', cursor:'pointer',
                  background: mode === id ? '#3C3489' : 'transparent', borderColor: mode === id ? '#3C3489' : 'rgba(30,27,46,0.15)',
                  color: mode === id ? '#EAE8F5' : '#6B6488'}}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {mode === 'pdf' && (
            <div>
              <input type="text" value={ipucu} onChange={e => setIpucu(e.target.value)}
                placeholder="Ek ipucu (opsiyonel) — ornek: Eldem'in banknot katalogu"
                style={{...inputStyle, marginBottom:'12px'}} />
              <div onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
                onDragOver={e => e.preventDefault()} onClick={() => inputRef.current.click()}
                style={{border:'1.5px dashed rgba(30,27,46,0.15)', borderRadius:'10px', padding:'32px', textAlign:'center', cursor:'pointer', marginBottom:'14px', background:'rgba(127,119,221,0.03)'}}>
                <FileText size={26} color="rgba(30,27,46,0.2)" style={{margin:'0 auto 8px'}} />
                <p style={{fontSize:'13px', fontWeight:500, color:'#4A4670'}}>Makale / tez / kitap PDF'i surukle veya tikla</p>
                <p style={{fontSize:'11px', color:'#9B97B8', marginTop:'4px'}}>Coklu secim desteklenir — PDF icerik dogrudan analiz edilir</p>
                <input ref={inputRef} type="file" accept="application/pdf,image/*" multiple style={{display:'none'}} onChange={e => handleFiles(e.target.files)} />
              </div>

              {queue.length > 0 && (
                <div>
                  <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px'}}>
                    <span style={{fontSize:'11px', color:'#6B6488'}}>{queue.length} dosya</span>
                    <div style={{display:'flex', gap:'6px'}}>
                      {bekleyenler > 0 && !processing && (
                        <button onClick={() => processQueue(queue)} style={btnPrimary}>{bekleyenler} kaynagi analiz et</button>
                      )}
                      {processing && (
                        <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', color:'#534AB7'}}>
                          <Loader size={13} style={{animation:'spin 1s linear infinite'}} /> Analiz ediliyor...
                        </div>
                      )}
                      {tamamlananlar > 0 && !processing && (
                        <button onClick={saveAllQueue} style={{...btnPrimary, background:'#27500A'}}>Tumunu kaydet ({tamamlananlar})</button>
                      )}
                    </div>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                    {queue.map((it, idx) => (
                      <div key={idx} style={{background:'#FFFFFF', border:'0.5px solid rgba(30,27,46,0.1)', borderRadius:'8px', overflow:'hidden'}}>
                        <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px'}}>
                          <div style={{flex:1, minWidth:0}}>
                            <p style={{fontSize:'12px', color:'#1E1B2E', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{it.name}</p>
                            {it.result && <p style={{fontSize:'10px', color:'#9B97B8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{it.result.title_tr || it.result.title}</p>}
                          </div>
                          {it.status === 'bekliyor' && <span style={{fontSize:'11px', color:'#9B97B8'}}>Bekliyor</span>}
                          {it.status === 'isleniyor' && <Loader size={14} color="#7F77DD" style={{animation:'spin 1s linear infinite'}} />}
                          {it.status === 'tamam' && (
                            <>
                              <CheckCircle size={14} color="#3B6D11" />
                              <button onClick={() => saveQueueItem(it)}
                                style={{fontSize:'11px', padding:'3px 10px', background:'#3C3489', color:'#EAE8F5', borderRadius:'4px', border:'none', cursor:'pointer'}}>Kaydet</button>
                            </>
                          )}
                          {it.status === 'hata' && <span style={{fontSize:'11px', color:'#A32D2D'}}>Hata</span>}
                          <button onClick={() => setQueue(prev => prev.filter((_, i) => i !== idx))}
                            style={{background:'none', border:'none', cursor:'pointer', color:'rgba(30,27,46,0.3)'}}><X size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {mode === 'metin' && (
            <div>
              <div style={{marginBottom:'10px'}}>
                <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Kaynak URL (opsiyonel)</label>
                <input type="text" value={metinUrl} onChange={e => setMetinUrl(e.target.value)}
                  placeholder="dergipark, YOK Tez Merkezi, JSTOR vb. link" style={inputStyle} />
              </div>
              <div style={{marginBottom:'10px'}}>
                <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Baslik / yazar / ozet</label>
                <textarea value={metin} onChange={e => setMetin(e.target.value)} rows={6}
                  placeholder="Eserin basligini, yazarini ve bulabildiginiz ozeti/alinti yapistirin..."
                  style={{...inputStyle, resize:'none', fontFamily:'monospace', lineHeight:1.6}} />
              </div>
              <button onClick={handleMetinAnalyze} disabled={metinLoading} style={btnPrimary}>
                {metinLoading ? 'Analiz ediliyor...' : 'Analiz et'}
              </button>

              {metinResult && (
                <div style={{marginTop:'14px', background:'#FFFFFF', border:'0.5px solid rgba(30,27,46,0.1)', borderRadius:'8px', padding:'14px'}}>
                  <p style={{fontSize:'12px', fontWeight:500, color:'#1E1B2E', marginBottom:'4px'}}>{metinResult.title_tr || metinResult.title}</p>
                  <p style={{fontSize:'11px', color:'#6B6488', marginBottom:'8px'}}>{metinResult.authors} {metinResult.year ? `(${metinResult.year})` : ''}</p>
                  {metinResult.ozet_tr && <p style={{fontSize:'11px', color:'#3C3862', lineHeight:1.6, marginBottom:'10px'}}>{metinResult.ozet_tr}</p>}
                  <button onClick={saveMetinResult} style={{...btnPrimary, background:'#27500A'}}>Kaydet</button>
                </div>
              )}
            </div>
          )}

          {mode === 'elle' && (
            <ManuelForm onAdd={async (item) => { await persist(item); setShowAdd(false) }} onCancel={() => setShowAdd(false)} />
          )}
        </div>
      )}

      <div style={{display:'flex', gap:'8px', marginBottom:'12px'}}>
        <div style={{position:'relative', flex:1}}>
          <Search size={12} style={{position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#9B97B8'}} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Baslik, yazar veya temada ara..."
            style={{width:'100%', paddingLeft:'30px', paddingRight:'10px', paddingTop:'7px', paddingBottom:'7px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'#F7F6FB', color:'#1E1B2E', outline:'none'}} />
        </div>
        <select value={turFilter} onChange={e => setTurFilter(e.target.value)}
          style={{padding:'7px 10px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'#F7F6FB', color:'#6B6488', outline:'none'}}>
          <option value="">Tum turler</option>
          {LITERATURE_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
        {filtered.length === 0 ? (
          <div style={{textAlign:'center', padding:'60px 0', color:'#9B97B8'}}>
            <p style={{fontSize:'13px'}}>{items.length === 0 ? 'Henuz literatur kaydi eklenmedi.' : 'Sonuc bulunamadi.'}</p>
          </div>
        ) : (
          filtered.map(item => <LitCard key={item.id} item={item} onDelete={handleDelete} />)
        )}
      </div>
    </div>
  )
}
