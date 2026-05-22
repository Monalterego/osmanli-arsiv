import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { getTezNotlari, saveTezNotu, deleteTezNotu, generateId } from '../lib/storage'

const KATEGORILER = [
  'Tez Konusu', 'Kaynak Notu', 'Arsiv Gozlemi',
  'Danisман Gorusmesi', 'Arguman', 'Soru', 'Genel',
]

const KATEGORI_STYLE = {
  'Tez Konusu':        { bg:'rgba(127,119,221,0.1)',  border:'rgba(127,119,221,0.3)', label:'#534AB7' },
  'Kaynak Notu':       { bg:'rgba(186,117,23,0.08)', border:'rgba(186,117,23,0.25)', label:'#854F0B' },
  'Arsiv Gozlemi':     { bg:'rgba(61,100,34,0.08)',  border:'rgba(61,100,34,0.2)',   label:'#3B6D11' },
  'Danisман Gorusmesi':{ bg:'rgba(24,95,165,0.08)',  border:'rgba(24,95,165,0.2)',   label:'#185FA5' },
  'Arguman':           { bg:'rgba(162,45,45,0.07)',  border:'rgba(162,45,45,0.2)',   label:'#A32D2D' },
  'Soru':              { bg:'rgba(186,117,23,0.07)', border:'rgba(186,117,23,0.2)', label:'#854F0B' },
  'Genel':             { bg:'rgba(30,27,46,0.04)',   border:'rgba(30,27,46,0.12)',   label:'#6B6488' },
}

