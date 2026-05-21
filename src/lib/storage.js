const SUPABASE_URL = 'https://ewvigvfstcraybwnhlqv.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3dmlndmZzdGNyYXlid25obHF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNTM4NDAsImV4cCI6MjA5NDkyOTg0MH0.DU8pZ0IRMTnSQKkfpQdYDWD8qVN7ERX_46PNO-KbC38'

const HEADERS = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
}

export async function getDocs() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/belgeler?order=created_at.desc`, {
    headers: HEADERS,
  })
  if (!res.ok) return []
  return await res.json()
}

export async function saveDoc(doc) {
  await fetch(`${SUPABASE_URL}/rest/v1/belgeler`, {
    method: 'POST',
    headers: { ...HEADERS, 'Prefer': 'resolution=merge-duplicates' },
    body: JSON.stringify(doc),
  })
}

export async function deleteDoc(id) {
  await fetch(`${SUPABASE_URL}/rest/v1/belgeler?id=eq.${id}`, {
    method: 'DELETE',
    headers: HEADERS,
  })
}

export async function updateDoc(doc) {
  await fetch(`${SUPABASE_URL}/rest/v1/belgeler?id=eq.${doc.id}`, {
    method: 'PATCH',
    headers: HEADERS,
    body: JSON.stringify(doc),
  })
}

export function getApiKey() {
  return localStorage.getItem('ob_api_key') || ''
}

export function saveApiKey(key) {
  localStorage.setItem('ob_api_key', key)
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}