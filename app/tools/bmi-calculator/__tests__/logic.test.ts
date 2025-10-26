import { describe, it, expect } from 'vitest'

// BMI calculation functions (extracted for testing)
function calculateBMI(weight: number, height: number, isMetric: boolean): number {
  if (isMetric) {
    const heightInMeters = height / 100
    return weight / (heightInMeters * heightInMeters)
  } else {
    return (weight / (height * height)) * 703
  }
}

function getCategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal Weight'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

function getIdealWeightRange(height: number, isMetric: boolean): [number, number] {
  const heightInMeters = isMetric ? height / 100 : height * 0.0254
  const minWeight = 18.5 * (heightInMeters * heightInMeters)
  const maxWeight = 24.9 * (heightInMeters * heightInMeters)

  if (!isMetric) {
    return [minWeight * 2.20462, maxWeight * 2.20462]
  }
  return [minWeight, maxWeight]
}

describe('BMI Calculator - Metric Units', () => {
  it('should calculate BMI correctly for metric units', () => {
    // Test case: 70kg, 175cm
    const bmi = calculateBMI(70, 175, true)
    expect(bmi).toBeCloseTo(22.86, 2)
  })

  it('should calculate BMI for underweight person (metric)', () => {
    // Test case: 50kg, 175cm
    const bmi = calculateBMI(50, 175, true)
    expect(bmi).toBeCloseTo(16.33, 2)
    expect(getCategory(bmi)).toBe('Underweight')
  })

  it('should calculate BMI for normal weight person (metric)', () => {
    // Test case: 70kg, 175cm
    const bmi = calculateBMI(70, 175, true)
    expect(bmi).toBeCloseTo(22.86, 2)
    expect(getCategory(bmi)).toBe('Normal Weight')
  })

  it('should calculate BMI for overweight person (metric)', () => {
    // Test case: 85kg, 175cm
    const bmi = calculateBMI(85, 175, true)
    expect(bmi).toBeCloseTo(27.76, 2)
    expect(getCategory(bmi)).toBe('Overweight')
  })

  it('should calculate BMI for obese person (metric)', () => {
    // Test case: 100kg, 175cm
    const bmi = calculateBMI(100, 175, true)
    expect(bmi).toBeCloseTo(32.65, 2)
    expect(getCategory(bmi)).toBe('Obese')
  })

  it('should calculate ideal weight range for metric units', () => {
    // Test case: 175cm height
    const [minWeight, maxWeight] = getIdealWeightRange(175, true)
    expect(minWeight).toBeCloseTo(56.66, 1)
    expect(maxWeight).toBeCloseTo(76.26, 1)
  })
})

describe('BMI Calculator - Imperial Units', () => {
  it('should calculate BMI correctly for imperial units', () => {
    // Test case: 154lbs, 68 inches (5'8")
    const bmi = calculateBMI(154, 68, false)
    expect(bmi).toBeCloseTo(23.41, 2)
  })

  it('should calculate BMI for underweight person (imperial)', () => {
    // Test case: 110lbs, 68 inches
    const bmi = calculateBMI(110, 68, false)
    expect(bmi).toBeCloseTo(16.72, 2)
    expect(getCategory(bmi)).toBe('Underweight')
  })

  it('should calculate BMI for normal weight person (imperial)', () => {
    // Test case: 154lbs, 68 inches
    const bmi = calculateBMI(154, 68, false)
    expect(bmi).toBeCloseTo(23.41, 2)
    expect(getCategory(bmi)).toBe('Normal Weight')
  })

  it('should calculate BMI for overweight person (imperial)', () => {
    // Test case: 185lbs, 68 inches
    const bmi = calculateBMI(185, 68, false)
    expect(bmi).toBeCloseTo(28.13, 1)
    expect(getCategory(bmi)).toBe('Overweight')
  })

  it('should calculate BMI for obese person (imperial)', () => {
    // Test case: 220lbs, 68 inches
    const bmi = calculateBMI(220, 68, false)
    expect(bmi).toBeCloseTo(33.45, 1)
    expect(getCategory(bmi)).toBe('Obese')
  })

  it('should calculate ideal weight range for imperial units', () => {
    // Test case: 68 inches height (5'8")
    const [minWeight, maxWeight] = getIdealWeightRange(68, false)
    expect(minWeight).toBeCloseTo(121.67, 1)
    expect(maxWeight).toBeCloseTo(163.79, 1)
  })
})

