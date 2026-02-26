'use client'

import { useState, useEffect, useCallback } from 'react'
import { useProgress } from '@/hooks/useProgress'
import { useSession } from '@/hooks/useSession'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface FocusContentProps {
  userId: string
}

type FocusMode = 'preset' | 'free' | 'active'

export default function FocusContent({ userId }: FocusContentProps) {
  const { progress, currentPath, currentLocation, addDistance, loading } = useProgress(userId)
  const { startSession, endSession, isActive, startTime } = useSession(userId)
  const [mode, setMode] = useState<FocusMode>('preset')
  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [result, setResult] = useState<{ earnedKm: number; arrived: boolean; newLocation: string | null } | null>(null)
  const router = useRouter()

  const presetTimes = [15, 25, 45, 60]

  // タイマー
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isActive && startTime) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000)
        setElapsedSeconds(elapsed)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isActive, startTime])

  // 集中開始
  const handleStart = async () => {
    await startSession()
    setMode('active')
    setElapsedSeconds(0)
    setResult(null)
  }

  // 集中終了
  const handleEnd = useCallback(async (status: 'SUCCESS' | 'CANCELED') => {
    const sessionResult = await endSession(status)
    if (sessionResult && status === 'SUCCESS') {
      const progressResult = await addDistance(sessionResult.minutes)
      setResult(progressResult)
    }
    setMode('preset')
  }, [endSession, addDistance])

  // プリセット時間経過で自動終了
  useEffect(() => {
    if (mode === 'active' && selectedMinutes > 0 && elapsedSeconds >= selectedMinutes * 60) {
      handleEnd('SUCCESS')
    }
  }, [elapsedSeconds, selectedMinutes, mode, handleEnd])

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // 残り時間（プリセットモード）
  const remainingSeconds = mode === 'active' ? Math.max(0, selectedMinutes * 60 - elapsedSeconds) : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentPath) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold mb-4">目的地が設定されていません</h1>
        <p className="text-gray-600 mb-6">まず次の目的地を選んでください</p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          地図に戻る
        </Link>
      </div>
    )
  }

  // 結果表示
  if (result) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-500 to-blue-700 text-white p-4">
        <div className="text-center max-w-md">
          {result.arrived ? (
            <>
              <div className="text-6xl mb-6">🎉</div>
              <h1 className="text-3xl font-bold mb-4">到着！</h1>
              <p className="text-xl mb-2">{result.newLocation} に到達しました！</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-6">👏</div>
              <h1 className="text-3xl font-bold mb-4">お疲れ様でした！</h1>
            </>
          )}
          <p className="text-2xl mb-8">
            +{result.earnedKm.toFixed(2)} km 進みました
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
          >
            地図に戻る
          </Link>
        </div>
      </div>
    )
  }

  // 集中中
  if (mode === 'active') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-2">{currentLocation?.name} → 目的地</p>
          <h1 className="text-6xl font-mono font-bold mb-8">
            {selectedMinutes > 0 ? formatTime(remainingSeconds) : formatTime(elapsedSeconds)}
          </h1>
          <p className="text-gray-400 mb-2">
            {selectedMinutes > 0 ? '残り時間' : '経過時間'}
          </p>
          <p className="text-xl text-blue-400 mb-12">
            現在 +{(elapsedSeconds / 60 * 0.25).toFixed(2)} km
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => handleEnd('SUCCESS')}
              className="px-8 py-4 bg-green-600 rounded-lg font-semibold hover:bg-green-700"
            >
              集中完了
            </button>
            <button
              onClick={() => handleEnd('CANCELED')}
              className="px-8 py-4 bg-red-600 rounded-lg font-semibold hover:bg-red-700"
            >
              キャンセル
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 時間選択
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
          ← 地図に戻る
        </Link>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">集中を開始</h1>
          <p className="text-gray-600">
            {currentLocation?.name} から出発
          </p>
          <p className="text-sm text-gray-500 mt-1">
            目的地まで {(currentPath.distance_km - progress!.progress_km).toFixed(1)} km
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">集中時間を選択</h2>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {presetTimes.map((mins) => (
              <button
                key={mins}
                onClick={() => {
                  setSelectedMinutes(mins)
                  setMode('preset')
                }}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedMinutes === mins && mode === 'preset'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl font-bold">{mins}</span>
                <span className="text-gray-500 ml-1">分</span>
                <p className="text-sm text-gray-400 mt-1">
                  +{(mins * 0.25).toFixed(2)} km
                </p>
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSelectedMinutes(0)
              setMode('free')
            }}
            className={`w-full p-4 rounded-lg border-2 transition-colors ${
              mode === 'free'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="font-semibold">フリーモード</span>
            <p className="text-sm text-gray-400">時間制限なし</p>
          </button>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-4 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          集中を開始する
        </button>
      </div>
    </div>
  )
}
