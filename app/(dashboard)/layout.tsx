import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  // Proteksi rute: cek user yang sedang aktif
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Server action untuk logout
  async function signOut() {
    'use server'
    const supabaseClient = await createClient()
    await supabaseClient.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar Shell */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold tracking-tight">Life OS</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/calendar" className="block px-4 py-2 bg-gray-100 text-black rounded-lg font-medium">
            Calendar
          </Link>
          <Link href="/settings" className="block px-4 py-2 text-gray-500 hover:bg-gray-50 rounded-lg font-medium transition">
            Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <form action={signOut}>
            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition">
              Log out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 flex justify-end shrink-0">
          <div className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            {user.email}
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}