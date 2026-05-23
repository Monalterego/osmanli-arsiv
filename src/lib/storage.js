const DOCS_KEY = 'osmanli_arsiv_belgeler'
const TEZ_KEY = 'osmanli_arsiv_tez_notlari'
const API_KEY = 'osmanli_arsiv_api_key'

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// API Key
export function getApiKey() {
  return localStorage.getItem(API_KEY) || ''
}

export function saveApiKey(key) {
  localStorage.setItem(API_KEY, key)
}

// Belgeler
export async function getDocs() {
  try {
    const raw = localStorage.getItem(DOCS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export async function saveDoc(doc) {
  try {
    const docs = await getDocs()
    const existing = docs.findIndex(d => d.id === doc.id)
    if (existing >= 0) docs[existing] = doc
    else docs.unshift(doc)
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs))
  } catch (e) { console.error('saveDoc error:', e) }
}

export async function deleteDoc(id) {
  try {
    const docs = await getDocs()
    localStorage.setItem(DOCS_KEY, JSON.stringify(docs.filter(d => d.id !== id)))
  } catch (e) { console.error('deleteDoc error:', e) }
}

// Tez Notları
export async function getTezNotlari() {
  try {
    const raw = localStorage.getItem(TEZ_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export async function saveTezNotu(not) {
  try {
    const notlar = await getTezNotlari()
    notlar.unshift({ ...not, created_at: not.created_at || new Date().toISOString() })
    localStorage.setItem(TEZ_KEY, JSON.stringify(notlar))
  } catch (e) { console.error('saveTezNotu error:', e) }
}

export async function deleteTezNotu(id) {
  try {
    const notlar = await getTezNotlari()
    localStorage.setItem(TEZ_KEY, JSON.stringify(notlar.filter(n => n.id !== id)))
  } catch (e) { console.error('deleteTezNotu error:', e) }
}