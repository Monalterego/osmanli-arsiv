const KEYS = {
  DOCS: 'ob_docs',
  API_KEY: 'ob_api_key',
}

export function getDocs() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.DOCS) || '[]')
  } catch {
    return []
  }
}

export function saveDocs(docs) {
  localStorage.setItem(KEYS.DOCS, JSON.stringify(docs))
}

export function getApiKey() {
  return localStorage.getItem(KEYS.API_KEY) || ''
}

export function saveApiKey(key) {
  localStorage.setItem(KEYS.API_KEY, key)
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}