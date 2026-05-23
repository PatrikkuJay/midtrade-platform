'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function UserDashboard() {
  const [myItems, setMyItems] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: items } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', user.id) // Only get items belonging to the logged-in user
        .order('created_at', { ascending: false })

      if (items) setMyItems(items)
      setLoading(false)
    }
    loadUserData()
  }, [router, supabase])

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-mono text-xs text-zinc-500 animate-pulse uppercase tracking-[0.4em]">Loading_User_Data...</div>

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-end mb-12 border-b border-zinc-900 pb-8">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">My_Inventory</h1>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Active session: {user?.email}</p>
          </div>
          <button onClick={() => router.push('/')} className="text-zinc-500 hover:text-white text-[10px] font-black uppercase border border-zinc-800 px-4 py-2 rounded-lg transition-all">← Back to Market</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myItems.length === 0 ? (
            <div className="col-span-2 py-20 border-2 border-dashed border-zinc-900 rounded-3xl text-center">
              <p className="text-zinc-700 font-black uppercase italic">You haven't listed any assets yet.</p>
            </div>
          ) : (
            myItems.map((item) => (
              <div key={item.id} className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col group">
                <div className="aspect-video relative bg-black/50">
                  <img src={item.image_url} className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105 duration-500" alt="" />
                  
                  {/* STATUS BADGE */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl border ${
                      item.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      item.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-black italic uppercase tracking-tight mb-1">{item.item_name}</h3>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Targeting: <span className="text-blue-500">{item.looking_for}</span></p>
                  
                  <div className="mt-6 flex gap-3">
                    {item.status === 'approved' && (
                      <button 
                        onClick={() => router.push(`/trade/${item.id}`)}
                        className="flex-1 bg-white text-black py-3 rounded-xl font-black uppercase text-[10px] hover:bg-blue-600 hover:text-white transition-all"
                      >
                        Enter Trade Room
                      </button>
                    )}
                    <button className="px-4 py-3 border border-zinc-800 rounded-xl text-zinc-500 hover:text-red-500 hover:border-red-900/30 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}