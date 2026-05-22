import { useState } from 'react'
import { Key, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { getApiKey, saveApiKey } from '../lib/storage'

export default function Settings() {
  const [key, setKey] = useState(getApiKey())
  const [show, setShow] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    saveApiKey(key.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{maxWidth:'480px'}}>
      <h2 style={{fontSize:'15px', fontWeight:500, color:'#1E1B2E', marginBottom:'4px'}}>Anthropic API Anahtari</h2>
      <p style={{fontSize:'12px', color:'#6B6488', marginBottom:'20px'}}>
        Ceviri ve veri cikarimi icin gereklidir. Anahtar yalnizca tarayicinizda saklanir.
      </p>

      <div style={{marginBottom:'16px'}}>
        <label style={{display:'block', fontSize:'11px', fontWeight:500, color:'#6B6488', marginBottom:'6px'}}>API Key</label>
        <div style={{display:'flex', gap:'8px'}}>
          <div style={{position:'relative', flex:1}}>
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{width:'100%', padding:'8px 36px 8px 12px', fontSize:'13px', border:'0.5px solid rgba(30,27,46,0.2)', borderRadius:'6px', background:'#F7F6FB', color:'#1E1B2E', outline:'none'}}
            />
            <button
              onClick={() => setShow(s => !s)}
              style={{position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#9B97B8'}}
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button
            onClick={handleSave}
            style={{padding:'8px 16px', background: saved ? '#27500A' : '#3C3489', color:'#EAE8F5', fontSize:'12px', borderRadius:'6px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', transition:'background 0.2s'}}
          >
            {saved ? <CheckCircle size={13} /> : <Key size={13} />}
            {saved ? 'Kaydedildi' : 'Kaydet'}
          </button>
        </div>
      </div>

      <div style={{padding:'12px 16px', background:'rgba(127,119,221,0.07)', border:'0.5px solid rgba(127,119,221,0.2)', borderRadius:'8px', marginBottom:'16px'}}>
        <p style={{fontSize:'11px', fontWeight:500, color:'#534AB7', marginBottom:'6px'}}>API anahtari nasil alinir?</p>
        <ol style={{fontSize:'11px', color:'#6B6488', paddingLeft:'16px', lineHeight:2}}>
          <li>console.anthropic.com adresine git</li>
          <li>Hesap olustur veya giris yap</li>
          <li>API Keys → Create Key</li>
          <li>Anahtari buraya yapistir</li>
        </ol>
      </div>

      {key && (
        <div style={{display:'flex', alignItems:'center', gap:'6px', fontSize:'11px', color:'#3B6D11'}}>
          <CheckCircle size={13} />
          API anahtari mevcut — AI ozellikleri aktif.
        </div>
      )}
    </div>
  )
}