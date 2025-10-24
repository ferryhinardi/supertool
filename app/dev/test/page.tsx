'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestPage() {
  useEffect(() => {
    async function check() {
      const { data, error } = await supabase.from('non_existing').select('*')
      console.log({ data, error })
    }
    check()
  }, [])

  return <div>✅ Supabase connection test — open console</div>
}
