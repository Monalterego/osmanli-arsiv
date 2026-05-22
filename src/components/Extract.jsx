import { useState } from 'react'
import { Loader, AlertCircle, Download } from 'lucide-react'
import { getApiKey } from '../lib/storage'
import { callClaude } from '../lib/claude'

const SYSTEM = `Sen Osmanli Bankasi arsiv belgelerinden yapisal veri cikaran bir tarih veri analistisin.
Verilen metinden TUM varliklari cikar. Yanit SADECE gecerli JSON olsun, baska hicbir sey yazma.

Format:
{
  "entities": [
    {"type": "kisi", "value": "...", "role": "...", "context": "..."},
    {"type": "tarih", "value": "...", "format": "...", "context": "..."},
    {"type": "miktar", "value": "...", "birim": "...", "context": "..."},
    {"type": "yer", "value": "...", "context": "..."},
    {"type": "kurum", "value": "...", "context": "..."}
  ]
}

type degerleri: kisi | tarih | miktar | yer | kurum`

const TYPE_STYLES = {
  kisi:  { label: 'Kisi',  bg: 'rgba(186,117,23,0.1)',  color: '#854F0B' },
  tarih: { label: 'Tarih', bg: 'rgba(61,100,34,0.1)',   color: '#3B6D11' },
  miktar:{ label: 'Miktar',bg: 'rgba(15,110,86,0.1)',   color: '#0F6E56' },
  yer:   { label: 'Yer',   bg: 'rgba(24,95,165,0.1)',   color: '#185FA5' },
  kurum: { label: 'Kurum', bg: 'rgba(127,119,221,0.12)', color: '#534AB7' },
}

export default function Extract({ initialText = '' }) {
  const [text, setText] = useState(initialText)
  const [entities, setEntities] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleExtract() {
    const key = getApiKey()
    if (!key) { setError("Once Ayarlar'dan API anahtarini gir."); return }
    if (!text.trim()) { setError('Metin giriniz.'); return }
    setError('')
    setLoading(true)
    setEntities(null)
    try {
      const raw = await callClaude(key, SYSTEM, text)
      const cleaned = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(cleaned)
      setEntities(parsed.entities || [])
    } catch (e) {
      setError('Varlik cikarilamadi: ' + e.message)
    }
    setLoading(false)
  }

  function exportCSV() {
    if (!entities) return
    const header = 'Tur,Deger,Rol/Format/Birim,Bagiam'
    const rows = entities.map(e => {
      const extra = e.role || e.format || e.birim || ''
      return `${e.type},"${e.value}","${extra}","${(e.context || '').replace(/"/g, "'")}"`
    })
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'varliklar.csv'
    a.click()
  }

  const grouped = entities
    ? Object.entries(entities.reduce((acc, e) => { (acc[e.type] = acc[e.type] || []).push(e); return acc }, {}))
    : []

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px'}}>
        <h2 style={{fontSize:'15px', fontWeight:500, color:'#1E1B2E'}}>Veri Cikarimi</h2>
        <span style={{fontSize:'10px', padding:'2px 8px', borderRadius:'10px', background:'rgba(127,119,221,0.15)', color:'#534AB7', fontWeight:500}}>AI</span>
      </div>

      <div style={{marginBottom:'12px'}}>
        <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'6px'}}>Metin (Fransizca veya Turkce)</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={6}
          placeholder="Belgeden metin yapistirin — kisi adlari, tarihler, miktarlar, yer ve kurum adlari otomatik cikarilacak..."
          style={{width:'100%', padding:'10px 12px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'8px', background:'#F7F6FB', color:'#1E1B2E', resize:'none', fontFamily:'monospace', outline:'none', lineHeight:1.6}}
        />
      </div>

      <button
        onClick={handleExtract}
        disabled={loading}
        style={{padding:'7px 16px', background: loading ? 'rgba(60,52,137,0.5)' : '#3C3489', color:'#EAE8F5', fontSize:'12px', borderRadius:'6px', border:'none', cursor: loading ? 'not-allowed' : 'pointer', display:'inline-flex', alignItems:'center', gap:'6px', marginBottom:'16px'}}
      >
        {loading ? <><Loader size={13} style={{animation:'spin 1s linear infinite'}} /> Cikariluyor...</> : 'Varliklari cikar'}
      </button>

      {error && (
        <div style={{display:'flex', alignItems:'flex-start', gap:'6px', padding:'10px', background:'rgba(162,45,45,0.06)', border:'0.5px solid rgba(162,45,45,0.15)', borderRadius:'6px', fontSize:'11px', color:'#A32D2D', marginBottom:'12px'}}>
          <AlertCircle size={13} style={{flexShrink:0, marginTop:'1px'}} /> {error}
        </div>
      )}

      {entities && entities.length === 0 && (
        <p style={{fontSize:'12px', color:'#9B97B8'}}>Varlik bulunamadi.</p>
      )}

      {entities && entities.length > 0 && (
        <div>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px'}}>
            <p style={{fontSize:'11px', color:'#6B6488'}}>{entities.length} varlik bulundu</p>
            <button onClick={exportCSV}
              style={{display:'inline-flex', alignItems:'center', gap:'6px', padding:'5px 12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'transparent', color:'#6B6488', fontSize:'11px', cursor:'pointer'}}>
              <Download size={12} /> CSV indir
            </button>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
            {grouped.map(([type, items]) => {
              const style = TYPE_STYLES[type] || { label: type, bg: 'rgba(30,27,46,0.05)', color: '#6B6488' }
              return (
                <div key={type}>
                  <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px'}}>
                    <span style={{fontSize:'10px', padding:'2px 8px', borderRadius:'10px', background:style.bg, color:style.color, fontWeight:500}}>{style.label}</span>
                    <span style={{fontSize:'10px', color:'#9B97B8'}}>{items.length} adet</span>
                  </div>
                  <div style={{display:'flex', flexDirection:'column', gap:'4px'}}>
                    {items.map((e, i) => (
                      <div key={i} style={{display:'flex', gap:'12px', padding:'8px 12px', background:'#F7F6FB', borderRadius:'6px', border:'0.5px solid rgba(30,27,46,0.08)', fontSize:'11px'}}>
                        <span style={{fontWeight:500, color:'#1E1B2E', minWidth:'120px'}}>{e.value}</span>
                        {(e.role || e.format || e.birim) && (
                          <span style={{color:'#6B6488'}}>{e.role || e.format || e.birim}</span>
                        )}
                        <span style={{color:'#9B97B8', marginLeft:'auto', textAlign:'right', maxWidth:'240px'}}>{e.context}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}