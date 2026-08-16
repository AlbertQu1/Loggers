import { PersonaPendiente, Persona, PersonaInput, PersonaUpdate, Cumpleanos } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8002'

export async function getPersonas(): Promise<Persona[]> {
  const response = await fetch(`${API_BASE_URL}/personas`)
  if (!response.ok) throw new Error(`No se pudo cargar el catalogo de personas (${response.status})`)
  return response.json()
}

export async function crearPersona(datos: PersonaInput): Promise<Persona> {
  const response = await fetch(`${API_BASE_URL}/personas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo crear la persona (${response.status})`)
  }
  return response.json()
}

export async function actualizarPersona(id: number, datos: PersonaUpdate): Promise<Persona> {
  const response = await fetch(`${API_BASE_URL}/personas/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo actualizar (${response.status})`)
  }
  return response.json()
}

export async function getCumpleanos(): Promise<Cumpleanos[]> {
  const response = await fetch(`${API_BASE_URL}/personas/cumpleanos`)
  if (!response.ok) throw new Error(`No se pudo cargar los cumpleanos (${response.status})`)
  return response.json()
}

export async function getPersonasPendientes(): Promise<PersonaPendiente[]> {
  const response = await fetch(`${API_BASE_URL}/personas/pendientes`)
  if (!response.ok) throw new Error(`No se pudo cargar la lista de personas pendientes (${response.status})`)
  return response.json()
}

export async function confirmarPersonaPendiente(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/personas/pendientes/${id}/confirmar`, { method: 'POST' })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo confirmar (${response.status})`)
  }
}

export async function rechazarPersonaPendiente(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/personas/pendientes/${id}/rechazar`, { method: 'POST' })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `No se pudo rechazar (${response.status})`)
  }
}
