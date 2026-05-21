export const ARCHIVE_STRUCTURE = [
  {
    name: 'Accounting Department',
    url: 'https://archives.saltresearch.org/handle/123456789/2303',
    description: '1856\'dan itibaren kesintisiz kayıtlar. En kapsamlı seri.',
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
      { name: 'Société Générale de l\'Empire Ottoman', url: 'https://archives.saltresearch.org/handle/123456789/2321' },
      { name: 'Stocks and Bonds Deposit Books', url: 'https://archives.saltresearch.org/handle/123456789/2322' },
    ],
  },
  {
    name: 'Administrative Office',
    url: 'https://archives.saltresearch.org/handle/123456789/2324',
    description: 'İdari yazışmalar ve yönetim belgeleri.',
    children: [],
  },
  {
    name: 'Issue Department',
    url: 'https://archives.saltresearch.org/handle/123456789/2399',
    description: 'Banknot ve senet ihraç kayıtları.',
    children: [],
  },
  {
    name: 'Operation Department',
    url: 'https://archives.saltresearch.org/handle/123456789/2450',
    description: 'Operasyonel belgeler ve işlem kayıtları.',
    children: [],
  },
  {
    name: 'Ottoman Bank London',
    url: 'https://archives.saltresearch.org/handle/123456789/2496',
    description: 'Londra merkezi ile muhabere ve ortak işlemler.',
    children: [],
  },
  {
    name: 'Personnel Department',
    url: 'https://archives.saltresearch.org/handle/123456789/2499',
    description: 'Personel kayıtları ve atama belgeleri.',
    children: [],
  },
  {
    name: 'Real Estates Department',
    url: 'https://archives.saltresearch.org/handle/123456789/2511',
    description: 'Gayrimenkul kayıtları ve mülkiyet belgeleri.',
    children: [],
  },
]

export const DEPARTMENTS = ARCHIVE_STRUCTURE.map(d => d.name)

export const DOC_TYPES = [
  'Dosya / File',
  'Fotoğraf / Photograph',
  'Dijital belge / Digital document',
  'Defter / Register',
  'Belge / Document',
  'Broşür / Brochure',
  'Hisse senedi / Stock',
  'Banknot / Banknote',
  'Diğer',
]

export const THESIS_TAGS = [
  'kredi', 'muhabere', 'bilanço', 'döviz', 'borç', 'faiz',
  'vergi', 'şube', 'London', 'Paris', 'İstanbul', 'Beyrut',
  'Kahire', 'personel', 'hisse', 'tahvil', 'kamu borcu',
  'demiryolu', 'Düyun-u Umumiye', 'Hazine',
]