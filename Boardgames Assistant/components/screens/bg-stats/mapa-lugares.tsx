'use client'

import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { TopLugar } from '@/services/api/bgstats'

function iconoPara(partidas: number, max: number) {
  const escala = Math.max(0.5, Math.min(1, partidas / max))
  const size = Math.round(14 + escala * 18)
  return L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:9999px;background:var(--primary, #6366f1);border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  })
}

function AjustarVista({ puntos }: { puntos: [number, number][] }) {
  const map = useMap()
  useEffect(() => {
    if (puntos.length === 0) return
    if (puntos.length === 1) {
      map.setView(puntos[0], 12)
      return
    }
    map.fitBounds(puntos, { padding: [24, 24] })
  }, [map, puntos])
  return null
}

export function MapaLugares({ items }: { items: TopLugar[] }) {
  const conGeo = useMemo(() => items.filter((l) => l.lat != null && l.lon != null), [items])
  const puntos = useMemo<[number, number][]>(
    () => conGeo.map((l) => [l.lat as number, l.lon as number]),
    [conGeo]
  )
  const maxPartidas = Math.max(...conGeo.map((l) => l.partidas), 1)

  if (conGeo.length === 0) return null

  return (
    <div className="rounded-lg overflow-hidden border h-64 mb-3">
      <MapContainer center={puntos[0]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AjustarVista puntos={puntos} />
        {conGeo.map((l) => (
          <Marker key={l.lugar} position={[l.lat as number, l.lon as number]} icon={iconoPara(l.partidas, maxPartidas)}>
            <Popup>
              <span className="font-medium">{l.lugar}</span>
              <br />
              {l.partidas} partidas
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
