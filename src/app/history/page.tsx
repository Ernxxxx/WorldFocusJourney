import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HistoryContent from '@/components/HistoryContent'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <HistoryContent userId={user.id} />
}
