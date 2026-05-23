'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function LiveTradeMonitor() {
  const [trades, setTrades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchActiveTrades = async () => {
    // We fetch approved listings to see what's currently "on the board"
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (data) setTrades(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchActiveTrades()
  }, [supabase])

  const handleResolveTrade = async (tradeId: string) => {
    const confirmFinalize = window.confirm(
      "CONFIRM_RESOLUTION: This action will permanently remove the listing and all associated chat logs. Proceed?"
    )
    
    if (!confirmFinalize) return

    try {
      // 1. Remove the listing from the marketplace
      const { error: listingError } = await supabase
        .from('listings')
        .delete()
        .eq('id', tradeId)

      if (listingError) throw listingError

      // 2. Clear all messages associated with this trade to keep DB clean
      const { error: msgError } = await supabase
        .from('messages')
        .delete()
        .eq('trade_id', tradeId)

      if (msgError) throw msgError

      alert("RESOLUTION_COMPLETE: Asset removed from mesh.")
      fetchActiveTrades() // Refresh the list
    } catch (err) {
      console.error(err)
      alert("CRITICAL_ERROR: Failed to resolve session.")
    }
  }

  if (loading) return <div className="p-10 font-mono text-blue-500 animate-pulse uppercase text-xs">Synchronizing Trade Uplink...</div>

  return (
    <div className="p-8 min-h-screen bg-black">
      <header className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-white text-3xl font-black italic uppercase tracking-tighter text-blue-600 leading-none">Live_Trade_Monitor</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">
            Monitoring {trades.length} active sessions // System_Auth: Level_01
          </p>
        </div>
        <Link href="/admin" className="text-zinc-600 hover:text-white text-[9px] font-black uppercase tracking-widest border-b border-zinc-800 pb-1 transition-all">
          ← Return_to_Command
        </Link>
      </header>

      <div className="grid gap-4">
        {trades.length === 0 ? (
          <div className="py-20 border border-dashed border-zinc-900 rounded-3xl text-center text-zinc-800 font-black uppercase italic tracking-widest">
            No active trades detected in the sector.
          </div>
        ) : (
          trades.map((trade) => (
            <div key={trade.id} className="bg-zinc-900/20 border border-zinc-800/50 p-6 rounded-3xl flex items-center justify-between group hover:border-zinc-700 transition-all backdrop-blur-sm">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-black rounded-2xl overflow-hidden border border-zinc-800 p-2 group-hover:border-blue-500/50 transition-colors">
                  <img src={trade.image_url} className="w-full h-full object-contain grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" alt="" />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase italic tracking-tight text-xl">{trade.item_name}</h3>
                  <div className="flex gap-6 mt-2 text-[9px] font-bold uppercase tracking-widest">
                    <div className="flex flex-col">
                      <span className="text-zinc-600 mb-1">ORIGIN_NODE</span>
                      <span className="text-zinc-400 font-mono">{trade.owner_id.slice(0, 12)}...</span>
                    </div>
                    <div className="flex flex-col border-l border-zinc-800 pl-6">
                      <span className="text-zinc-600 mb-1">TARGET_ASSET</span>
                      <span className="text-green-500">{trade.looking_for}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  href={`/trade/${trade.id}`} 
                  className="bg-zinc-800 text-zinc-300 px-6 py-4 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white hover:text-black transition-all active:scale-95 border border-zinc-700"
                >
                  Inspect_Room
                </Link>
                
                {/* NEW: RESOLVE & CLOSE BUTTON */}
                <button 
                  onClick={() => handleResolveTrade(trade.id)}
                  className="bg-blue-600 text-white px-6 py-4 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-green-600 transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-green-500/20"
                >
                  Resolve_&_Archive
                </button>

                <button 
                  onClick={() => handleResolveTrade(trade.id)} // Reusing logic for trash icon
                  className="p-4 text-zinc-700 hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-xl"
                  title="Force Terminate"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-12 p-6 border-t border-zinc-900 flex justify-between items-center opacity-30">
         <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.5em]">MidTrade_Shield_Enabled</span>
         <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.5em]">Hardware_ID: Logged</span>
      </div>
    </div>
  )
}