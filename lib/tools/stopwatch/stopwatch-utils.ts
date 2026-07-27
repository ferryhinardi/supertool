/**
 * Stopwatch & Timer Utility Functions
 * Provides audio notifications, export functionality, and keyboard shortcuts
 */

export interface LapTime {
  id: string
  time: number
  lapDuration: number
}

type AudioContextConstructor = new () => AudioContext

function getAudioContextConstructor(win: Window): AudioContextConstructor | undefined {
  const standardConstructor = Reflect.get(win, 'AudioContext')
  if (typeof standardConstructor === 'function') {
    return standardConstructor as AudioContextConstructor
  }

  const prefixedConstructor = Reflect.get(win, 'webkitAudioContext')
  return typeof prefixedConstructor === 'function'
    ? (prefixedConstructor as AudioContextConstructor)
    : undefined
}

/**
 * Generate a beep sound using Web Audio API as fallback
 * when audio file is not available
 */
export function playBeepSound(): void {
  if (typeof window === 'undefined') return

  try {
    const ResolvedAudioContext = getAudioContextConstructor(window)
    if (!ResolvedAudioContext) return

    const audioContext = new ResolvedAudioContext()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800 // 800 Hz beep
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.5)
  } catch (error) {
    console.error('Failed to play beep sound:', error)
  }
}

/**
 * Export lap times as CSV format
 */
export function exportLapsAsCSV(laps: LapTime[], totalTime: number): string {
  if (laps.length === 0) return ''

  const headers = ['Lap Number', 'Lap Time (ms)', 'Total Time (ms)', 'Lap Duration']
  const rows = laps.map((lap, index) => {
    const lapNumber = laps.length - index
    const lapTimeFormatted = formatTimeForExport(lap.lapDuration)
    const totalTimeFormatted = formatTimeForExport(lap.time)
    return [lapNumber, lap.lapDuration, lap.time, lapTimeFormatted, totalTimeFormatted]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
    '',
    `Total Time,${totalTime},${formatTimeForExport(totalTime)}`,
    `Total Laps,${laps.length}`,
  ].join('\n')

  return csvContent
}

/**
 * Export lap times as JSON format
 */
export function exportLapsAsJSON(laps: LapTime[], totalTime: number): string {
  const exportData = {
    exportDate: new Date().toISOString(),
    totalTime,
    totalTimeFormatted: formatTimeForExport(totalTime),
    lapCount: laps.length,
    laps: laps.map((lap, index) => ({
      lapNumber: laps.length - index,
      id: lap.id,
      time: lap.time,
      timeFormatted: formatTimeForExport(lap.time),
      lapDuration: lap.lapDuration,
      lapDurationFormatted: formatTimeForExport(lap.lapDuration),
    })),
    statistics: calculateLapStatistics(laps),
  }

  return JSON.stringify(exportData, null, 2)
}

/**
 * Calculate lap statistics
 */
export function calculateLapStatistics(laps: LapTime[]) {
  if (laps.length === 0) {
    return {
      average: 0,
      fastest: 0,
      slowest: 0,
      totalTime: 0,
    }
  }

  const lapDurations = laps.map((lap) => lap.lapDuration)
  const sum = lapDurations.reduce((acc, val) => acc + val, 0)
  const average = sum / laps.length
  const fastest = Math.min(...lapDurations)
  const slowest = Math.max(...lapDurations)
  const totalTime = laps[0]?.time || 0

  return {
    average,
    averageFormatted: formatTimeForExport(average),
    fastest,
    fastestFormatted: formatTimeForExport(fastest),
    slowest,
    slowestFormatted: formatTimeForExport(slowest),
    totalTime,
    totalTimeFormatted: formatTimeForExport(totalTime),
  }
}

/**
 * Format time in milliseconds to MM:SS.mm format for export
 */
function formatTimeForExport(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((ms % 1000) / 10)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`
}

/**
 * Download data as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return

  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Import presets from JSON file
 */
export async function importPresetsFromFile(
  file: File
): Promise<Array<{ name: string; duration: number }>> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const data = JSON.parse(content)

        // Validate structure
        if (!Array.isArray(data)) {
          throw new Error('Invalid file format: expected an array of presets')
        }

        // Validate each preset has required fields
        const validPresets = data.filter(
          (preset) =>
            typeof preset === 'object' &&
            preset !== null &&
            'name' in preset &&
            'duration' in preset
        )

        if (validPresets.length === 0) {
          throw new Error('No valid presets found in file')
        }

        resolve(validPresets)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
