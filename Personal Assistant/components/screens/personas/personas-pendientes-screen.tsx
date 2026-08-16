'use client'

import { useEffect, useState } from 'react'
import { UserCheck, Check, X } from 'lucide-react'
import { PersonaPendiente } from '@/types'
import { getPersonasPendientes, confirmarPersonaPendiente, rechazarPersonaPendiente } from '@/services/api/personas'
import { showToast } from '@/components/common/toast-notifications'

const ORIGEN_LABELS: Record<string, string> = {
  jugador_directo: 'tu roster de juegos de mesa',
}

export function PersonasPendientesScreen() {
  const [pendientes, setPendientes] = useState<PersonaPendiente[]>([])
  const [procesando, setProcesando] = useState<number | null>(null)

  function cargar() {
    getPersonasPendientes().catch(() => []).then(setPendientes)
  }

  useEffect(() => {
    cargar()
  }, [])

  async function handleConfirmar(id: number) {
    setProcesando(id)
    try {
      await confirmarPersonaPendiente(id)
      showToast('✓ Confirmado — se agregó como alias', 'success')
      cargar()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo confirmar', 'error')
    } finally {
      setProcesando(null)
    }
  }

  async function handleRechazar(id: number) {
    setProcesando(id)
    try {
      await rechazarPersonaPendiente(id)
      showToast('Descartado', 'info')
      cargar()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'No se pudo descartar', 'error')
    } finally {
      setProcesando(null)
    }
  }

  return (
    <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-4">
      {pendientes.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center mt-8">
          No hay nombres esperando confirmación. Cuando una nota mencione a alguien con un posible match en tu
          roster, aparecerá aquí.
        </p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Nombres mencionados en tus notas que podrían ser la misma persona que alguien ya conocido — confirma
            o descarta.
          </p>
          {pendientes.map((p) => (
            <div key={p.id} className="rounded-lg border bg-card p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <UserCheck className="w-5 h-5 mt-0.5 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    Mencionaste a <span className="font-semibold">&quot;{p.nombre_mencionado}&quot;</span> — ¿es{' '}
                    <span className="font-semibold">{p.candidato_nombre}</span>
                    {p.candidato_grupo_social && ` (grupo ${p.candidato_grupo_social})`}?
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Candidato de {ORIGEN_LABELS[p.candidato_origen ?? ''] ?? p.candidato_origen}
                    {p.similitud !== null && ` · similitud ${(p.similitud * 100).toFixed(0)}%`}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">Nota: {p.nota_source}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleConfirmar(p.id)}
                  disabled={procesando === p.id}
                  className="flex-1 rounded-full bg-primary text-primary-foreground py-2 text-sm flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <Check className="w-4 h-4" /> Sí, es la misma
                </button>
                <button
                  onClick={() => handleRechazar(p.id)}
                  disabled={procesando === p.id}
                  className="flex-1 rounded-full border py-2 text-sm flex items-center justify-center gap-1 disabled:opacity-40"
                >
                  <X className="w-4 h-4" /> No, es otra
                </button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
