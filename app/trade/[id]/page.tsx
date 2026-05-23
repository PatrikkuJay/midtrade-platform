'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase'
import { useParams, useRouter } from 'next/navigation'

interface Listing {
  id: string;
  item_name: string;
  image_url: string;
  looking_for: string;
  owner_id: string;
}

export default function TradeRoom() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const router = useRouter()
  
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [visibleSystemMsgs, setVisibleSystemMsgs] = useState<Record<string, boolean>>({})
  const [escrowActive, setEscrowActive] = useState(false)
  
  const timerRefs = useRef<Record<string, boolean>>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // MATCHING YOUR ADMIN CONFIGURATION
  const ADMIN_EMAIL = 'admin@gmail.com'

  const startSystemTimer = (msgId: string) => {
    if (timerRefs.current[msgId]) return;
    timerRefs.current[msgId] = true;
    setVisibleSystemMsgs(prev => ({ ...prev, [msgId]: true }));
    setTimeout(() => {
      setVisibleSystemMsgs(prev => ({ ...prev, [msgId]: false }));
    }, 7000); 
  }

  useEffect(() => {
    let isMounted = true;
    async function setupRoom() {
      if (!id) return
      const { data: { user: activeUser } } = await supabase.auth.getUser()
      const { data: itemData } = await supabase.from('listings').select('*').eq('id', id).maybeSingle()
      
      if (isMounted && itemData) {
        setListing(itemData)
        setUser(activeUser)

        const { data: initialMsgs } = await supabase
          .from('messages')
          .select('*')
          .eq('trade_id', id)
          .order('created_at', { ascending: true })
        
        if (initialMsgs) {
          const hasEscrow = initialMsgs.some(m => m.sender_email === 'SYSTEM' && m.content.includes('ESCROW'))
          if (hasEscrow) setEscrowActive(true)
          setMessages(initialMsgs)
        }
        setLoading(false)
      }
    }
    setupRoom()

    // REAL-TIME: Listen for INSERT and DELETE
    const channel = supabase
      .channel(`trade_${id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages', 
        filter: `trade_id=eq.${id}` 
      }, 
      (payload) => {
        if (!isMounted) return
        
        if (payload.eventType === 'INSERT') {
          const newMsg = payload.new
          setMessages((current) => {
            const exists = current.find(m => m.id === newMsg.id)
            if (exists) return current;
            if (newMsg.sender_email === 'SYSTEM') {
              startSystemTimer(newMsg.id)
              if (newMsg.content.includes('ESCROW')) setEscrowActive(true)
            }
            return [...current, newMsg]
          })
        } else if (payload.eventType === 'DELETE') {
          setMessages([]) // Clear UI globally when rows are deleted
        }
      })
      .subscribe()

    return () => { isMounted = false; supabase.removeChannel(channel) }
  }, [id, supabase])

  // SMART SCROLL
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const threshold = 100; 
    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + threshold;
    if (isAtBottom) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, visibleSystemMsgs]);

  // PURGE LOGIC
  const clearChat = async () => {
    // Safety check: even without RLS, don't let the function run if not admin
    if (!id || user?.email !== ADMIN_EMAIL) {
      alert("UNAUTHORIZED: Admin credentials required.");
      return;
    }
    
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('trade_id', id);

    if (error) {
      console.error("Purge error:", error);
    }
  };

  const initializeEscrow = async () => {
    if (!user || !listing || !id) return
    const systemContent = `⚠️ SECURE ESCROW INITIALIZED BY ${user.email.split('@')[0].toUpperCase()}`
    await supabase.from('messages').insert({ 
      trade_id: id, 
      sender_id: user.id, 
      sender_email: 'SYSTEM', 
      content: systemContent 
    })
    setEscrowActive(true)
  }

  const signalCompletion = async () => {
    if (!user || !id) return
    const systemContent = `🔔 ${user.email.split('@')[0].toUpperCase()} SIGNALED COMPLETION. AWAITING ADMIN RESOLUTION.`
    await supabase.from('messages').insert({
      trade_id: id,
      sender_id: user.id,
      sender_email: 'SYSTEM',
      content: systemContent
    })
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !id) return
    await supabase.from('messages').insert({ 
      trade_id: id, 
      sender_id: user.id, 
      content: newMessage, 
      sender_email: user.email 
    })
    setNewMessage('')
  }

  if (loading) return (
    <div className="h-screen bg-black flex flex-col items-center justify-center font-mono">
      <div className="text-blue-500 text-xs animate-pulse tracking-[0.5em] uppercase">Establishing_Encrypted_Link...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <style jsx>{`
        .system-fade { transition: opacity 2s, transform 1.5s, height 1s; opacity: 1; }
        .is-hidden { opacity: 0; transform: translateY(-10px); height: 0; margin: 0; padding: 0; overflow: hidden; pointer-events: none; }
      `}</style>

      <div className="max-w-7xl mx-auto h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 px-2">
          <button onClick={() => router.push('/')} className="text-zinc-500 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.3em]">
            ← TERMINATE_SESSION
          </button>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Node: {id.slice(0,8)}</span>
            <div className={`h-2 w-2 rounded-full ${escrowActive ? 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse' : 'bg-blue-600'}`} />
          </div>
        </div>

        <div className="flex-1 border border-zinc-800/50 rounded-3xl bg-zinc-900/10 overflow-hidden flex flex-col lg:flex-row backdrop-blur-md">
          <div className="lg:w-80 border-b lg:border-b-0 lg:border-r border-zinc-800 p-8 flex flex-col bg-black/60">
            <div className="flex-grow">
              <img src={listing?.image_url} className="w-full aspect-square object-contain bg-zinc-950 rounded-2xl border border-zinc-800 p-4 mb-8" />
              <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{listing?.item_name}</h1>
              <p className="text-green-500 font-mono text-[9px] font-bold uppercase tracking-widest mt-4">Seeking: {listing?.looking_for}</p>
            </div>
            <div className="mt-8 space-y-4">
              <button onClick={initializeEscrow} disabled={escrowActive} className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] ${escrowActive ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}>
                {escrowActive ? 'ESCROW_LOCKED' : 'INITIALIZE_ESCROW'}
              </button>
              {escrowActive && (
                <button onClick={signalCompletion} className="w-full py-3 border border-green-500/30 text-green-500 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl">
                  Signal_Trade_Complete
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-black/20">
            <div className="p-4 bg-zinc-900/30 border-b border-zinc-800 flex justify-between items-center backdrop-blur-sm">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500">Comms_Channel_Active</span>
              
              {/* ADMIN PURGE BUTTON */}
              {user?.email === ADMIN_EMAIL && (
                <button 
                  onClick={() => confirm("PROTOCOL: PURGE ALL CHAT LOGS?") && clearChat()}
                  className="text-[8px] font-black text-red-900 hover:text-red-500 border border-red-900/30 hover:border-red-500 px-3 py-1 rounded-md transition-all uppercase"
                >
                  [ PURGE_LOGS ]
                </button>
              )}
            </div>

            <div ref={chatContainerRef} className="flex-grow overflow-y-auto p-6 space-y-6">
              {messages.map((msg) => {
                const isSystem = msg.sender_email === 'SYSTEM'
                const isHidden = isSystem && visibleSystemMsgs[msg.id] === false
                const isMe = msg.sender_email === user?.email
                const isSenderAdmin = msg.sender_email === ADMIN_EMAIL
                const displayName = isSystem ? 'SYSTEM' : msg.sender_email.split('@')[0].toUpperCase()

                return (
                  <div key={msg.id} className={`flex flex-col ${isSystem ? `system-fade ${isHidden ? 'is-hidden' : ''}` : ''} ${!isSystem && isMe ? 'items-end' : isSystem ? 'items-center w-full' : 'items-start'}`}>
                    {!isSystem && (
                      <span className="text-[8px] text-zinc-600 mb-2 px-1 font-black uppercase tracking-widest">
                        {isSenderAdmin ? 'ADMIN' : displayName}
                      </span>
                    )}
                    <div className={`px-5 py-3 rounded-2xl max-w-[80%] text-sm ${
                      isSystem 
                        ? 'bg-blue-900/10 border border-blue-500/30 text-blue-400 font-mono italic text-[10px] text-center w-full' 
                        : isMe ? 'bg-blue-600 text-white rounded-tr-none' 
                        : isSenderAdmin ? 'bg-indigo-700 text-white rounded-tl-none' : 'bg-zinc-900 text-zinc-300 rounded-tl-none'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                )
              })}
              <div ref={scrollRef} />
            </div>

            <form onSubmit={sendMessage} className="p-6 bg-zinc-950/50 border-t border-zinc-800 flex gap-4">
              <input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="TYPE_MESSAGE..." className="flex-grow bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-4 text-[10px] font-mono text-white focus:outline-none focus:border-blue-600 transition-all" />
              <button type="submit" className="bg-blue-600 px-10 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-500 transition-all">
                Transmit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}