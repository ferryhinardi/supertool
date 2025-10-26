import { describe, it, expect } from 'vitest'

interface Task {
  id: string
  title: string
  duration: number // in minutes
  category: string
  completed: boolean
  createdAt: string
}

// Helper function to calculate completion rate
export function calculateCompletionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  const completedTasks = tasks.filter((task) => task.completed).length
  return Math.round((completedTasks / tasks.length) * 100)
}

// Helper function to calculate total time
export function calculateTotalTime(tasks: Task[]): number {
  return tasks.reduce((acc, task) => acc + task.duration, 0)
}

// Helper function to calculate completed time
export function calculateCompletedTime(tasks: Task[]): number {
  return tasks.filter((task) => task.completed).reduce((acc, task) => acc + task.duration, 0)
}

// Helper function to format time
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

// Helper function to calculate category statistics
export function calculateCategoryStats(
  tasks: Task[],
  category: string
): { count: number; time: number; percentage: number } {
  const categoryTasks = tasks.filter((task) => task.category === category)
  const categoryTime = categoryTasks.reduce((acc, task) => acc + task.duration, 0)
  const totalTime = calculateTotalTime(tasks)
  const percentage = totalTime > 0 ? (categoryTime / totalTime) * 100 : 0

  return {
    count: categoryTasks.length,
    time: categoryTime,
    percentage,
  }
}

