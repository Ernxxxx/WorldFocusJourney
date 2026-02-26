'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Stats {
  totalDistance: number
  totalSessions: number
  visitedLocations: number
  todayDistance: number
  weekDistance: number
  monthDistance: number
}

interface DashboardContentProps {
  userId: string
}

export default function DashboardContent({ userId }: DashboardContentProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      // 全セッションを取得
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'SUCCESS')

      if (!sessions) {
        setLoading(false)
        return
      }

      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(todayStart)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      let totalDistance = 0
      let todayDistance = 0
      let weekDistance = 0
      let monthDistance = 0

      sessions.forEach((session) => {
        const distance = session.distance_earned_km || 0
        const date = new Date(session.created_at)

        totalDistance += distance

        if (date >= todayStart) {
          todayDistance += distance
        }
        if (date >= weekStart) {
          weekDistance += distance
        }
        if (date >= monthStart) {
          monthDistance += distance
        }
      })

      // 訪問した場所の数（仮：進捗から推測）
      // 実際にはセッションログから追跡する必要があるが、簡略化
      const visitedLocations = Math.floor(totalDistance / 100) + 1

      setStats({
        totalDistance,
        totalSessions: sessions.length,
        visitedLocations,
        todayDistance,
        weekDistance,
        monthDistance,
      })
      setLoading(false)
    }

    fetchStats()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statCards = [
    { label: '総移動距離', value: `${stats?.totalDistance.toFixed(1) || 0} km`, icon: '🚶' },
    { label: '総セッション数', value: `${stats?.totalSessions || 0} 回`, icon: '⏱️' },
    { label: '今日の距離', value: `${stats?.todayDistance.toFixed(1) || 0} km`, icon: '📅' },
    { label: '今週の距離', value: `${stats?.weekDistance.toFixed(1) || 0} km`, icon: '📊' },
    { label: '今月の距離', value: `${stats?.monthDistance.toFixed(1) || 0} km`, icon: '📈' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">ダッシュボード</h1>
          <Link href="/" className="text-gray-600 hover:text-blue-600">
            ← 地図に戻る
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow p-6"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{card.icon}</span>
                <div>
                  <p className="text-sm text-gray-500">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 進捗バー（例：横浜までの進捗） */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">旅の記録</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-600">東京 → 横浜 (30km)</span>
                <span className="text-sm text-gray-600">
                  {Math.min(100, ((stats?.totalDistance || 0) / 30 * 100)).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${Math.min(100, ((stats?.totalDistance || 0) / 30 * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
