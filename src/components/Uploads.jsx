import { useState, useRef } from 'react'
import { Loader, FileText, CheckCircle, AlertCircle, X, BookOpen } from 'lucide-react'
import { getApiKey, saveDoc, generateId } from '../lib/storage'
import { analyzeDocument, analyzeDefterPage } from '../lib/claude'
import { findBreadcrumb, ARCHIVE_STRUCTURE } from '../lib/archiveData'

export default function Upload({ onDocumentAnalyzed }) {
  const [mode, setMode] = useState('tekil')
  const [saltUrl, setSaltUrl] = useState('')
  const [saltMeta, setSaltMeta] = useState(null)
  const [queue, setQueue] = useState([])
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [defterAdi, setDefterAdi] = useState('')
  const [defterRows, setDefterRows] = useState([])
  const [defterProcessing, setDefterProcessing] = useState(false)
  const [defterDone, setDefterDone] = useState(false)
  const inputRef = useRef()
  const defterInputRef = useRef()

  function handleUrlSubmit() {
    const url = saltUrl.trim()
    if (!url.includes('archives.saltresearch.org/handle/')) { setError('Gecerli bir SALT URL girin.'); return }
    setError('')
    setSaltMeta({ url, breadcrumb: findBreadcrumb(url) })
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = e => resolve(e.target.result.split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  async function handleFiles(files) {
    const key = getApiKey()
    if (!key) { setError("Once Ayarlar'dan API anahtarini gir."); return }
    setError('')
    const newItems = Array.from(files).map(file => ({
      file, name: file.name, status: 'bekliyor', result: null,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))
    setQueue(prev => [...prev, ...newItems])
  }

  async function processQueue(currentQueue) {
    const key = getApiKey()
    setProcessing(true)
    for (let i = 0; i < currentQueue.length; i++) {
      if (currentQueue[i].status !== 'bekliyor') continue
      setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'isleniyor' } : item))
      try {
        const base64 = await fileToBase64(currentQueue[i].file)
        const context = saltMeta ? `Bu belge SALT Research arsivinde su klasorden alinmistir: ${saltMeta.url}` : ''
        const result = await analyzeDocument(key, base64, currentQueue[i].file.type, context)
        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'tamam', result } : item))
      } catch (err) {
        setQueue(prev => prev.map((item, idx) => idx === i ? { ...item, status: 'hata', error: err.message } : item))
      }
    }
    setProcessing(false)
  }

  async function saveAll() {
    const ready = queue.filter(item => item.status === 'tamam' && item.result)
    for (const item of ready) await onDocumentAnalyzed(item.result, saltMeta?.breadcrumb || saltMeta?.url)
    setQueue([])
  }

  async function saveOne(item) {
    await onDocumentAnalyzed(item.result, saltMeta?.breadcrumb || saltMeta?.url)
    setQueue(prev => prev.filter(q => q !== item))
  }

  async function handleDefterFiles(files) {
    const key = getApiKey()
    if (!key) { setError("Once Ayarlar'dan API anahtarini gir."); return }
    if (!defterAdi.trim()) { setError('Defter adini girin.'); return }
    setError('')
    setDefterProcessing(true)
    setDefterDone(false)
    const fileList = Array.from(files)
    for (const file of fileList) {
      try {
        const base64 = await fileToBase64(file)
        const context = saltMeta ? `Defter: ${defterAdi}. SALT klasoru: ${saltMeta.url}` : `Defter: ${defterAdi}`
        const parsed = await analyzeDefterPage(key, base64, file.type, context)
        setDefterRows(prev => [...prev, { dosya: file.name, ...parsed }])
      } catch (err) {
        setDefterRows(prev => [...prev, { dosya: file.name, hata: err.message }])
      }
    }
    setDefterProcessing(false)
    setDefterDone(true)
  }

  async function saveDefter() {
    const validRows = defterRows.filter(r => !r.hata)
    const note = [`DEFTER: ${defterAdi}`, `SAYFA SAYISI: ${validRows.length}`, '',
      ...validRows.map((r, i) => [`--- Sayfa ${i + 1} (${r.dosya}) ---`,
        r.tarih ? `Tarih: ${r.tarih}` : '', r.taraflar?.length ? `Taraflar: ${r.taraflar.join(', ')}` : '',
        r.mulk_veya_konu ? `Konu: ${r.mulk_veya_konu}` : '', r.lokasyon ? `Lokasyon: ${r.lokasyon}` : '',
        r.tutar ? `Tutar: ${r.tutar}` : '', r.orijinal_metin ? `Orijinal: ${r.orijinal_metin}` : '',
      ].filter(Boolean).join('\n'))
    ].join('\n')
    const doc = { id: generateId(), title: defterAdi, dept: 'Real Estates Department', type: 'Defter / Register',
      date: validRows[0]?.tarih || '', url: saltMeta?.url || '', salt_klasor: saltMeta?.breadcrumb || saltMeta?.url || '',
      tags: ['defter', 'gayrimenkul'], note }
    await saveDoc(doc)
    setDefterRows([]); setDefterAdi(''); setDefterDone(false)
    alert('Defter kaydedildi!')
  }

  function exportDefterCSV() {
    const rows = defterRows.filter(r => !r.hata).map(r =>
      `"${r.dosya}","${r.sayfa_no||''}","${r.tarih||''}","${(r.taraflar||[]).join('; ')}","${r.mulk_veya_konu||''}","${r.lokasyon||''}","${r.tutar||''}","${r.notlar||''}"`)
    const blob = new Blob([['Dosya,Sayfa No,Tarih,Taraflar,Mulk/Konu,Lokasyon,Tutar,Notlar', ...rows].join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `${defterAdi || 'defter'}.csv`; a.click()
  }

  const bekleyenler = queue.filter(q => q.status === 'bekliyor').length
  const tamamlananlar = queue.filter(q => q.status === 'tamam').length
  const hatalilar = queue.filter(q => q.status === 'hata').length

  const inputStyle = {width:'100%', padding:'7px 10px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'#F7F6FB', color:'#1E1B2E', outline:'none'}
  const btnPrimary = {padding:'7px 14px', background:'#3C3489', color:'#EAE8F5', fontSize:'12px', borderRadius:'6px', border:'none', cursor:'pointer'}
  const btnSecondary = {padding:'7px 14px', background:'transparent', color:'#6B6488', fontSize:'12px', borderRadius:'6px', border:'0.5px solid rgba(30,27,46,0.15)', cursor:'pointer'}

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px'}}>
        <h2 style={{fontSize:'15px', fontWeight:500, color:'#1E1B2E'}}>Belge Yukle ve Analiz Et</h2>
        <span style={{fontSize:'10px', padding:'2px 8px', borderRadius:'10px', background:'rgba(127,119,221,0.15)', color:'#534AB7', fontWeight:500}}>AI</span>
      </div>

      {/* Mod secimi */}
      <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
        {[['tekil', 'Tekil Belge'], ['defter', 'Defter Modu']].map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            style={{display:'flex', alignItems:'center', gap:'6px', padding:'7px 14px', fontSize:'12px', borderRadius:'6px', border:'0.5px solid', cursor:'pointer',
              background: mode === id ? '#3C3489' : 'transparent',
              borderColor: mode === id ? '#3C3489' : 'rgba(30,27,46,0.15)',
              color: mode === id ? '#EAE8F5' : '#6B6488'}}>
            {id === 'defter' ? <BookOpen size={13} /> : <FileText size={13} />} {label}
          </button>
        ))}
      </div>

      {/* SALT Klasor Secimi */}
<div style={{background:'#F7F6FB', border:'0.5px solid rgba(30,27,46,0.1)', borderRadius:'10px', padding:'14px', marginBottom:'16px'}}>
  <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'6px'}}>
    SALT Klasoru (opsiyonel)
  </label>
  <select
    value={saltUrl}
    onChange={e => {
      setSaltUrl(e.target.value)
      if (e.target.value) setSaltMeta({ url: e.target.value, breadcrumb: findBreadcrumb(e.target.value) })
      else setSaltMeta(null)
    }}
    style={{width:'100%', padding:'7px 10px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'6px', background:'#F0EEF5', color:'#1E1B2E', outline:'none'}}
  >
    <option value="">Klasor secin...</option>
    {ARCHIVE_STRUCTURE.map(dept => (
      <optgroup key={dept.url} label={dept.name}>
        <option value={dept.url}>{dept.name}</option>
        {(dept.children || []).map(child => (
          <option key={child.url} value={child.url}>— {child.name}</option>
        ))}
      </optgroup>
    ))}
  </select>
  {saltMeta && (
    <div style={{display:'flex', alignItems:'center', gap:'6px', marginTop:'8px', fontSize:'11px', color:'#3B6D11'}}>
      <CheckCircle size={12} />
      {saltMeta.breadcrumb}
    </div>
  )}
</div>

      {error && (
        <div style={{display:'flex', alignItems:'flex-start', gap:'6px', padding:'10px', background:'rgba(162,45,45,0.06)', border:'0.5px solid rgba(162,45,45,0.15)', borderRadius:'6px', fontSize:'11px', color:'#A32D2D', marginBottom:'12px'}}>
          <AlertCircle size={13} style={{flexShrink:0}} /> {error}
        </div>
      )}

      {/* TEKİL MOD */}
      {mode === 'tekil' && (
        <div>
          <div onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
            onDragOver={e => e.preventDefault()} onClick={() => inputRef.current.click()}
            style={{border:'1.5px dashed rgba(30,27,46,0.15)', borderRadius:'10px', padding:'40px', textAlign:'center', cursor:'pointer', marginBottom:'16px', background:'rgba(127,119,221,0.03)'}}>
            <FileText size={28} color="rgba(30,27,46,0.2)" style={{margin:'0 auto 10px'}} />
            <p style={{fontSize:'13px', fontWeight:500, color:'#4A4670'}}>PDF veya gorsel surukle, ya da tikla</p>
            <p style={{fontSize:'11px', color:'#9B97B8', marginTop:'4px'}}>Coklu secim desteklenir</p>
            <input ref={inputRef} type="file" accept="image/*,.pdf" multiple className="hidden" style={{display:'none'}} onChange={e => handleFiles(e.target.files)} />
          </div>

          {queue.length > 0 && (
            <div>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px'}}>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                  <span style={{fontSize:'11px', color:'#6B6488'}}>{queue.length} dosya</span>
                  {bekleyenler > 0 && <span style={{fontSize:'10px', padding:'1px 8px', borderRadius:'10px', background:'rgba(30,27,46,0.07)', color:'#6B6488'}}>{bekleyenler} bekliyor</span>}
                  {tamamlananlar > 0 && <span style={{fontSize:'10px', padding:'1px 8px', borderRadius:'10px', background:'rgba(61,100,34,0.1)', color:'#3B6D11'}}>{tamamlananlar} tamam</span>}
                  {hatalilar > 0 && <span style={{fontSize:'10px', padding:'1px 8px', borderRadius:'10px', background:'rgba(162,45,45,0.1)', color:'#A32D2D'}}>{hatalilar} hata</span>}
                </div>
                <div style={{display:'flex', gap:'6px'}}>
                  {bekleyenler > 0 && !processing && (
                    <button onClick={() => processQueue(queue)} style={btnPrimary}>{bekleyenler} belgeyi analiz et</button>
                  )}
                  {processing && (
                    <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', color:'#534AB7'}}>
                      <Loader size={13} style={{animation:'spin 1s linear infinite'}} /> Analiz ediliyor...
                    </div>
                  )}
                  {tamamlananlar > 0 && !processing && (
                    <button onClick={saveAll}
                      style={{...btnPrimary, background:'#27500A'}}>
                      Tumunu kaydet ({tamamlananlar})
                    </button>
                  )}
                </div>
              </div>

              <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                {queue.map((item, idx) => (
                  <div key={idx} style={{background:'#F7F6FB', border:'0.5px solid rgba(30,27,46,0.1)', borderRadius:'8px', overflow:'hidden'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px'}}>
                      {item.preview && <img src={item.preview} alt="" style={{width:'36px', height:'36px', objectFit:'cover', borderRadius:'6px', flexShrink:0}} />}
                      <div style={{flex:1, minWidth:0}}>
                        <p style={{fontSize:'12px', color:'#1E1B2E', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.name}</p>
                        {item.result && <p style={{fontSize:'10px', color:'#9B97B8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{item.result.title_tr || item.result.title}</p>}
                      </div>
                      <div style={{display:'flex', alignItems:'center', gap:'8px', flexShrink:0}}>
                        {item.status === 'bekliyor' && <span style={{fontSize:'11px', color:'#9B97B8'}}>Bekliyor</span>}
                        {item.status === 'isleniyor' && <Loader size={14} color="#7F77DD" style={{animation:'spin 1s linear infinite'}} />}
                        {item.status === 'tamam' && (
                          <>
                            <CheckCircle size={14} color="#3B6D11" />
                            <button onClick={() => saveOne(item)}
                              style={{fontSize:'11px', padding:'3px 10px', background:'#3C3489', color:'#EAE8F5', borderRadius:'4px', border:'none', cursor:'pointer'}}>
                              Kaydet
                            </button>
                          </>
                        )}
                        {item.status === 'hata' && <span style={{fontSize:'11px', color:'#A32D2D'}}>Hata</span>}
                        <button onClick={() => setQueue(prev => prev.filter((_, i) => i !== idx))}
                          style={{background:'none', border:'none', cursor:'pointer', color:'rgba(30,27,46,0.3)'}}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                    {item.status === 'tamam' && item.result && (
                      <div style={{borderTop:'0.5px solid rgba(30,27,46,0.07)', padding:'8px 14px', background:'rgba(127,119,221,0.03)'}}>
                        <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>
                          <span style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(30,27,46,0.07)', color:'#3C3489'}}>{item.result.dept}</span>
                          {item.result.date && <span style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(61,100,34,0.08)', color:'#3B6D11'}}>{item.result.date}</span>}
                          {item.result.tags?.slice(0, 3).map(t => <span key={t} style={{fontSize:'10px', padding:'1px 6px', borderRadius:'4px', background:'rgba(30,27,46,0.05)', color:'#6B6488'}}>{t}</span>)}
                        </div>
                        {item.result.summary_tr && <p style={{fontSize:'11px', color:'#4A4670', marginTop:'6px', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{item.result.summary_tr}</p>}
                      </div>
                    )}
                    {item.status === 'hata' && (
                      <div style={{borderTop:'0.5px solid rgba(162,45,45,0.15)', padding:'6px 14px', background:'rgba(162,45,45,0.04)'}}>
                        <p style={{fontSize:'11px', color:'#A32D2D'}}>{item.error}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DEFTER MODU */}
      {mode === 'defter' && (
        <div>
          <div style={{background:'#F7F6FB', border:'0.5px solid rgba(30,27,46,0.1)', borderRadius:'10px', padding:'14px', marginBottom:'16px'}}>
            <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'6px'}}>Defter adi *</label>
            <input type="text" value={defterAdi} onChange={e => setDefterAdi(e.target.value)}
              placeholder="ornek: Grand livre des immeubles, 1884-1888"
              style={inputStyle} />
          </div>

          <div onDrop={e => { e.preventDefault(); handleDefterFiles(e.dataTransfer.files) }}
            onDragOver={e => e.preventDefault()} onClick={() => defterInputRef.current.click()}
            style={{border:'1.5px dashed rgba(186,117,23,0.3)', borderRadius:'10px', padding:'40px', textAlign:'center', cursor:'pointer', marginBottom:'16px', background:'rgba(186,117,23,0.03)'}}>
            <BookOpen size={28} color="rgba(186,117,23,0.4)" style={{margin:'0 auto 10px'}} />
            <p style={{fontSize:'13px', fontWeight:500, color:'#4A3520'}}>Defter sayfalarini surukle veya tikla</p>
            <p style={{fontSize:'11px', color:'#9B97B8', marginTop:'4px'}}>Her sayfadan tarih, taraf, tutar, lokasyon otomatik cikarilir</p>
            <input ref={defterInputRef} type="file" accept="image/*,.pdf" multiple style={{display:'none'}} onChange={e => handleDefterFiles(e.target.files)} />
          </div>

          {defterProcessing && (
            <div style={{display:'flex', alignItems:'center', gap:'10px', padding:'14px', background:'rgba(186,117,23,0.07)', border:'0.5px solid rgba(186,117,23,0.2)', borderRadius:'8px', marginBottom:'12px'}}>
              <Loader size={15} color="#854F0B" style={{animation:'spin 1s linear infinite'}} />
              <div>
                <p style={{fontSize:'12px', fontWeight:500, color:'#854F0B'}}>Defter sayfalari isleniyor...</p>
                <p style={{fontSize:'11px', color:'#A08060'}}>{defterRows.length} sayfa tamamlandi</p>
              </div>
            </div>
          )}

          {defterRows.length > 0 && (
            <div style={{background:'#F7F6FB', border:'0.5px solid rgba(30,27,46,0.1)', borderRadius:'10px', overflow:'hidden'}}>
              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', borderBottom:'0.5px solid rgba(30,27,46,0.07)'}}>
                <span style={{fontSize:'12px', fontWeight:500, color:'#1E1B2E'}}>{defterRows.filter(r => !r.hata).length} sayfa islendi</span>
                <div style={{display:'flex', gap:'6px'}}>
                  <button onClick={exportDefterCSV} style={btnSecondary}>CSV indir</button>
                  {defterDone && <button onClick={saveDefter} style={btnPrimary}>Defter olarak kaydet</button>}
                </div>
              </div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%', fontSize:'11px', borderCollapse:'collapse'}}>
                  <thead>
                    <tr style={{borderBottom:'0.5px solid rgba(30,27,46,0.08)'}}>
                      {['Dosya','Tarih','Taraflar','Konu','Lokasyon','Tutar'].map(h => (
                        <th key={h} style={{textAlign:'left', padding:'8px 12px', fontSize:'10px', fontWeight:500, color:'#9B97B8'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {defterRows.map((row, i) => (
                      <tr key={i} style={{borderBottom:'0.5px solid rgba(30,27,46,0.05)'}}>
                        <td style={{padding:'7px 12px', color:'#6B6488', maxWidth:'100px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{row.dosya}</td>
                        <td style={{padding:'7px 12px', color:'#1E1B2E'}}>{row.hata ? <span style={{color:'#A32D2D'}}>Hata</span> : row.tarih || '-'}</td>
                        <td style={{padding:'7px 12px', color:'#1E1B2E'}}>{row.taraflar?.join(', ') || '-'}</td>
                        <td style={{padding:'7px 12px', color:'#1E1B2E', maxWidth:'160px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{row.mulk_veya_konu || '-'}</td>
                        <td style={{padding:'7px 12px', color:'#1E1B2E'}}>{row.lokasyon || '-'}</td>
                        <td style={{padding:'7px 12px', color:'#1E1B2E'}}>{row.tutar || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}