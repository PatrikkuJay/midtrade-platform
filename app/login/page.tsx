'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()
  const supabase = createClient()

  // YOUR ADMIN EMAIL
  const ADMIN_EMAIL = 'admin@gmail.com'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else if (data.user) {
      // REDIRECT LOGIC
      // Use .toLowerCase() to ensure it matches regardless of typing style
      if (data.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        router.push('/admin')
      } else {
        router.push('/') // Normal users go to the marketplace
      }
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900/30 border border-zinc-800 p-10 rounded-3xl backdrop-blur-md">
        <h1 className="text-4xl font-black italic tracking-tighter text-blue-600 mb-8 uppercase text-center">
          Authorize_Access
        </h1>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="EMAIL_ADDRESS" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-all"
          />
          <input 
            type="password" 
            placeholder="PASSWORD_SECRET" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-all"
          />
          <button 
            type="submit"
            className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 mt-4"
          >
            Authenticate_Session
          </button>
        </form>
      </div>
    </div>
  )
}