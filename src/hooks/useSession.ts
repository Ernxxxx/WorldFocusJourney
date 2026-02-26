'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useSession(userId: string | undefined) {
  const [activeSession, setActiveSession] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const supabase = createClient()

  const startSession = useCallback(async () => {
    if (!userId) return null

    const now = new Date()
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: userId,
        start_at: now.toISOString(),
        status: 'IN_PROGRESS',
      })
      .select()
      .single()

    if (!error && data) {
      setActiveSession(data.id)
      setStartTime(now)
      return data.id
    }
    return null
  }, [userId, supabase])

  const endSession = useCallback(async (status: 'SUCCESS' | 'CANCELED') => {
    if (!activeSession || !startTime) return null

    const endTime = new Date()
    const minutes = (endTime.getTime() - startTime.getTime()) / 1000 / 60
    const earnedKm = minutes * 0.25

    const { data, error } = await supabase
      .from('sessions')
      .update({
        end_at: endTime.toISOString(),
        distance_earned_km: earnedKm,
        status,
      })
      .eq('id', activeSession)
      .select()
      .single()

    if (!error) {
      setActiveSession(null)
      setStartTime(null)
    }

    return { minutes, earnedKm }
  }, [activeSession, startTime, supabase])

  return {
    activeSession,
    startTime,
    startSession,
    endSession,
    isActive: !!activeSession,
  }
}
