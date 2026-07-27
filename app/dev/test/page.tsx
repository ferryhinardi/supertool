'use client'
import { useEffect, useState } from 'react'

export default function TestPage() {
  const [status, setStatus] = useState('Checking...')

  useEffect(() => {
    async function check() {
      // Check if Supabase env vars are available
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseKey) {
        setStatus('⚠️ Supabase credentials not configured')
        console.warn('Supabase env vars missing')
        return
      }

      try {
        // Dynamic import to avoid SSR errors
        const { supabase } = await import('@/lib/auth/supabaseClient')
        const { error } = await supabase.from('non_existing').select('*')

        if (error) {
          setStatus('✅ Supabase connection test complete')
          return
        }

        setStatus('✅ Supabase connection test complete')
      } catch (error) {
        console.error('Supabase test error:', error)
        setStatus('❌ Supabase connection failed')
      }
    }
    check()
  }, [])

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">Dev Test Page</h1>
      <p className="text-lg">{status}</p>
    </div>
  )
}
