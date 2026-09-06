import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans } from 'next/font/google'
import './globals.css'

const serif = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-serif-local', weight: ['400', '500', '600'], style: ['normal', 'italic'] })
const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans-local', weight: ['400', '500', '600'] })

export const metadata: Metadata = {
  title: 'Foja Cero · Estudio jurídico',
  description: 'Foja Cero | Yamila Luján Isoardi, abogada. Asesoramiento jurídico. Conocé su formación, especialidades y solicitá una consulta.',
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f3f0e9',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR" className={`${serif.variable} ${sans.variable}`}><body>{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
