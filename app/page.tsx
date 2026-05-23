'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  // CONFIGURATION
  const ADMIN_EMAIL = 'admin@gmail.com'

  useEffect(() => {
    const getData = async () => {
      try {
        const { data: authData } = await supabase.auth.getUser()
        setUser(authData?.user || null)
        
        // Fetch only items that have been approved by the admin
        const { data: itemData } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'approved')
        
        if (itemData) setItems(itemData)
      } catch (error) {
        console.error("Initialization error:", error)
      } finally {
        setLoading(false)
      }
    }
    getData()
  }, [supabase])

  // UPDATED LOGOUT: Redirects to this main page and refreshes to show the landing screen
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/') 
    router.refresh()
  }

  // 1. LOADING STATE
  if (loading) {
    return (
      <div className="bg-black text-white h-screen flex flex-col items-center justify-center font-mono">
        <div className="uppercase tracking-[0.5em] animate-pulse text-xs">
          Initializing MidTrade...
        </div>
      </div>
    )
  }

  // 2. MAIN LANDING PAGE (Shown when logged out)
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-6 text-center">
        <h1 className="text-8xl font-black mb-4 italic tracking-tighter text-blue-600 animate-in fade-in zoom-in duration-700">
          MIDTRADE
        </h1>
        <p className="mb-10 text-zinc-500 max-w-sm uppercase text-[10px] tracking-[0.5em] font-bold">
          The most secure way to swap skins.
        </p>
        
        <Link 
          href="/login" 
          className="bg-white text-black px-16 py-4 rounded-full font-black uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_50px_rgba(37,99,235,0.3)] active:scale-95"
        >
          Sign In / Register
        </Link>
      </div>
    )
  }

  // 3. AVAILABLE TRADES DASHBOARD (Shown when logged in)
  return (
    <div className="p-8 bg-black min-h-screen text-white font-sans">
      <header className="flex justify-between items-center mb-10 border-b border-zinc-900 pb-8">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Available_Trades</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">
            Logged in as: <span className="text-zinc-300">{user.email}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Admin Panel Link: Case-insensitive check */}
          {user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() && (
            <Link href="/admin" className="text-blue-500 hover:text-blue-400 text-[10px] font-black uppercase tracking-widest border-r border-zinc-800 pr-6 transition-colors">
              Admin_Panel
            </Link>
          )}

          <Link href="/dashboard" className="text-zinc-400 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
            My_Inventory
          </Link>

          <Link href="/post" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95">
            + Post Item
          </Link>
          
          <button 
            onClick={handleLogout} 
            className="text-zinc-600 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.length === 0 ? (
          <div className="col-span-full py-32 text-center border border-dashed border-zinc-900 rounded-3xl bg-zinc-950/50">
            <p className="text-zinc-700 font-black uppercase italic tracking-widest">Sector Empty // No items authorized</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="bg-zinc-900/20 border border-zinc-800/50 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
              <div className="relative aspect-video overflow-hidden bg-black flex items-center justify-center p-6">
                <img 
                  src={item.image_url} 
                  alt={item.item_name} 
                  /* Static and colorful: grayscale and hover-zoom removed */
                  className="w-full h-full object-contain" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent pointer-events-none" />
              </div>
              
              <div className="p-5 border-t border-zinc-800/50">
                <h3 className="text-xl font-black italic uppercase tracking-tighter mb-1 text-zinc-100">{item.item_name}</h3>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[8px] bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded font-black tracking-widest uppercase">Target</span>
                  <p className="text-[10px] text-green-500 uppercase font-black tracking-widest leading-none">
                    {item.looking_for}
                  </p>
                </div>
                
                <Link href={`/trade/${item.id}`}>
                  <button className="w-full bg-white text-black py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-lg">
                    Initialize_Trade
                  </button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
      
      <footer className="mt-20 border-t border-zinc-900 pt-8 pb-12 flex justify-center opacity-20">
        <p className="text-[8px] font-black uppercase tracking-[0.8em]">Secure_Encryption_Protocol_Active</p>
      </footer>
    </div>
  )
}