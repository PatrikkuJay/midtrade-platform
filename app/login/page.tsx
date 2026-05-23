'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false) // NEW: State to track mode
  const router = useRouter()
  const supabase = createClient()

  // YOUR ADMIN EMAIL
  const ADMIN_EMAIL = 'admin@gmail.com'

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    let authError = null;
    let authData = null;

    if (isSignUp) {
      // REGISTER NEW USER
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      authData = data;
      authError = error;
    } else {
      // LOG IN EXISTING USER
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      authData = data;
      authError = error;
    }

    if (authError) {
      alert(authError.message)
    } else if (authData.user) {
      // REDIRECT LOGIC
      if (authData.user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
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
          {isSignUp ? 'Initialize_Node' : 'Authorize_Access'}
        </h1>
        
        <form onSubmit={handleAuth} className="space-y-4">
          <input 
            type="email" 
            placeholder="EMAIL_ADDRESS" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-all"
            required
          />
          <input 
            type="password" 
            placeholder="PASSWORD_SECRET" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-xs font-mono text-white focus:outline-none focus:border-blue-500 transition-all"
            required
          />
          
          <button 
            type="submit"
            className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-blue-600 hover:text-white transition-all active:scale-95 mt-4"
          >
            {isSignUp ? 'Register_Credentials' : 'Authenticate_Session'}
          </button>
        </form>

        {/* NEW: TOGGLE BUTTON */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[9px] font-mono text-zinc-500 hover:text-white transition-colors uppercase tracking-widest"
          >
            {isSignUp 
              ? '[ RETURN_TO_LOGIN ]' 
              : '[ INITIATE_NEW_USER_PROTOCOL ]'}
          </button>
        </div>

      </div>
    </div>
  )
}
