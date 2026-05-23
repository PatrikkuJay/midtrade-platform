import { createClient as supabaseCreate } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// This MUST be exported as 'createClient'
export const createClient = () => supabaseCreate(supabaseUrl, supabaseAnonKey)