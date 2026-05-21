export const ARCHIVE_STRUCTURE = [
  {
    name: 'Muhasebe Bolumu',
    url: 'https://archives.saltresearch.org/handle/123456789/2303',
    description: '1856\'dan itibaren kesintisiz kayitlar. En kapsamli seri.',
    children: [
      { name: 'Administration of Indirect Taxes', url: 'https://archives.saltresearch.org/handle/123456789/2304' },
      { name: 'Bank Coffer Office', url: 'https://archives.saltresearch.org/handle/123456789/2305' },
      { name: 'Cash Book I', url: 'https://archives.saltresearch.org/handle/123456789/2307' },
      { name: 'Cash Book II', url: 'https://archives.saltresearch.org/handle/123456789/2308' },
      { name: 'Cash Reserve Office', url: 'https://archives.saltresearch.org/handle/123456789/2306' },
      { name: 'Cash Vouchers', url: 'https://archives.saltresearch.org/handle/123456789/2309' },
      { name: 'Day Book I', url: 'https://archives.saltresearch.org/handle/123456789/2311' },
      { name: 'Day Book II', url: 'https://archives.saltresearch.org/handle/123456789/2312' },
      { name: 'Day Book of the Branches', url: 'https://archives.saltresearch.org/handle/123456789/2313' },
      { name: 'Day Book of Imperial Treasury Accounts', url: 'https://archives.saltresearch.org/handle/123456789/2310' },
      { name: 'Foreign Exchange Operations Books', url: 'https://archives.saltresearch.org/handle/123456789/2314' },
      { name: 'Istanbul Branch', url: 'https://archives.saltresearch.org/handle/123456789/2323' },
      { name: 'Main Cash Book', url: 'https://archives.saltresearch.org/handle/123456789/2315' },
      { name: 'Main Ledger', url: 'https://archives.saltresearch.org/handle/123456789/2316' },
      { name: 'Ottoman Government', url: 'https://archives.saltresearch.org/handle/123456789/2317' },
      { name: 'Ottoman Public Debt Administration', url: 'https://archives.saltresearch.org/handle/123456789/2318' },
      { name: 'Railways', url: 'https://archives.saltresearch.org/handle/123456789/2319' },
      { name: 'Second Cashier Register', url: 'https://archives.saltresearch.org/handle/123456789/2320' },
      { name: 'Societe Generale de Empire Ottoman', url: 'https://archives.saltresearch.org/handle/123456789/2321' },
      { name: 'Stocks and Bonds Deposit Books', url: 'https://archives.saltresearch.org/handle/123456789/2322' },
    ],
  },
  {
    name: 'Emisyon Bolumu',
    url: 'https://archives.saltresearch.org/handle/123456789/2399',
    description: 'Bank-i Osmani-i Sahane\'nin tedavule soktugu banknotlar ile para basma imtiyazi ve isleviyle ilgili belge, yazisma ve defterlerini icerir.',
    children: [
      {
        name: 'Bank-i Osmani-i Sahane banknotlari',
        url: 'https://archives.saltresearch.org/handle/123456789/2400',
        children: [
          { name: 'II. Abdulaziz (1277-1293)', url: 'https://archives.saltresearch.org/handle/123456789/2401' },
          { name: 'II. Abdulhamid (1293-1327)', url: 'https://archives.saltresearch.org/handle/123456789/2402' },
          { name: 'V. Mehmed (Resad) (1327-1336)', url: 'https://archives.saltresearch.org/handle/123456789/2403' },
        ],
      },
      {
        name: 'Banknotlarin tedavule cikmasi ve geri odenmesiyle ilgili yazisma',
        url: 'https://archives.saltresearch.org/handle/123456789/2410',
        children: [],
      },
      {
        name: 'Banknot numaralama ve hareket defterleri',
        url: 'https://archives.saltresearch.org/handle/123456789/2409',
        children: [],
      },
      {
        name: 'Devlet tarafindan basilan paralar',
        url: 'https://archives.saltresearch.org/handle/123456789/2404',
        children: [
          { name: 'Abdulmecid (1255-1277)', url: 'https://archives.saltresearch.org/handle/123456789/2406' },
          { name: 'II. Abdulhamid (1293-1327)', url: 'https://archives.saltresearch.org/handle/123456789/2405' },
          { name: 'V. Mehmed (Resad) (1327-1336)', url: 'https://archives.saltresearch.org/handle/123456789/2407' },
          { name: 'V. Murad (1293)', url: 'https://archives.saltresearch.org/handle/123456789/2408' },
        ],
      },
      {
        name: 'Yabanci banknotlar',
        url: 'https://archives.saltresearch.org/handle/123456789/92624',
        children: [],
      },
    ],
  },
  {
    name: 'Gayrimenkul Bolumu',
    url: 'https://archives.saltresearch.org/handle/123456789/2511',
    description: 'Gayrimenkul kayitlari ve mulkiyet belgeleri.',
    children: [],
  },
  {
    name: 'Idari Isler Bolumu',
    url: 'https://archives.saltresearch.org/handle/123456789/2324',
    description: 'Idari yazismalar ve yonetim belgeleri.',
    children: [],
  },
  {
    name: 'Operasyon Bolumu',
    url: 'https://archives.saltresearch.org/handle/123456789/2450',
    description: 'Operasyonel belgeler ve islem kayitlari.',
    children: [],
  },
  {
    name: 'Osmanli Bankasi Londra',
    url: 'https://archives.saltresearch.org/handle/123456789/2496',
    description: 'Londra merkezi ile muhabere ve ortak islemler.',
    children: [],
  },
  {
    name: 'Personel Bolumu',
    url: 'https://archives.saltresearch.org/handle/123456789/2499',
    description: 'Personel kayitlari ve atama belgeleri.',
    children: [],
  },
]

export const DEPARTMENTS = ARCHIVE_STRUCTURE.map(d => d.name)

export const DOC_TYPES = [
  'Dosya / File',
  'Fotograf / Photograph',
  'Dijital belge / Digital document',
  'Defter / Register',
  'Belge / Document',
  'Brosur / Brochure',
  'Hisse senedi / Stock',
  'Banknot / Banknote',
  'Diger',
]

export const THESIS_TAGS = [
  'kredi', 'muhabere', 'bilanco', 'doviz', 'borc', 'faiz',
  'vergi', 'sube', 'London', 'Paris', 'Istanbul', 'Beyrut',
  'Kahire', 'personel', 'hisse', 'tahvil', 'kamu borcu',
  'demiryolu', 'Duyun-u Umumiye', 'Hazine', 'banknot', 'gayrimenkul',
]