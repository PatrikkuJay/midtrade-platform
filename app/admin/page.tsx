'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalItems: 0, pendingItems: 0, activeTrades: 0 })
  const [recentLogs, setRecentLogs] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function getStats() {
      // 1. Get Total Listings
      const { count: items } = await supabase.from('listings').select('*', { count: 'exact', head: true })
      
      // 2. Get Pending Moderation
      const { count: pending } = await supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      
      // 3. Get Active Trades (In our case, listings that have messages in them)
      const { data: messages } = await supabase.from('messages').select('trade_id')
      const uniqueTradeIds = new Set(messages?.map(m => m.trade_id))

      setStats({
        totalItems: items || 0,
        pendingItems: pending || 0,
        activeTrades: uniqueTradeIds.size || 0 
      })

      // 4. Fetch real recent activity from listings
      const { data: latest } = await supabase.from('listings').select('*').order('created_at', { ascending: false }).limit(5)
      if (latest) setRecentLogs(latest)
    }

    getStats()
    
    // Optional: Set up a refresh interval every 30 seconds
    const interval = setInterval(getStats, 30000)
    return () => clearInterval(interval)
  }, [supabase])

  return (
    <div className="min-h-screen bg-black p-4 md:p-12 font-sans text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
              System_Command <span className="text-blue-600">v1.1</span>
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em] mt-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" /> 
              Satellite_Link: Stable // Monitoring_Active
            </p>
          </div>
          <div className="flex gap-2">
             <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400">
                Admin_Auth: Verified
             </div>
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] relative overflow-hidden group hover:border-zinc-700 transition-all">
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Market_Volume</p>
            <h2 className="text-6xl font-black italic tracking-tighter">{stats.totalItems}</h2>
            <div className="absolute -bottom-4 -right-4 text-zinc-800 opacity-20 text-8xl font-black italic select-none">DATA</div>
          </div>

          <div className="bg-zinc-900/40 border border-blue-600/20 p-8 rounded-[2rem] relative overflow-hidden group hover:border-blue-600/40 transition-all">
            <div className="absolute top-6 right-8 text-blue-500 font-black text-[9px] tracking-widest flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              ACTION_REQUIRED
            </div>
            <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Pending_Moderation</p>
            <h2 className="text-6xl font-black italic tracking-tighter text-blue-500">{stats.pendingItems}</h2>
          </div>

          <div className="bg-zinc-900/40 border border-zinc-800 p-8 rounded-[2rem] relative overflow-hidden group">
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Active_Encounters</p>
            <h2 className="text-6xl font-black italic tracking-tighter">{stats.activeTrades}</h2>
             <div className="absolute -bottom-4 -right-4 text-zinc-800 opacity-20 text-8xl font-black italic select-none">LIVE</div>
          </div>
        </div>

        {/* BOTTOM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ACTIVITY LOG (Taking up 2 columns) */}
          <div className="lg:col-span-2 bg-zinc-900/20 border border-zinc-800/50 rounded-[2rem] p-8 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-zinc-400 font-black uppercase text-xs tracking-[0.2em] italic">Network_Activity_Log</h3>
              <span className="text-[9px] text-zinc-600 font-mono italic">Showing last 5 events</span>
            </div>
            
            <div className="space-y-3">
              {recentLogs.length > 0 ? recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between gap-4 text-[11px] font-mono p-4 bg-zinc-900/50 border border-zinc-800/30 rounded-xl hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="text-green-500 font-black">[ASSET_NEW]</span>
                    <span className="text-zinc-300 uppercase tracking-tighter font-bold">{log.item_name}</span>
                  </div>
                  <span className="text-zinc-600 text-[9px]">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
              )) : (
                <div className="text-zinc-700 font-mono text-[10px] uppercase text-center py-10 tracking-widest">
                  No recent activity detected on the mesh
                </div>
              )}
            </div>
          </div>

          {/* COMMAND INPUTS */}
          <div className="flex flex-col gap-4">
            <h3 className="text-zinc-400 font-black uppercase text-xs tracking-[0.2em] italic mb-2 ml-2">Direct_Access</h3>
            
            <Link href="/admin/moderation" className="group relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600 group-hover:bg-blue-500 transition-colors" />
              <div className="relative p-8 flex flex-col gap-2">
                <span className="text-[10px] font-black tracking-widest opacity-60">PHASE_01</span>
                <span className="text-xl font-black uppercase italic tracking-tighter">Enter_Moderation</span>
              </div>
            </Link>

            <Link href="/admin/trades" className="group relative overflow-hidden border border-zinc-800 hover:border-blue-600 transition-all">
              <div className="p-8 flex flex-col gap-2 bg-black group-hover:bg-zinc-900 transition-colors">
                <span className="text-[10px] font-black tracking-widest opacity-40 text-blue-500">PHASE_02</span>
                <span className="text-xl font-black uppercase italic tracking-tighter text-zinc-400 group-hover:text-white transition-colors">Monitor_Trades</span>
              </div>
            </Link>

            <div className="mt-auto p-6 bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl">
              <p className="text-[9px] text-zinc-500 leading-relaxed font-bold uppercase tracking-tighter">
                NOTICE: All administrative actions are logged and tied to your hardware ID. Unauthorized access is strictly prohibited.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}