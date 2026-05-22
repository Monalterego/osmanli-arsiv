export async function callClaude(apiKey, systemPrompt, userMessage) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API hatasi: ${res.status}`)
  }
  const data = await res.json()
  return data.content[0].text
}

export async function analyzeDocument(apiKey, base64Data, mimeType, context = '') {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }

  const imageContent = {
    type: 'image',
    source: { type: 'base64', media_type: mimeType, data: base64Data },
  }

  const analysisSystem = `Sen Osmanli Bankasi arsiv belgelerini analiz eden bir tarih arastirmacisin.
${context ? `Belgenin alindigi klasor: ${context}` : ''}
SADECE asagidaki JSON formatinda yanit ver, baska hicbir sey yazma:
{
  "title_original": "belgedeki orijinal baslik veya ilk satirdaki metin, aynen kopyala",
  "title_tr": "orijinal basligin Turkce cevirisi",
  "dept": "Accounting Department | Administrative Office | Issue Department | Operation Department | Ottoman Bank London | Personnel Department | Real Estates Department",
  "type": "Dosya / File | Fotograf / Photograph | Dijital belge / Digital document | Defter / Register | Belge / Document | Brosur / Brochure | Diger",
  "date": "YYYY-MM-DD veya YYYY formatinda tarih",
  "language": "Fransizca | Osmanlica | Ingilizce | Diger",
  "tags": ["etiket1", "etiket2", "etiket3", "etiket4", "etiket5"],
  "summary_tr": "Belgenin Turkce ozeti, 3-5 cumle",
  "translation_tr": "Belgedeki metnin tamami veya ozunun Turkce cevirisi",
  "research_note": "Tez icin onemi ve kullanim onerileri, 2-3 cumle"
}`

  const transcriptionSystem = `Belgedeki TUM metni kelimesi kelimesine transkribe et.
Hicbir sey atlama, hicbir yorum ekleme.
Bos satirlari koru.
Sadece metni yaz, JSON veya baslik ekleme.`

  const [analysisRes, transcriptionRes] = await Promise.all([
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        system: analysisSystem,
        messages: [{ role: 'user', content: [imageContent, { type: 'text', text: 'Bu belgeyi analiz et.' }] }],
      }),
    }),
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 4000,
        system: transcriptionSystem,
        messages: [{ role: 'user', content: [imageContent, { type: 'text', text: 'Bu belgedeki tum metni transkribe et.' }] }],
      }),
    }),
  ])

  if (!analysisRes.ok) {
    const err = await analysisRes.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API hatasi: ${analysisRes.status}`)
  }
  if (!transcriptionRes.ok) {
    const err = await transcriptionRes.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API hatasi: ${transcriptionRes.status}`)
  }

  const analysisData = await analysisRes.json()
  const transcriptionData = await transcriptionRes.json()

  const raw = analysisData.content[0].text.replace(/```json|```/g, '').trim()
  const result = JSON.parse(raw)
  result.original_text = transcriptionData.content[0].text.trim()

  return result
}