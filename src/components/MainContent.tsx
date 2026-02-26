'use client'

import { useEffect, useState } from 'react'
import { useProgress } from '@/hooks/useProgress'
import JapanMap from '@/components/JapanMap'
import StartLocationSelector from '@/components/StartLocationSelector'
import PathSelector from '@/components/PathSelector'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface MainContentProps {
  userId: string
}

export default function MainContent({ userId }: MainContentProps) {
  const { progress, currentPath, currentLocation, loading, setStartLocation, selectPath } = useProgress(userId)
  const [showPathSelector, setShowPathSelector] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // 初回：スタート地点選択
  if (!progress?.current_location_id) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">World Focus Journey</h1>
          <h2 className="text-xl text-center mb-6">スタート地点を選択してください</h2>
          <StartLocationSelector onSelect={setStartLocation} />
        </div>
      </div>
    )
  }

  // 残り距離計算
  const remainingKm = currentPath ? currentPath.distance_km - progress.progress_km : 0
  const remainingMinutes = Math.ceil(remainingKm / 0.25)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">World Focus Journey</h1>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">
              ダッシュボード
            </Link>
            <Link href="/history" className="text-gray-600 hover:text-blue-600">
              履歴
            </Link>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600"
            >
              ログアウト
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 現在地情報 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">現在地</p>
              <p className="text-2xl font-bold">{currentLocation?.name || '---'}</p>
            </div>
            {currentPath && (
              <div className="text-right">
                <p className="text-sm text-gray-500">目的地まで</p>
                <p className="text-xl font-semibold text-blue-600">
                  {remainingKm.toFixed(1)} km
                </p>
                <p className="text-sm text-gray-500">
                  約 {remainingMinutes} 分の集中
                </p>
              </div>
            )}
          </div>

          {/* 次の集中で進む距離 */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              25分の集中で <span className="font-bold">6.25 km</span> 進みます
            </p>
          </div>
        </div>

        {/* 地図 */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <JapanMap
            userProgress={progress}
            onLocationClick={(id) => {
              if (id === progress.current_location_id) {
                setShowPathSelector(true)
              }
            }}
          />
        </div>

        {/* アクションボタン */}
        <div className="flex gap-4 justify-center">
          {!currentPath ? (
            <button
              onClick={() => setShowPathSelector(true)}
              className="px-8 py-4 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700"
            >
              次の目的地を選ぶ
            </button>
          ) : (
            <Link
              href="/focus"
              className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700"
            >
              集中を開始する
            </Link>
          )}
        </div>
      </main>

      {/* パス選択モーダル */}
      {showPathSelector && (
        <PathSelector
          currentLocationId={progress.current_location_id!}
          onSelect={(pathId) => {
            selectPath(pathId)
            setShowPathSelector(false)
          }}
          onClose={() => setShowPathSelector(false)}
        />
      )}
    </div>
  )
}
