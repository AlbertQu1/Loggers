const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8002'

export interface DiarioResponse {
  nota: string
  chunks_indexados: number
  grafo?: { personas: string[]; evento: string | null; grupo_social: string | null }
  grafo_error?: string
}

export async function guardarEntradaDiario(texto: string): Promise<DiarioResponse> {
  const response = await fetch(`${API_BASE_URL}/diario`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo guardar la entrada (${response.status})`)
  }
  return response.json()
}
