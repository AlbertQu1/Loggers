import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stylo',
    short_name: 'Stylo',
    description: 'Tu estilista personal: tu clóset, outfits y compras inteligentes',
    start_url: '/closet',
    display: 'standalone',
    background_color: '#24201c',
    theme_color: '#24201c',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
