import { AskResponse } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8002'
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

export interface HistorialTurno {
  pregunta: string
  respuesta: string
}

export async function askQuestion(pregunta: string, historial?: HistorialTurno[]): Promise<AskResponse> {
  const response = await fetchWithTimeout(
    `${API_BASE_URL}/ask`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pregunta,
        ...(historial && historial.length > 0 ? { historial } : {}),
      }),
    },
    ASK_TIMEOUT
  )

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `El asistente respondio con error (${response.status})`)
  }

  return response.json()
}
