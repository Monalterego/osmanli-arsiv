import { useState } from 'react'
import { Key, Eye, EyeOff, CheckCircle, ExternalLink } from 'lucide-react'
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
    <div className="max-w-lg">
      <h2 className="text-base font-medium text-stone-800 mb-1">Anthropic API Anahtarı</h2>
      <p className="text-sm text-stone-500 mb-6">
        Çeviri ve veri çıkarımı için gereklidir. Anahtar yalnızca tarayıcınızda saklanır, hiçbir sunucuya gönderilmez.
      </p>
      <div className="mb-4">
        <label className="block text-xs font-medium text-stone-500 mb-1.5">API Key</label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={show ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-stone-400 pr-10"
            />
            <button
              onClick={() => setShow(s => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-stone-800 text-white text-sm rounded-lg hover:bg-stone-700 flex items-center gap-2"
          >
            {saved ? <CheckCircle size={14} /> : <Key size={14} />}
            {saved ? 'Kaydedildi' : 'Kaydet'}
          </button>
        </div>
      </div>
      <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
        <p className="font-medium mb-1">API anahtarı nasıl alınır?</p>
        <ol className="list-decimal list-inside space-y-1 text-amber-700">
          <li>console.anthropic.com adresine git</li>
          <li>Hesap oluştur veya giriş yap</li>
          <li>API Keys → Create Key</li>
          <li>Anahtarı buraya yapıştır</li>
        </ol>
        <p className="mt-2">
          
            href="https://console.anthropic.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-amber-800 font-medium hover:underline"
          >
            console.anthropic.com <ExternalLink size={11} />
          </a>
        </p>
      </div>
      {key && (
        <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700">
          <CheckCircle size={13} />
          API anahtarı mevcut — AI özellikleri aktif.
        </div>
      )}
    </div>
  )
}