'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEvent(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const date = formData.get('date') as string
  const startTime = formData.get('start_time') as string
  const endTime = formData.get('end_time') as string
  const location = formData.get('location') as string

  // Menggabungkan tanggal dan waktu menjadi format ISO
  const startIso = new Date(`${date}T${startTime}`).toISOString()
  const endIso = new Date(`${date}T${endTime}`).toISOString()

  // Menyusun struktur data sesuai skema JSONB Life OS
  const metadata = {
    start_time: startIso,
    end_time: endIso,
    source: 'manual',
    location: location || '',
  }

  const { error } = await supabase.from('items').insert({
    user_id: user.id,
    type: 'event',
    title: title,
    metadata: metadata,
  })

  if (error) {
    console.error('Insert error:', error)
    throw new Error('Gagal membuat event')
  }

  // Refresh data di halaman calendar setelah berhasil insert
  revalidatePath('/calendar')
}

export async function deleteEvent(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Pengaman ganda selain RLS

  if (error) {
    console.error('Delete error:', error)
    throw new Error('Gagal menghapus event')
  }

  revalidatePath('/calendar')
}

export async function connectGoogleCalendar() {
  const supabase = await createClient()
  
  // Meminta Google memberikan akses read-only ke Calendar beserta offline access untuk dapat refresh token
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/calendar.readonly',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) throw new Error('Gagal inisiasi Google OAuth')
  
  if (data.url) {
    redirect(data.url)
  }
}

export async function syncGoogleEvents() {
  const supabase = await createClient()
  
  // Ambil sesi user saat ini (yang mengandung token akses Google)
  const { data: { session } } = await supabase.auth.getSession()

  if (!session || !session.provider_token) {
    throw new Error('Token Google tidak ditemukan. Silakan klik Sync Google lagi.')
  }

  // Panggil Google Calendar API (Ambil 10 event ke depan mulai dari hari ini)
  const timeMin = new Date().toISOString()
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=10`,
    {
      headers: {
        Authorization: `Bearer ${session.provider_token}`
      }
    }
  )

  if (!res.ok) {
    console.error('API Error:', await res.text())
    throw new Error('Gagal mengambil data dari Google Calendar API')
  }

  const googleData = await res.json()
  const events = googleData.items || []

  // Looping data dari Google dan simpan ke tabel 'items' kita
  for (const item of events) {
    // Kita lewati event seharian penuh (all-day event) untuk MVP ini
    if (!item.start?.dateTime || !item.end?.dateTime) continue

    const metadata = {
      start_time: item.start.dateTime,
      end_time: item.end.dateTime,
      source: 'google',
      google_id: item.id, // Sebagai penanda ini dari Google
      location: item.location || '',
    }

    // Insert ke Supabase
    const { error } = await supabase.from('items').insert({
      user_id: session.user.id,
      type: 'event',
      title: item.summary || 'Untitled Google Event',
      metadata: metadata
    })
    
    if (error) console.error('Gagal insert event Google:', error.message)
  }

  // Refresh halaman agar data baru langsung muncul
  revalidatePath('/calendar')
}