describe('BMI Category Classification', () => {
  it('should classify BMI < 18.5 as Underweight', () => {
    expect(getCategory(16.0)).toBe('Underweight')
    expect(getCategory(18.0)).toBe('Underweight')
    expect(getCategory(18.49)).toBe('Underweight')
  })

  it('should classify BMI 18.5-24.9 as Normal Weight', () => {
    expect(getCategory(18.5)).toBe('Normal Weight')
    expect(getCategory(20.0)).toBe('Normal Weight')
    expect(getCategory(24.9)).toBe('Normal Weight')
  })

  it('should classify BMI 25-29.9 as Overweight', () => {
    expect(getCategory(25.0)).toBe('Overweight')
    expect(getCategory(27.5)).toBe('Overweight')
    expect(getCategory(29.9)).toBe('Overweight')
  })

  it('should classify BMI >= 30 as Obese', () => {
    expect(getCategory(30.0)).toBe('Obese')
    expect(getCategory(35.0)).toBe('Obese')
    expect(getCategory(40.0)).toBe('Obese')
  })
})

describe('BMI Boundary Cases', () => {
  it('should handle boundary between underweight and normal', () => {
    const bmi = 18.5
    expect(getCategory(bmi)).toBe('Normal Weight')
    expect(getCategory(bmi - 0.01)).toBe('Underweight')
  })

  it('should handle boundary between normal and overweight', () => {
    const bmi = 25.0
    expect(getCategory(bmi)).toBe('Overweight')
    expect(getCategory(bmi - 0.01)).toBe('Normal Weight')
  })

  it('should handle boundary between overweight and obese', () => {
    const bmi = 30.0
    expect(getCategory(bmi)).toBe('Obese')
    expect(getCategory(bmi - 0.01)).toBe('Overweight')
  })
})

describe('Edge Cases and Validation', () => {
  it('should handle very tall person (metric)', () => {
    // Test case: 80kg, 200cm
    const bmi = calculateBMI(80, 200, true)
    expect(bmi).toBeCloseTo(20.0, 2)
    expect(getCategory(bmi)).toBe('Normal Weight')
  })

  it('should handle very short person (metric)', () => {
    // Test case: 40kg, 150cm
    const bmi = calculateBMI(40, 150, true)
    expect(bmi).toBeCloseTo(17.78, 2)
    expect(getCategory(bmi)).toBe('Underweight')
  })

  it('should handle very tall person (imperial)', () => {
    // Test case: 220lbs, 80 inches (6'8")
    const bmi = calculateBMI(220, 80, false)
    expect(bmi).toBeCloseTo(24.17, 1)
    expect(getCategory(bmi)).toBe('Normal Weight')
  })

  it('should handle very short person (imperial)', () => {
    // Test case: 90lbs, 60 inches (5'0")
    const bmi = calculateBMI(90, 60, false)
    expect(bmi).toBeCloseTo(17.58, 2)
    expect(getCategory(bmi)).toBe('Underweight')
  })

  it('should calculate ideal weight for different heights (metric)', () => {
    const heights = [150, 165, 175, 185, 200]
    heights.forEach((height) => {
      const [minWeight, maxWeight] = getIdealWeightRange(height, true)
      expect(minWeight).toBeGreaterThan(0)
      expect(maxWeight).toBeGreaterThan(minWeight)
      // Verify BMI calculation matches
      const minBMI = calculateBMI(minWeight, height, true)
      const maxBMI = calculateBMI(maxWeight, height, true)
      expect(minBMI).toBeCloseTo(18.5, 1)
      expect(maxBMI).toBeCloseTo(24.9, 1)
    })
  })

  it('should calculate ideal weight for different heights (imperial)', () => {
    const heights = [60, 65, 70, 75, 80] // inches
    heights.forEach((height) => {
      const [minWeight, maxWeight] = getIdealWeightRange(height, false)
      expect(minWeight).toBeGreaterThan(0)
      expect(maxWeight).toBeGreaterThan(minWeight)
      // Verify BMI calculation matches
      const minBMI = calculateBMI(minWeight, height, false)
      const maxBMI = calculateBMI(maxWeight, height, false)
      expect(minBMI).toBeCloseTo(18.5, 1)
      expect(maxBMI).toBeCloseTo(24.9, 1)
    })
  })
})

