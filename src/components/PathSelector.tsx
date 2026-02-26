'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Path = Database['public']['Tables']['paths']['Row']
type Location = Database['public']['Tables']['locations']['Row']

interface PathWithDestination extends Path {
  destination: Location
}

interface PathSelectorProps {
  currentLocationId: string
  onSelect: (pathId: string) => void
  onClose: () => void
}

export default function PathSelector({ currentLocationId, onSelect, onClose }: PathSelectorProps) {
  const [paths, setPaths] = useState<PathWithDestination[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchPaths = async () => {
      // 現在地から出発するパスを取得
      const { data: pathsData } = await supabase
        .from('paths')
        .select('*')
        .eq('from_location_id', currentLocationId)

      if (pathsData) {
        // 各パスの目的地情報を取得
        const pathsWithDestinations = await Promise.all(
          pathsData.map(async (path) => {
            const { data: locationData } = await supabase
              .from('locations')
              .select('*')
              .eq('id', path.to_location_id)
              .single()
            return {
              ...path,
              destination: locationData!,
            }
          })
        )
        setPaths(pathsWithDestinations)
      }
      setLoading(false)
    }
    fetchPaths()
  }, [currentLocationId])

  // 所要時間を計算（分）
  const calculateMinutes = (km: number) => Math.ceil(km / 0.25)

  // 所要時間をフォーマット
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}分`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}時間${mins}分` : `${hours}時間`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">次の目的地を選ぶ</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : paths.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              ここから行ける場所がありません
            </p>
          ) : (
            <div className="space-y-3">
              {paths.map((path) => {
                const minutes = calculateMinutes(path.distance_km)
                return (
                  <button
                    key={path.id}
                    onClick={() => onSelect(path.id)}
                    className="w-full p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors text-left border border-gray-200 hover:border-blue-300"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {path.destination.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          距離: {path.distance_km} km
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-600 font-medium">
                          {formatDuration(minutes)}
                        </p>
                        <p className="text-xs text-gray-400">
                          の集中で到達
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
