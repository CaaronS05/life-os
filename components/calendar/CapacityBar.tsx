'use client'

interface CapacityBarProps {
  scheduledHours: number
  capacityHours: number
}

export default function CapacityBar({ scheduledHours, capacityHours }: CapacityBarProps) {
  // Hindari pembagian dengan 0
  const safeCapacity = capacityHours > 0 ? capacityHours : 1
  const percentage = Math.min((scheduledHours / safeCapacity) * 100, 100)

  // Warna merah jika jadwal sudah mepet atau melebihi kapasitas ( > 90% )
  const barColor = percentage > 90 ? 'bg-red-500' : 'bg-black'

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-sm">Today's Capacity</span>
        <span className="text-sm font-medium text-gray-500">
          <span className="text-black">{scheduledHours}h</span> / {capacityHours}h
        </span>
      </div>
      
      {/* Track Background */}
      <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
        {/* Progress Fill */}
        <div 
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}