function NotKarti({ not, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const s = KATEGORI_STYLE[not.kategori] || KATEGORI_STYLE['Genel']

  return (
    <div style={{background:s.bg, border:`0.5px solid ${s.border}`, borderRadius:'8px', padding:'12px 14px'}}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'8px'}}>
        <div style={{flex:1}}>
          <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px'}}>
            <span style={{fontSize:'10px', fontWeight:500, color:s.label}}>{not.kategori}</span>
            <span style={{fontSize:'10px', color:'#9B97B8'}}>{new Date(not.created_at).toLocaleDateString('tr-TR')}</span>
          </div>
          <p style={{fontSize:'12px', fontWeight:500, color:'#1E1B2E', marginBottom:'4px'}}>{not.baslik}</p>
          <p style={{fontSize:'11px', color:'#4A4670', lineHeight:1.6, display: !expanded && not.icerik?.length > 200 ? '-webkit-box' : 'block', WebkitLineClamp: !expanded ? 3 : 'unset', WebkitBoxOrient:'vertical', overflow: !expanded && not.icerik?.length > 200 ? 'hidden' : 'visible'}}>
            {not.icerik}
          </p>
          {not.icerik?.length > 200 && (
            <button onClick={() => setExpanded(e => !e)}
              style={{fontSize:'10px', color:'#9B97B8', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'2px', marginTop:'2px', padding:0}}>
              {expanded ? <><ChevronUp size={11} /> Kapat</> : <><ChevronDown size={11} /> Devamini goster</>}
            </button>
          )}
          {not.etiketler?.length > 0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap:'4px', marginTop:'8px'}}>
              {not.etiketler.map(e => (
                <span key={e} style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(255,255,255,0.5)', color:'#6B6488'}}>{e}</span>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => onDelete(not.id)}
          style={{background:'none', border:'none', cursor:'pointer', color:'rgba(30,27,46,0.25)', flexShrink:0, padding:'2px'}}>
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

function NotEkleForm({ onAdd, onCancel }) {
  const [form, setForm] = useState({ baslik:'', icerik:'', kategori:'Genel', etiketler:[] })
  const [etiketInput, setEtiketInput] = useState('')

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function addEtiket() {
    const e = etiketInput.trim()
    if (e && !form.etiketler.includes(e)) { set('etiketler', [...form.etiketler, e]); setEtiketInput('') }
  }

  function handleSubmit() {
    if (!form.baslik.trim()) return alert('Baslik zorunludur.')
    onAdd({ ...form, id: generateId() })
  }

  return (
    <div style={{background:'#F7F6FB', border:'0.5px solid rgba(30,27,46,0.12)', borderRadius:'10px', padding:'16px', marginBottom:'16px'}}>
      <h3 style={{fontSize:'13px', fontWeight:500, color:'#1E1B2E', marginBottom:'12px'}}>Yeni Not</h3>
      <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Baslik *</label>
          <input type="text" value={form.baslik} onChange={e => set('baslik', e.target.value)}
            style={{width:'100%', padding:'7px 10px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none'}} />
        </div>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Kategori</label>
          <select value={form.kategori} onChange={e => set('kategori', e.target.value)}
            style={{width:'100%', padding:'7px 10px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none'}}>
            {KATEGORILER.map(k => <option key={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Icerik</label>
          <textarea value={form.icerik} onChange={e => set('icerik', e.target.value)} rows={4}
            style={{width:'100%', padding:'7px 10px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none', resize:'none'}} />
        </div>
        <div>
          <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'4px'}}>Etiketler</label>
          <div style={{display:'flex', gap:'6px'}}>
            <input type="text" value={etiketInput} onChange={e => setEtiketInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addEtiket()}
              placeholder="Etiket ekle..."
              style={{flex:1, padding:'6px 10px', fontSize:'11px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none'}} />
            <button onClick={addEtiket}
              style={{padding:'6px 12px', fontSize:'11px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'transparent', color:'#6B6488', cursor:'pointer'}}>Ekle</button>
          </div>
          {form.etiketler.length > 0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap:'4px', marginTop:'6px'}}>
              {form.etiketler.map(e => (
                <span key={e} onClick={() => set('etiketler', form.etiketler.filter(x => x !== e))}
                  style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(127,119,221,0.1)', color:'#534AB7', cursor:'pointer'}}>
                  {e} ×
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <button onClick={handleSubmit}
            style={{padding:'7px 16px', background:'#3C3489', color:'#EAE8F5', fontSize:'12px', borderRadius:'6px', border:'none', cursor:'pointer'}}>
            Kaydet
          </button>
          <button onClick={onCancel}
            style={{padding:'7px 16px', background:'transparent', color:'#6B6488', fontSize:'12px', borderRadius:'6px', border:'0.5px solid rgba(30,27,46,0.15)', cursor:'pointer'}}>
            Iptal
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TezNotlari() {
  const [notlar, setNotlar] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [kategoriFilter, setKategoriFilter] = useState('')

  useEffect(() => {
    getTezNotlari().then(data => { setNotlar(data); setLoading(false) })
  }, [])

  async function addNot(not) {
    await saveTezNotu(not)
    setNotlar(prev => [not, ...prev])
    setShowForm(false)
  }

  async function handleDelete(id) {
    if (!confirm('Bu not silinsin mi?')) return
    await deleteTezNotu(id)
    setNotlar(prev => prev.filter(n => n.id !== id))
  }

  const filtered = kategoriFilter ? notlar.filter(n => n.kategori === kategoriFilter) : notlar

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px'}}>
        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
          <BookOpen size={15} color="#534AB7" />
          <h2 style={{fontSize:'15px', fontWeight:500, color:'#1E1B2E'}}>Tez Notlari</h2>
          <span style={{fontSize:'11px', padding:'1px 8px', borderRadius:'10px', background:'rgba(30,27,46,0.07)', color:'#6B6488'}}>{notlar.length}</span>
        </div>
        <button onClick={() => setShowForm(s => !s)}
          style={{display:'inline-flex', alignItems:'center', gap:'6px', padding:'7px 14px', background:'#3C3489', color:'#EAE8F5', fontSize:'12px', borderRadius:'6px', border:'none', cursor:'pointer'}}>
          <Plus size={13} /> Not ekle
        </button>
      </div>

      {showForm && <NotEkleForm onAdd={addNot} onCancel={() => setShowForm(false)} />}

      <div style={{display:'flex', gap:'6px', marginBottom:'16px', flexWrap:'wrap'}}>
        <button onClick={() => setKategoriFilter('')}
          style={{fontSize:'11px', padding:'4px 12px', borderRadius:'6px', border:'0.5px solid', cursor:'pointer',
            background: !kategoriFilter ? '#3C3489' : 'transparent',
            borderColor: !kategoriFilter ? '#3C3489' : 'rgba(30,27,46,0.15)',
            color: !kategoriFilter ? '#EAE8F5' : '#6B6488'}}>
          Tumu
        </button>
        {KATEGORILER.map(k => {
          const count = notlar.filter(n => n.kategori === k).length
          if (count === 0) return null
          const isActive = kategoriFilter === k
          return (
            <button key={k} onClick={() => setKategoriFilter(k)}
              style={{fontSize:'11px', padding:'4px 12px', borderRadius:'6px', border:'0.5px solid', cursor:'pointer',
                background: isActive ? '#3C3489' : 'transparent',
                borderColor: isActive ? '#3C3489' : 'rgba(30,27,46,0.15)',
                color: isActive ? '#EAE8F5' : '#6B6488'}}>
              {k} ({count})
            </button>
          )
        })}
      </div>

      {loading ? (
        <p style={{fontSize:'12px', color:'#9B97B8', textAlign:'center', padding:'40px 0'}}>Yukleniyor...</p>
      ) : filtered.length === 0 ? (
        <div style={{textAlign:'center', padding:'60px 0', color:'#9B97B8'}}>
          <p style={{fontSize:'13px'}}>Henuz not eklenmedi.</p>
          <button onClick={() => setShowForm(true)}
            style={{marginTop:'12px', fontSize:'12px', color:'#7F77DD', background:'none', border:'none', cursor:'pointer'}}>
            Ilk notu ekle →
          </button>
        </div>
      ) : (
        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
          {filtered.map(not => (
            <NotKarti key={not.id} not={not} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}