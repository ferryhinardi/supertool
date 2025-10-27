import type { Metadata } from 'next'
import { generateToolMetadata } from '@/lib/metadata'

export const metadata: Metadata = generateToolMetadata({
  title: 'Pomodoro Timer & Focus Tool',
  description:
    'Free Pomodoro timer with customizable work/break intervals and session tracking. Boost productivity with the proven Pomodoro Technique. Track your focus sessions and improve time management.',
  keywords: [
    'pomodoro timer',
    'focus timer',
    'productivity timer',
    'work timer',
    'study timer',
    'time management',
    'pomodoro technique',
    'focus tool',
    'break timer',
    'productivity app',
    'timer online',
    'work sessions',
  ],
  category: 'productivity',
  path: '/tools/pomodoro',
})

export default function PomodoroLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