describe('Unit Conversion Consistency', () => {
  it('should give same BMI for equivalent metric and imperial measurements', () => {
    // 70kg = 154.32 lbs
    // 175cm = 68.9 inches
    const metricBMI = calculateBMI(70, 175, true)
    const imperialBMI = calculateBMI(154.32, 68.9, false)
    expect(metricBMI).toBeCloseTo(imperialBMI, 1)
  })

  it('should give same category for equivalent measurements', () => {
    // 70kg, 175cm
    const metricBMI = calculateBMI(70, 175, true)
    // 154.32 lbs, 68.9 inches
    const imperialBMI = calculateBMI(154.32, 68.9, false)

    expect(getCategory(metricBMI)).toBe(getCategory(imperialBMI))
  })
})

describe('Precision and Rounding', () => {
  it('should maintain precision in BMI calculation', () => {
    const bmi = calculateBMI(70.5, 175.5, true)
    expect(bmi).toBeDefined()
    expect(typeof bmi).toBe('number')
    expect(isFinite(bmi)).toBe(true)
  })

  it('should handle decimal weight and height values', () => {
    const bmi1 = calculateBMI(70.5, 175.5, true)
    const bmi2 = calculateBMI(70.0, 175.0, true)
    expect(bmi1).not.toBe(bmi2)
  })

  it('should calculate ideal weight range with precision', () => {
    const [minWeight, maxWeight] = getIdealWeightRange(175.5, true)
    expect(minWeight).toBeDefined()
    expect(maxWeight).toBeDefined()
    expect(isFinite(minWeight)).toBe(true)
    expect(isFinite(maxWeight)).toBe(true)
  })
})

describe('Real World Scenarios', () => {
  it('should calculate BMI for average adult male (US)', () => {
    // Average: 197.9 lbs, 5'9" (69 inches)
    const bmi = calculateBMI(197.9, 69, false)
    expect(bmi).toBeCloseTo(29.22, 1)
    expect(getCategory(bmi)).toBe('Overweight')
  })

  it('should calculate BMI for average adult female (US)', () => {
    // Average: 170.6 lbs, 5'4" (64 inches)
    const bmi = calculateBMI(170.6, 64, false)
    expect(bmi).toBeCloseTo(29.28, 1)
    expect(getCategory(bmi)).toBe('Overweight')
  })

  it('should calculate BMI for healthy athlete', () => {
    // 75kg, 180cm (muscular build)
    const bmi = calculateBMI(75, 180, true)
    expect(bmi).toBeCloseTo(23.15, 2)
    expect(getCategory(bmi)).toBe('Normal Weight')
  })

  it('should calculate ideal weight for common heights', () => {
    // 5'5" (165cm)
    const [min1, max1] = getIdealWeightRange(165, true)
    expect(min1).toBeCloseTo(50.37, 1)
    expect(max1).toBeCloseTo(67.82, 1)

    // 5'10" (178cm)
    const [min2, max2] = getIdealWeightRange(178, true)
    expect(min2).toBeCloseTo(58.6, 1)
    expect(max2).toBeCloseTo(78.9, 1)
  })
})
