'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type UserProgress = Database['public']['Tables']['user_progress']['Row']
type Path = Database['public']['Tables']['paths']['Row']
type Location = Database['public']['Tables']['locations']['Row']

const KM_PER_MINUTE = 0.25 // 15km/h = 0.25km/min

export function useProgress(userId: string | undefined) {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [currentPath, setCurrentPath] = useState<Path | null>(null)
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProgress = useCallback(async () => {
    if (!userId) return

    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single()

    setProgress(data)

    if (data?.current_path_id) {
      const { data: pathData } = await supabase
        .from('paths')
        .select('*')
        .eq('id', data.current_path_id)
        .single()
      setCurrentPath(pathData)
    }

    if (data?.current_location_id) {
      const { data: locationData } = await supabase
        .from('locations')
        .select('*')
        .eq('id', data.current_location_id)
        .single()
      setCurrentLocation(locationData)
    }

    setLoading(false)
  }, [userId, supabase])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  // 距離を追加（セッション完了時に呼ぶ）
  const addDistance = useCallback(async (minutes: number) => {
    if (!userId || !progress) return null

    const earnedKm = minutes * KM_PER_MINUTE
    let newProgressKm = progress.progress_km + earnedKm
    let newLocationId = progress.current_location_id
    let newPathId = progress.current_path_id

    // パス上を移動中の場合、到達チェック
    if (currentPath) {
      if (newProgressKm >= currentPath.distance_km) {
        // 到達！
        const remaining = newProgressKm - currentPath.distance_km
        newLocationId = currentPath.to_location_id
        newPathId = null
        newProgressKm = remaining
      }
    }

    const { data, error } = await supabase
      .from('user_progress')
      .update({
        progress_km: newProgressKm,
        current_location_id: newLocationId,
        current_path_id: newPathId,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (!error && data) {
      setProgress(data)
      await fetchProgress()
    }

    return {
      earnedKm,
      arrived: newPathId === null && progress.current_path_id !== null,
      newLocation: newLocationId,
    }
  }, [userId, progress, currentPath, supabase, fetchProgress])

  // パスを選択して移動開始
  const selectPath = useCallback(async (pathId: string) => {
    if (!userId) return

    const { data, error } = await supabase
      .from('user_progress')
      .update({
        current_path_id: pathId,
        progress_km: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (!error && data) {
      setProgress(data)
      await fetchProgress()
    }
  }, [userId, supabase, fetchProgress])

  // 初期位置を設定
  const setStartLocation = useCallback(async (locationId: string) => {
    if (!userId) return

    // まずprofileを確認/作成
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existingProfile) {
      await supabase.from('profiles').insert({ id: userId })
    }

    // progressを作成/更新
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        current_location_id: locationId,
        current_path_id: null,
        progress_km: 0,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (!error && data) {
      setProgress(data)
      await fetchProgress()
    }
  }, [userId, supabase, fetchProgress])

  return {
    progress,
    currentPath,
    currentLocation,
    loading,
    addDistance,
    selectPath,
    setStartLocation,
    refetch: fetchProgress,
  }
}
