'use client'

import { useState } from 'react'
import { createEvent } from '@/app/(dashboard)/calendar/actions'

interface EventFormProps {
  onClose: () => void
}

export default function EventForm({ onClose }: EventFormProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createEvent(formData)
      onClose() // Tutup modal jika sukses
    } catch (error) {
      alert('Gagal menyimpan event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h3 className="text-xl font-bold mb-4">Create New Event</h3>
        
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input name="title" required className="w-full border p-2 rounded-md mt-1" placeholder="PBO Assistant..." />
          </div>
          
          <div>
            <label className="text-sm font-medium">Date</label>
            <input name="date" type="date" required className="w-full border p-2 rounded-md mt-1" />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Start</label>
              <input name="start_time" type="time" required className="w-full border p-2 rounded-md mt-1" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">End</label>
              <input name="end_time" type="time" required className="w-full border p-2 rounded-md mt-1" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Location</label>
            <input name="location" className="w-full border p-2 rounded-md mt-1" placeholder="Lab Komputer..." />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50">
              {loading ? 'Saving...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}