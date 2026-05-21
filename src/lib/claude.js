export async function callClaude(apiKey, systemPrompt, userMessage) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API hatasi: ${res.status}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}

export async function analyzeDocument(apiKey, base64Data, mimeType) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      max_tokens: 3000,
      messages: [
        {
          role: 'system',
          content: `Sen Osmanli Bankasi arsiv belgelerini analiz eden bir tarih arastirmacisin. 
Belgeyi inceleyip asagidaki JSON formatinda yanit ver. SADECE JSON yaz, baska hicbir sey yazma:
{
  "title": "belge basligi veya tahmini baslik",
  "dept": "Accounting Department | Administrative Office | Issue Department | Operation Department | Ottoman Bank London | Personnel Department | Real Estates Department",
  "type": "Dosya / File | Fotograf / Photograph | Dijital belge / Digital document | Defter / Register | Belge / Document | Brosur / Brochure | Diger",
  "date": "YYYY-MM-DD veya YYYY formatinda tarih",
  "language": "Fransizca | Osmanlica | Ingilizce | Diger",
  "tags": ["kredi", "muhabere", "bilanco", "doviz", "borc", "faiz", "vergi", "sube", "London", "Paris", "Istanbul", "Beyrut", "Kahire", "personel", "hisse", "tahvil", "kamu borcu", "demiryolu", "Duyun-u Umumiye", "Hazine"],
  "summary_tr": "Belgenin Turkce ozeti, 3-5 cumle",
  "translation_tr": "Belgedeki metnin tamami veya ozunun Turkce cevirisi",
  "key_entities": {
    "kisiler": ["isim1", "isim2"],
    "kurumlar": ["kurum1"],
    "yerler": ["yer1"],
    "miktarlar": ["miktar1"],
    "tarihler": ["tarih1"]
  },
  "research_note": "Tez icin onemi ve kullanim onerileri"
}`
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`
              }
            },
            {
              type: 'text',
              text: 'Bu Osmanli Bankasi arsiv belgesini analiz et ve istenen JSON formatinda yanit ver.'
            }
          ]
        }
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API hatasi: ${res.status}`)
  }

  const data = await res.json()
  const raw = data.choices[0].message.content
  const cleaned = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}