'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function PostListing() {
  // Fix: Initializing with empty strings ensures no 'pre-filled' text appears as values
  const [file, setFile] = useState<File | null>(null)
  const [itemName, setItemName] = useState('')
  const [lookingFor, setLookingFor] = useState('')
  const [uploading, setUploading] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !itemName) {
      alert("ERROR: File and Designation required.")
      return
    }
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("AUTH_REQUIRED: Please log in.")

      // 1. Upload Image to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('listing-images')
        .getPublicUrl(fileName)

      // 2. Insert into 'listings' table with 'pending' status
      const { error: insertError } = await supabase.from('listings').insert({
        item_name: itemName.toUpperCase(),
        looking_for: lookingFor.toUpperCase(),
        image_url: publicUrl,
        owner_id: user.id,
        status: 'pending' // Lights up the moderation queue in Admin Panel
      })

      if (insertError) throw insertError

      alert("ASSET_TRANSMITTED: Awaiting admin authorization.")
      router.push('/') // Redirect home after success
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center justify-center font-sans">
      
      {/* NEW: BACK BUTTON TO PREVENT GETTING STUCK */}
      <div className="max-w-md w-full mb-6">
        <button 
          onClick={() => router.push('/')}
          className="group flex items-center gap-2 text-zinc-600 hover:text-white transition-all font-black text-[10px] uppercase tracking-[0.3em]"
        >
          ← ABORT_UPLINK
          <span className="opacity-0 group-hover:opacity-100 text-[8px] text-red-500 font-mono transition-opacity">
            [RETURN_TO_HUB]
          </span>
        </button>
      </div>

      <div className="max-w-md w-full bg-zinc-900/20 border border-zinc-800/50 p-10 rounded-3xl backdrop-blur-xl shadow-2xl">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter mb-8 text-blue-500 italic">
          Initialize_New_Asset
        </h1>
        
        <form onSubmit={handlePost} className="space-y-6">
          {/* FILE UPLOAD */}
          <div className="group">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 block">
              Item_Image_Uplink
            </label>
            <div className="relative">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full text-[10px] text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-zinc-800 file:text-white hover:file:bg-blue-600 transition-all cursor-pointer"
              />
            </div>
          </div>

          {/* ITEM NAME */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
              Item_Designation
            </label>
            <input 
              type="text" 
              placeholder="E.G. PRIME KARAMBIT" 
              value={itemName} 
              onChange={(e) => setItemName(e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all font-bold tracking-tight uppercase"
            />
          </div>

          {/* LOOKING FOR */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">
              Target_Requirement
            </label>
            <input 
              type="text" 
              placeholder="E.G. PRIME VANDAL" 
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              className="w-full bg-black/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 transition-all font-bold tracking-tight text-green-500 uppercase"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white hover:text-black transition-all active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'TRANSMITTING_DATA...' : 'TRANSMIT_FOR_MODERATION'}
          </button>
        </form>
      </div>

      <p className="mt-8 text-[8px] text-zinc-800 font-bold uppercase tracking-[0.4em]">
        Secure Encryption Node: ACTIVE
      </p>
    </div>
  )
}