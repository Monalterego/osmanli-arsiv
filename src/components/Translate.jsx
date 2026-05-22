import { useState } from 'react'
import { Loader, Copy, Check, AlertCircle } from 'lucide-react'
import { getApiKey } from '../lib/storage'
import { callClaude } from '../lib/claude'

const SYSTEM = `Sen Osmanli Bankasi arsiv belgelerini inceleyen bir tarih arastirmacisin. 
Gorev:
1. Fransizca metni akici, akademik Turkceye cevir
2. Osmanli bankacilik ve iktisat tarihi terminolojisini dogru kullan
3. Cevirinin ardindan kisa bir arastirma ozeti ekle

Format (kesinlikle bu yapiyi kullan):
## Ceviri
[Turkce ceviri buraya]

## Arastirma Ozeti
[Tez baglamı icin 3-5 cumle]

## Anahtar Kavramlar
[Belgede gecen onemli isimler, kurumlar, miktarlar, tarihler]`

export default function Translate({ initialText = '' }) {
  const [frText, setFrText] = useState(initialText)
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function handleTranslate() {
    const key = getApiKey()
    if (!key) { setError("Once Ayarlar'dan API anahtarini gir."); return }
    if (!frText.trim()) { setError('Metin giriniz.'); return }
    setError('')
    setLoading(true)
    setResult('')
    try {
      const res = await callClaude(key, SYSTEM, frText)
      setResult(res)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'16px'}}>
        <h2 style={{fontSize:'15px', fontWeight:500, color:'#1E1B2E'}}>Fransizca → Turkce</h2>
        <span style={{fontSize:'10px', padding:'2px 8px', borderRadius:'10px', background:'rgba(127,119,221,0.15)', color:'#534AB7', fontWeight:500}}>AI</span>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
          <label style={{fontSize:'11px', fontWeight:500, color:'#6B6488'}}>Fransizca metin</label>
          <textarea
            value={frText}
            onChange={e => setFrText(e.target.value)}
            rows={14}
            placeholder="Belge metnini buraya yapistirin..."
            style={{flex:1, padding:'10px 12px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.15)', borderRadius:'8px', background:'#F7F6FB', color:'#1E1B2E', resize:'none', fontFamily:'monospace', lineHeight:1.6, outline:'none'}}
          />
          <button
            onClick={handleTranslate}
            disabled={loading}
            style={{padding:'8px', background: loading ? 'rgba(60,52,137,0.5)' : '#3C3489', color:'#EAE8F5', fontSize:'12px', borderRadius:'6px', border:'none', cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'}}
          >
            {loading ? <><Loader size={13} style={{animation:'spin 1s linear infinite'}} /> Cevriliyor...</> : 'Cevir ve analiz et'}
          </button>
          {error && (
            <div style={{display:'flex', alignItems:'flex-start', gap:'6px', padding:'10px', background:'rgba(162,45,45,0.06)', border:'0.5px solid rgba(162,45,45,0.15)', borderRadius:'6px', fontSize:'11px', color:'#A32D2D'}}>
              <AlertCircle size={13} style={{flexShrink:0, marginTop:'1px'}} />
              {error}
            </div>
          )}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <label style={{fontSize:'11px', fontWeight:500, color:'#6B6488'}}>Turkce ceviri + analiz</label>
            {result && (
              <button onClick={handleCopy}
                style={{display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#9B97B8', background:'none', border:'none', cursor:'pointer'}}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Kopyalandi' : 'Kopyala'}
              </button>
            )}
          </div>
          <div style={{flex:1, minHeight:'300px', padding:'10px 12px', fontSize:'12px', border:'0.5px solid rgba(30,27,46,0.1)', borderRadius:'8px', background:'#F0EEF5', color:'#2E2A42', lineHeight:1.7, whiteSpace:'pre-wrap', overflowY:'auto'}}>
            {result || <span style={{color:'#9B97B8'}}>Ceviri burada gorunecek...</span>}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}