describe('Daily Task Summary Logic', () => {
  describe('calculateCompletionRate', () => {
    it('should return 0 for empty task list', () => {
      expect(calculateCompletionRate([])).toBe(0)
    })

    it('should return 100 for all completed tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          duration: 30,
          category: 'work',
          completed: true,
          createdAt: '2024-01-01',
        },
        {
          id: '2',
          title: 'Task 2',
          duration: 45,
          category: 'personal',
          completed: true,
          createdAt: '2024-01-01',
        },
      ]
      expect(calculateCompletionRate(tasks)).toBe(100)
    })

    it('should return 0 for no completed tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: '2024-01-01',
        },
        {
          id: '2',
          title: 'Task 2',
          duration: 45,
          category: 'personal',
          completed: false,
          createdAt: '2024-01-01',
        },
      ]
      expect(calculateCompletionRate(tasks)).toBe(0)
    })

    it('should return 50 for half completed tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          duration: 30,
          category: 'work',
          completed: true,
          createdAt: '2024-01-01',
        },
        {
          id: '2',
          title: 'Task 2',
          duration: 45,
          category: 'personal',
          completed: false,
          createdAt: '2024-01-01',
        },
      ]
      expect(calculateCompletionRate(tasks)).toBe(50)
    })

    it('should round the completion rate', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          duration: 30,
          category: 'work',
          completed: true,
          createdAt: '2024-01-01',
        },
        {
          id: '2',
          title: 'Task 2',
          duration: 45,
          category: 'personal',
          completed: false,
          createdAt: '2024-01-01',
        },
        {
          id: '3',
          title: 'Task 3',
          duration: 60,
          category: 'learning',
          completed: false,
          createdAt: '2024-01-01',
        },
      ]
      expect(calculateCompletionRate(tasks)).toBe(33)
    })
  })

  describe('calculateTotalTime', () => {
    it('should return 0 for empty task list', () => {
      expect(calculateTotalTime([])).toBe(0)
    })

    it('should calculate total time correctly', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          duration: 30,
          category: 'work',
          completed: true,
          createdAt: '2024-01-01',
        },
        {
          id: '2',
          title: 'Task 2',
          duration: 45,
          category: 'personal',
          completed: false,
          createdAt: '2024-01-01',
        },
        {
          id: '3',
          title: 'Task 3',
          duration: 60,
          category: 'learning',
          completed: true,
          createdAt: '2024-01-01',
        },
      ]
      expect(calculateTotalTime(tasks)).toBe(135)
    })
  })

  describe('calculateCompletedTime', () => {
    it('should return 0 for empty task list', () => {
      expect(calculateCompletedTime([])).toBe(0)
    })

    it('should return 0 for no completed tasks', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          duration: 30,
          category: 'work',
          completed: false,
          createdAt: '2024-01-01',
        },
        {
          id: '2',
          title: 'Task 2',
          duration: 45,
          category: 'personal',
          completed: false,
          createdAt: '2024-01-01',
        },
      ]
      expect(calculateCompletedTime(tasks)).toBe(0)
    })

    it('should calculate completed time correctly', () => {
      const tasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          duration: 30,
          category: 'work',
          completed: true,
          createdAt: '2024-01-01',
        },
        {
          id: '2',
          title: 'Task 2',
          duration: 45,
          category: 'personal',
          completed: false,
          createdAt: '2024-01-01',
        },
        {
          id: '3',
          title: 'Task 3',
          duration: 60,
          category: 'learning',
          completed: true,
          createdAt: '2024-01-01',
        },
      ]
      expect(calculateCompletedTime(tasks)).toBe(90)
    })
  })

  describe('formatTime', () => {
    it('should format minutes only', () => {
      expect(formatTime(30)).toBe('30m')
      expect(formatTime(45)).toBe('45m')
      expect(formatTime(0)).toBe('0m')
    })

    it('should format hours and minutes', () => {
      expect(formatTime(60)).toBe('1h 0m')
      expect(formatTime(90)).toBe('1h 30m')
      expect(formatTime(125)).toBe('2h 5m')
      expect(formatTime(180)).toBe('3h 0m')
    })

    it('should handle large values', () => {
      expect(formatTime(480)).toBe('8h 0m')
      expect(formatTime(525)).toBe('8h 45m')
    })
  })

  describe('calculateCategoryStats', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        duration: 30,
        category: 'work',
        completed: true,
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        title: 'Task 2',
        duration: 45,
        category: 'work',
        completed: false,
        createdAt: '2024-01-01',
      },
      {
        id: '3',
        title: 'Task 3',
        duration: 60,
        category: 'personal',
        completed: true,
        createdAt: '2024-01-01',
      },
      {
        id: '4',
        title: 'Task 4',
        duration: 15,
        category: 'learning',
        completed: false,
        createdAt: '2024-01-01',
      },
    ]

    it('should calculate work category stats', () => {
      const stats = calculateCategoryStats(tasks, 'work')
      expect(stats.count).toBe(2)
      expect(stats.time).toBe(75)
      expect(stats.percentage).toBe(50)
    })

    it('should calculate personal category stats', () => {
      const stats = calculateCategoryStats(tasks, 'personal')
      expect(stats.count).toBe(1)
      expect(stats.time).toBe(60)
      expect(stats.percentage).toBe(40)
    })

    it('should calculate learning category stats', () => {
      const stats = calculateCategoryStats(tasks, 'learning')
      expect(stats.count).toBe(1)
      expect(stats.time).toBe(15)
      expect(stats.percentage).toBe(10)
    })

    it('should return zero stats for non-existent category', () => {
      const stats = calculateCategoryStats(tasks, 'health')
      expect(stats.count).toBe(0)
      expect(stats.time).toBe(0)
      expect(stats.percentage).toBe(0)
    })

    it('should handle empty task list', () => {
      const stats = calculateCategoryStats([], 'work')
      expect(stats.count).toBe(0)
      expect(stats.time).toBe(0)
      expect(stats.percentage).toBe(0)
    })
  })

  describe('Task filtering by date', () => {
    const tasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        duration: 30,
        category: 'work',
        completed: true,
        createdAt: '2024-01-01',
      },
      {
        id: '2',
        title: 'Task 2',
        duration: 45,
        category: 'personal',
        completed: false,
        createdAt: '2024-01-01',
      },
      {
        id: '3',
        title: 'Task 3',
        duration: 60,
        category: 'work',
        completed: true,
        createdAt: '2024-01-02',
      },
    ]

    it('should filter tasks by date', () => {
      const filteredTasks = tasks.filter((task) => task.createdAt === '2024-01-01')
      expect(filteredTasks.length).toBe(2)
      expect(filteredTasks[0].id).toBe('1')
      expect(filteredTasks[1].id).toBe('2')
    })

    it('should calculate stats for filtered tasks', () => {
      const filteredTasks = tasks.filter((task) => task.createdAt === '2024-01-01')
      expect(calculateCompletionRate(filteredTasks)).toBe(50)
      expect(calculateTotalTime(filteredTasks)).toBe(75)
      expect(calculateCompletedTime(filteredTasks)).toBe(30)
    })

    it('should return empty array for non-existent date', () => {
      const filteredTasks = tasks.filter((task) => task.createdAt === '2024-01-03')
      expect(filteredTasks.length).toBe(0)
    })
  })
})
