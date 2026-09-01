import { login, signup } from './actions'

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50 text-black">
      <form className="flex w-full max-w-sm flex-col justify-center gap-4 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-center mb-4">Life OS</h1>
        
        <label className="text-sm font-medium" htmlFor="email">Email</label>
        <input
          className="rounded-md border border-gray-300 px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-black"
          name="email"
          type="email"
          placeholder="aaron@example.com"
          required
        />
        
        <label className="text-sm font-medium" htmlFor="password">Password</label>
        <input
          className="rounded-md border border-gray-300 px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
          type="password"
          name="password"
          placeholder="••••••••"
          required
        />
        
        <button formAction={login} className="bg-black text-white rounded-md px-4 py-2 font-medium hover:bg-gray-800 transition">
          Log In
        </button>
        <button formAction={signup} className="border border-black text-black rounded-md px-4 py-2 font-medium hover:bg-gray-100 transition">
          Sign Up
        </button>

        {searchParams?.message && (
          <p className="mt-4 p-3 bg-red-50 text-red-600 text-center text-sm rounded-md border border-red-200">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}