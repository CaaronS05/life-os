'use client'

import { useState } from 'react'
import { CalendarEvent, Role } from '@/lib/types'
import CapacityBar from './CapacityBar'
import EventForm from './EventForm'
import { deleteEvent, syncGoogleEvents } from '@/app/(dashboard)/calendar/actions'
import { createClient } from '@/lib/supabase/client'


interface CalendarViewProps {
  initialEvents: CalendarEvent[]
  roles: Role[]
}

export default function CalendarView({ initialEvents, roles }: CalendarViewProps) {
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  
  const dummyScheduled = 6.5
  const dummyCapacity = 8
  
  const supabase = createClient()
  

  // Fungsi baru untuk dipanggil langsung di client
  async function handleGoogleSync() {
    const { error } = await supabase.auth.signInWithOAuth({
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

    if (error) {
      alert('Gagal inisiasi Google OAuth')
    }
  }

  async function handleFetchGoogle() {
    setIsSyncing(true)
    try {
      await syncGoogleEvents()
      alert('Berhasil menarik data dari Google Calendar!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus event ini?')) return
    setIsDeleting(id)
    try {
      await deleteEvent(id)
    } catch (error) {
      alert('Gagal menghapus event')
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Calendar</h2>
        
        <div className="flex gap-4">
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button onClick={() => setView('day')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'day' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-black'}`}>Day</button>
            <button onClick={() => setView('week')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'week' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-black'}`}>Week</button>
            <button onClick={() => setView('month')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${view === 'month' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-black'}`}>Month</button>
          </div>

          <button 
    onClick={handleGoogleSync} 
    className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
  >
    Sync Google
  </button>

  <button 
    onClick={handleFetchGoogle}
    disabled={isSyncing}
    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition"
  >
    {isSyncing ? 'Menarik data...' : 'Get Events'}
  </button>
          
          <button 
            onClick={() => setIsFormOpen(true)}
            className="bg-black text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
          >
            + New Event
          </button>
        </div>
      </div>

      

      <CapacityBar scheduledHours={dummyScheduled} capacityHours={dummyCapacity} />
      
      {/* Area List Event Sementara */}
      <div className="flex-1 border border-gray-200 rounded-xl bg-white p-8">
        <h3 className="font-semibold mb-4 border-b pb-2">Jadwal (List Sementara)</h3>
        
        {initialEvents.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">Belum ada event yang dibuat.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {initialEvents.map((event) => (
              <div key={event.id} className="flex justify-between items-center p-4 border rounded-lg bg-gray-50 hover:bg-white transition">
                <div>
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {event.start_time ? new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'} - 
                    {event.end_time ? new Date(event.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Unknown'}
                  </p>
                </div>
                
                <button 
                  onClick={() => handleDelete(event.id)}
                  disabled={isDeleting === event.id}
                  className="text-red-600 text-sm font-medium hover:underline disabled:opacity-50"
                >
                  {isDeleting === event.id ? 'Deleting...' : 'Delete'}
                </button>

                
              </div>
            ))}
          </div>
        )}
      </div>

      {isFormOpen && <EventForm onClose={() => setIsFormOpen(false)} />}
    </div>
  )
}