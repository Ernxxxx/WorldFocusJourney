import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FocusContent from '@/components/FocusContent'

export default async function FocusPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  return <FocusContent userId={user.id} />
}
