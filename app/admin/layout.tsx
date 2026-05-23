'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const supabase = createClient()
  const router = useRouter()

  // CHANGE THIS TO YOUR ACTUAL ADMIN EMAIL
  const ADMIN_EMAIL = 'admin@gmail.com' 

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user || user.email !== ADMIN_EMAIL) {
        // Not an admin? Kick them back to the marketplace
        router.push('/')
      } else {
        setIsAdmin(true)
      }
    }
    checkAdmin()
  }, [router, supabase.auth])

  if (isAdmin === null) return <div className="bg-black min-h-screen flex items-center justify-center font-mono text-blue-500 text-xs animate-pulse tracking-[0.5em]">SECURITY CHECK...</div>

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* SIDEBAR */}
      <div className="w-64 border-r border-zinc-800 p-6 flex flex-col gap-8 bg-black/50 backdrop-blur-xl sticky top-0 h-screen">
        <div className="px-4">
          <h2 className="text-white font-black italic tracking-tighter text-xl">MID_ADMIN</h2>
          <div className="w-8 h-1 bg-blue-600 mt-1"></div>
        </div>
        
        <nav className="flex flex-col gap-2">
          <a href="/admin" className="text-zinc-500 hover:text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-900 border border-transparent hover:border-zinc-800">
            Overview
          </a>
          <a href="/admin/moderation" className="text-zinc-500 hover:text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-900 border border-transparent hover:border-zinc-800">
            Moderation
          </a>
          <a href="/admin/trades" className="text-zinc-500 hover:text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-zinc-900 border border-transparent hover:border-zinc-800">
            Live Trades
          </a>
        </nav>

        <div className="mt-auto px-4">
          <button onClick={() => router.push('/')} className="text-red-500/50 hover:text-red-500 text-[9px] font-black uppercase tracking-widest transition-all">
            ← Exit System
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}