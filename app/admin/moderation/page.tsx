'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function ModerationChamber() {
  const [pendingItems, setPendingItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchPending = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (data) setPendingItems(data)
    setLoading(false)
  }

  useEffect(() => { fetchPending() }, [])

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('listings')
      .update({ status })
      .eq('id', id)

    if (!error) {
      setPendingItems(prev => prev.filter(item => item.id !== id))
    }
  }

  if (loading) return <div className="p-10 font-mono text-blue-500 animate-pulse uppercase text-xs">Accessing Pending Assets...</div>

  return (
    <div className="p-8">
      <header className="mb-10">
        <h1 className="text-white text-3xl font-black italic uppercase tracking-tighter">Moderation_Chamber</h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Reviewing {pendingItems.length} items</p>
      </header>

      {pendingItems.length === 0 ? (
        <div className="py-20 border-2 border-dashed border-zinc-900 rounded-3xl text-center text-zinc-700 font-black uppercase italic">
          No assets require attention.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingItems.map((item) => (
            <div key={item.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col group hover:border-blue-900/50 transition-all">
              <div className="aspect-video relative overflow-hidden bg-black">
                <img src={item.image_url} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500" />
              </div>
              
              <div className="p-5 flex-grow">
                <h3 className="text-white font-black italic uppercase tracking-tight text-xl mb-1">{item.item_name}</h3>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Target: <span className="text-green-500">{item.looking_for}</span></p>
              </div>

              <div className="p-4 bg-black/40 border-t border-zinc-800 grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleAction(item.id, 'approved')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-[10px] py-3 rounded-xl shadow-lg shadow-blue-500/10 transition-all active:scale-95"
                >
                  Authorize
                </button>
                <button 
                  onClick={() => handleAction(item.id, 'rejected')}
                  className="bg-zinc-800 hover:bg-red-900 text-zinc-500 hover:text-white font-black uppercase text-[10px] py-3 rounded-xl transition-all active:scale-95"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}