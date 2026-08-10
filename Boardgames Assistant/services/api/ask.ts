import { AskResponse, Juego } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
const ASK_TIMEOUT = 60000

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function askQuestion(pregunta: string, juego?: string): Promise<AskResponse> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/ask`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(juego ? { pregunta, juego } : { pregunta }),
    },
    ASK_TIMEOUT
  )

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `El asistente respondio con error (${response.status})`)
  }

  return response.json()
}

export async function getJuegos(): Promise<Juego[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/juegos`, {}, 10000)

  if (!response.ok) {
    throw new Error(`No se pudo obtener la lista de juegos (${response.status})`)
  }

  return response.json()
}

export async function getJuegosCatalogo(): Promise<string[]> {
  const response = await fetchWithTimeout(`${API_BASE_URL}/juegos/catalogo`, {}, 10000)

  if (!response.ok) {
    throw new Error(`No se pudo obtener el catalogo de juegos (${response.status})`)
  }

  return response.json()
}
