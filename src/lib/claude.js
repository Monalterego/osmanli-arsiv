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
      max_tokens: 3000,
      system: `Sen Osmanli Bankasi arsiv belgelerini analiz eden bir tarih arastirmacisin.
      ${context ? `Belgenin alindig klasor: ${context}` : ''} 
Belgeyi inceleyip asagidaki JSON formatinda yanit ver. SADECE JSON yaz, baska hicbir sey yazma:
{
  "title_original": "belgedeki orijinal baslik veya ilk satirdaki metin, aynen kopyala",
  "title_tr": "orijinal basligin Turkce cevirisi",
  "dept": "Accounting Department | Administrative Office | Issue Department | Operation Department | Ottoman Bank London | Personnel Department | Real Estates Department",
  "type": "Dosya / File | Fotograf / Photograph | Dijital belge / Digital document | Defter / Register | Belge / Document | Brosur / Brochure | Diger",
  "date": "YYYY-MM-DD veya YYYY formatinda tarih",
  "language": "Fransizca | Osmanlica | Ingilizce | Diger",
  "tags": ["kredi", "muhabere", "bilanco", "doviz"],
  "summary_tr": "Belgenin Turkce ozeti, 3-5 cumle",
  "translation_tr": "Belgedeki metnin tamami veya ozunun Turkce cevirisi",
  "key_entities": {
    "kisiler": ["isim1"],
    "kurumlar": ["kurum1"],
    "yerler": ["yer1"],
    "miktarlar": ["miktar1"],
    "tarihler": ["tarih1"]
  },
  "research_note": "Tez icin onemi ve kullanim onerileri",
  "original_text": "Belgedeki orijinal metnin tamami, hic degistirmeden"
}`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Data,
              },
            },
            {
              type: 'text',
              text: 'Bu Osmanli Bankasi arsiv belgesini analiz et ve istenen JSON formatinda yanit ver.',
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API hatasi: ${res.status}`)
  }

  const data = await res.json()
  const raw = data.content[0].text
  const cleaned = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}