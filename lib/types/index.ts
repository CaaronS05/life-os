export type Role = {
  id: string
  name: string
  color: string
}

export type CalendarEvent = {
  id: string
  title: string
  start_time: string // format ISO string
  end_time: string   // format ISO string
  role_id?: string
  role?: Role        // relasi ke tabel role
}