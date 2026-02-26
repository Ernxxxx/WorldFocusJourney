'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Location = Database['public']['Tables']['locations']['Row']

interface StartLocationSelectorProps {
  onSelect: (locationId: string) => void
}

export default function StartLocationSelector({ onSelect }: StartLocationSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchStartLocations = async () => {
      const { data } = await supabase
        .from('locations')
        .select('*')
        .eq('is_start', true)
        .order('name')

      if (data) setLocations(data)
      setLoading(false)
    }
    fetchStartLocations()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
      {locations.map((location) => (
        <button
          key={location.id}
          onClick={() => onSelect(location.id)}
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <h3 className="text-lg font-semibold">{location.name}</h3>
            <p className="text-sm text-gray-500 mt-1">ここから旅を始める</p>
          </div>
        </button>
      ))}
    </div>
  )
}
