'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Location = Database['public']['Tables']['locations']['Row']
type Path = Database['public']['Tables']['paths']['Row']
type UserProgress = Database['public']['Tables']['user_progress']['Row']

interface JapanMapProps {
  userProgress: UserProgress | null
  onLocationClick?: (locationId: string) => void
}

export default function JapanMap({ userProgress, onLocationClick }: JapanMapProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [paths, setPaths] = useState<Path[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const [locationsRes, pathsRes] = await Promise.all([
        supabase.from('locations').select('*'),
        supabase.from('paths').select('*'),
      ])
      if (locationsRes.data) setLocations(locationsRes.data)
      if (pathsRes.data) setPaths(pathsRes.data)
    }
    fetchData()
  }, [])

  const getLocation = (id: string) => locations.find((l) => l.id === id)

  const isCurrentLocation = (id: string) => userProgress?.current_location_id === id

  const isOnCurrentPath = (pathId: string) => userProgress?.current_path_id === pathId

  // 進行中のパスの進捗位置を計算
  const getCurrentPosition = () => {
    if (!userProgress?.current_path_id || !userProgress.progress_km) return null

    const path = paths.find((p) => p.id === userProgress.current_path_id)
    if (!path) return null

    const fromLoc = getLocation(path.from_location_id)
    const toLoc = getLocation(path.to_location_id)
    if (!fromLoc || !toLoc) return null

    const progress = Math.min(userProgress.progress_km / path.distance_km, 1)
    return {
      x: fromLoc.x + (toLoc.x - fromLoc.x) * progress,
      y: fromLoc.y + (toLoc.y - fromLoc.y) * progress,
    }
  }

  const currentPos = getCurrentPosition()

  return (
    <svg
      viewBox="0 0 1000 800"
      className="w-full h-auto max-h-[600px] bg-blue-50 rounded-lg"
    >
      {/* パス（道） */}
      {paths.map((path) => {
        const from = getLocation(path.from_location_id)
        const to = getLocation(path.to_location_id)
        if (!from || !to) return null

        const isActive = isOnCurrentPath(path.id)

        return (
          <line
            key={path.id}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke={isActive ? '#3B82F6' : '#94A3B8'}
            strokeWidth={isActive ? 4 : 2}
            strokeDasharray={isActive ? undefined : '5,5'}
          />
        )
      })}

      {/* 都市（ノード） */}
      {locations.map((location) => {
        const isCurrent = isCurrentLocation(location.id)
        const isStart = location.is_start

        return (
          <g
            key={location.id}
            onClick={() => onLocationClick?.(location.id)}
            className="cursor-pointer"
          >
            <circle
              cx={location.x}
              cy={location.y}
              r={isCurrent ? 20 : isStart ? 15 : 10}
              fill={isCurrent ? '#3B82F6' : isStart ? '#10B981' : '#6B7280'}
              stroke="#fff"
              strokeWidth={2}
            />
            <text
              x={location.x}
              y={location.y + 35}
              textAnchor="middle"
              className="text-sm font-medium fill-gray-700"
            >
              {location.name}
            </text>
          </g>
        )
      })}

      {/* 現在位置（パス上を移動中） */}
      {currentPos && (
        <circle
          cx={currentPos.x}
          cy={currentPos.y}
          r={12}
          fill="#EF4444"
          stroke="#fff"
          strokeWidth={3}
        >
          <animate
            attributeName="r"
            values="12;15;12"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  )
}
