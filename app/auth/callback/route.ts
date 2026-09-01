import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Jika ada kode dari Google, tukarkan dengan sesi Supabase
  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Jika berhasil, arahkan kembali ke kalender
      return NextResponse.redirect(`${origin}/calendar`)
    } else {
      console.error('Auth error:', error)
    }
  }

  // Jika gagal, kembalikan ke halaman login dengan pesan error
  return NextResponse.redirect(`${origin}/login?message=Gagal sinkronisasi Google`)
}