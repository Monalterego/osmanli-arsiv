function buildMediaBlock(mimeType, base64Data) {
  if (mimeType === 'application/pdf') {
    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64Data } }
  }
  return { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Data } }
}

function authHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }
}

async function postMessage(apiKey, body) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: authHeaders(apiKey),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API hatasi: ${res.status}`)
  }
  return res.json()
}

function parseJsonReply(text) {
  const cleaned = text.replace(/```json|```/g, '').trim()
  return JSON.parse(cleaned)
}

export async function callClaude(apiKey, systemPrompt, userMessage) {
  const data = await postMessage(apiKey, {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  return data.content[0].text
}

// ---- Arsiv belgeleri (SALT) ----

export async function analyzeDocument(apiKey, base64Data, mimeType, context = '') {
  const mediaBlock = buildMediaBlock(mimeType, base64Data)

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

  const [analysisData, transcriptionData] = await Promise.all([
    postMessage(apiKey, {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      system: analysisSystem,
      messages: [{ role: 'user', content: [mediaBlock, { type: 'text', text: 'Bu belgeyi analiz et.' }] }],
    }),
    postMessage(apiKey, {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      system: transcriptionSystem,
      messages: [{ role: 'user', content: [mediaBlock, { type: 'text', text: 'Bu belgedeki tum metni transkribe et.' }] }],
    }),
  ])

  const result = parseJsonReply(analysisData.content[0].text)
  result.original_text = transcriptionData.content[0].text.trim()
  return result
}

export async function analyzeDefterPage(apiKey, base64Data, mimeType, context = '') {
  const mediaBlock = buildMediaBlock(mimeType, base64Data)
  const data = await postMessage(apiKey, {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    system: `Sen Osmanli Bankasi defter sayfalarini analiz eden bir tarih veri analistisin. SADECE JSON yaz:\n{"sayfa_no":"...","tarih":"...","taraflar":["..."],"mulk_veya_konu":"...","lokasyon":"...","tutar":"...","notlar":"...","orijinal_metin":"..."}`,
    messages: [{ role: 'user', content: [mediaBlock, { type: 'text', text: `${context}. Bu defter sayfasini analiz et.` }] }],
  })
  return parseJsonReply(data.content[0].text)
}

// ---- Literatur (makale / tez / kitap) ----

const LITERATURE_FORMAT = `{
  "title": "eserin basligi, orijinal dilinde",
  "title_tr": "basligin Turkce cevirisi (orijinal zaten Turkce ise ayni yaz)",
  "authors": "yazar(lar), virgulle ayrilmis",
  "year": "yayim yili, YYYY formatinda",
  "tur": "Makale | Yuksek Lisans Tezi | Doktora Tezi | Kitap | Kitap Bolumu | Rapor | Diger",
  "dil": "Turkce | Ingilizce | Fransizca | Diger",
  "yayin_yeri": "dergi adi, ya da universite/enstitu adi, ya da yayinevi",
  "ozet_tr": "calismanin 4-6 cumlelik Turkce ozeti",
  "ana_argumanlar": "calismanin temel tez ve bulgularinin 3-5 cumlelik ozeti",
  "temalar": ["tema1", "tema2", "tema3", "tema4"],
  "arastirma_notu": "bu calismanin, Osmanli Bankasi'nin para ihraci imtiyazi ve Osmanli kamu maliyesine etkisi konulu teze nasil katki saglayabilecegine dair 2-3 cumle",
  "bosluk_notu": "bu calismanin deginmedigi, yuzeysel gectigi ya da tartismaya acik biraktigi noktalara dair 2-3 cumle — olasi bir nis tez acisi ipucu"
}`

export async function analyzeLiteraturePDF(apiKey, base64Data, mimeType, context = '') {
  const mediaBlock = buildMediaBlock(mimeType, base64Data)
  const system = `Sen Osmanli Bankasi konusunda yuksek lisans tezi yazan bir arastirmaciya yardim eden bir akademik literatur analistisin.
${context ? `Ek baglam: ${context}` : ''}
SADECE asagidaki JSON formatinda yanit ver, baska hicbir sey yazma:
${LITERATURE_FORMAT}`
  const data = await postMessage(apiKey, {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1600,
    system,
    messages: [{ role: 'user', content: [mediaBlock, { type: 'text', text: 'Bu akademik calismayi (makale/tez/kitap) analiz et.' }] }],
  })
  return parseJsonReply(data.content[0].text)
}

export async function analyzeLiteratureText(apiKey, pastedText, context = '') {
  const system = `Sen Osmanli Bankasi konusunda yuksek lisans tezi yazan bir arastirmaciya yardim eden bir akademik literatur analistisin.
${context ? `Ek baglam: ${context}` : ''}
Sana bir akademik calismanin basligi, yazari, ozeti veya alinti bir bolumu verilecek. Eldeki bilgiden SADECE asagidaki JSON formatinda yanit ver, baska hicbir sey yazma. Bilgi eksikse makul tahmin yap ya da bos birak:
${LITERATURE_FORMAT}`
  const raw = await callClaude(apiKey, system, pastedText)
  return parseJsonReply(raw)
}

export async function findNicheGaps(apiKey, literatureList) {
  const condensed = literatureList.map(l => ({
    baslik: l.title_tr || l.title,
    yil: l.year,
    tur: l.tur,
    temalar: l.temalar || [],
    ozet: l.ozet_tr,
    bosluk: l.bosluk_notu,
  }))

  const system = `Sen Osmanli Bankasi konusunda literatur taramasini tamamlamis bir yuksek lisans ogrencisine tez konusunu netlestirmekte yardimci olan bir akademik danismansin.
Ogrencinin tez basligi (calisma basligi): "Osmanli Bankasi'nin Para Ihraci Imtiyazi ve Osmanli Kamu Maliyesine Etkisi (1863-1914)".
Sana ogrencinin topladigi literatur listesi JSON olarak verilecek (her kayitta: baslik, yil, tur, temalar, ozet, bosluk notu).

Bu listeyi analiz ederek Turkce, Markdown basliklarla (##) bicimlendirilmis, okunabilir bir duzyazi/liste metni uret. Icerik:
## Literaturde One Cikan Temalar
Literaturde en cok islenen 3-4 temayi ve hangi calismalarda gectigini belirt.

## Goreceli Olarak Az Islenmis Alanlar
Literaturun yuzeysel gectigi, cok az calismanin degindigi ya da hic deginmedigi 3-4 temayi/aciyi belirt; hangi calismalarin bosluk notlarindan yola ciktigini belirt.

## Onerilen Nis Tez Acilari
Yukaridaki bosluklardan yola cikarak, somut ve arastirilabilir 3-5 nis tez acisi oner. Her biri icin: kisa gerekce, bu acinin mevcut literaturden farki, ve hangi tur kaynaklarin (arsiv belgesi / ikincil literatur) kullanilabilecegine dair bir not ekle.

JSON degil, dogrudan okunabilir Turkce metin olarak yanit ver.`

  return callClaude(apiKey, system, JSON.stringify(condensed, null, 2))
}
