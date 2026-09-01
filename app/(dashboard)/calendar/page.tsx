import CalendarView from '@/components/calendar/CalendarView'
import { createClient } from '@/lib/supabase/server'

export default async function CalendarPage() {
  const supabase = await createClient()

  // Tarik data khusus 'event' milik user yang sedang login
  const { data: items, error } = await supabase
    .from('items')
    .select('*')
    .eq('type', 'event')

  if (error) {
    console.error('Error fetching events:', error)
  }

  // Petakan data dari database ke format yang diminta oleh CalendarView
  const events = items?.map((item) => ({
    id: item.id,
    title: item.title,
    start_time: item.metadata?.start_time,
    end_time: item.metadata?.end_time,
  })) || []

  const dummyRoles: any[] = [] // Kita biarkan kosong dulu sampai modul Roles dibuat

  return (
    <div className="h-full">
      <CalendarView initialEvents={events} roles={dummyRoles} />
    </div>
  )
}