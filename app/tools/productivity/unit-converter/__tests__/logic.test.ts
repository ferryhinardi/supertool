import { describe, expect, it } from 'vitest'
import { convertUnit, getAllCategories, getUnitInfo, getUnitsForCategory } from '../utils'

describe('Unit Converter Logic', () => {
  describe('Length Conversions', () => {
    it('converts meters to feet correctly', () => {
      const result = convertUnit(1, 'meter', 'foot', 'length')
      expect(result).toBeCloseTo(3.28084, 4)
    })

    it('converts kilometers to miles correctly', () => {
      const result = convertUnit(1, 'kilometer', 'mile', 'length')
      expect(result).toBeCloseTo(0.621371, 4)
    })

    it('converts inches to centimeters correctly', () => {
      const result = convertUnit(1, 'inch', 'centimeter', 'length')
      expect(result).toBeCloseTo(2.54, 4)
    })

    it('converts same unit returns same value', () => {
      const result = convertUnit(100, 'meter', 'meter', 'length')
      expect(result).toBe(100)
    })

    it('converts zero correctly', () => {
      const result = convertUnit(0, 'meter', 'foot', 'length')
      expect(result).toBe(0)
    })
  })

  describe('Weight Conversions', () => {
    it('converts kilograms to pounds correctly', () => {
      const result = convertUnit(1, 'kilogram', 'pound', 'weight')
      expect(result).toBeCloseTo(2.20462, 4)
    })

    it('converts grams to ounces correctly', () => {
      const result = convertUnit(28.35, 'gram', 'ounce', 'weight')
      expect(result).toBeCloseTo(1, 2)
    })

    it('converts metric tons to tons correctly', () => {
      const result = convertUnit(1, 'metricTon', 'ton', 'weight')
      expect(result).toBeCloseTo(1.10231, 4)
    })
  })

  describe('Temperature Conversions', () => {
    it('converts celsius to fahrenheit correctly', () => {
      const result = convertUnit(0, 'celsius', 'fahrenheit', 'temperature')
      expect(result).toBe(32)
    })

    it('converts fahrenheit to celsius correctly', () => {
      const result = convertUnit(32, 'fahrenheit', 'celsius', 'temperature')
      expect(result).toBe(0)
    })

    it('converts celsius to kelvin correctly', () => {
      const result = convertUnit(0, 'celsius', 'kelvin', 'temperature')
      expect(result).toBe(273.15)
    })

    it('converts kelvin to celsius correctly', () => {
      const result = convertUnit(273.15, 'kelvin', 'celsius', 'temperature')
      expect(result).toBe(0)
    })

    it('converts fahrenheit to kelvin correctly', () => {
      const result = convertUnit(32, 'fahrenheit', 'kelvin', 'temperature')
      expect(result).toBeCloseTo(273.15, 2)
    })

    it('converts water boiling point correctly', () => {
      const result = convertUnit(100, 'celsius', 'fahrenheit', 'temperature')
      expect(result).toBe(212)
    })
  })

  describe('Volume Conversions', () => {
    it('converts liters to gallons correctly', () => {
      const result = convertUnit(1, 'liter', 'gallon', 'volume')
      expect(result).toBeCloseTo(0.264172, 4)
    })

    it('converts milliliters to fluid ounces correctly', () => {
      const result = convertUnit(30, 'milliliter', 'fluidOunce', 'volume')
      expect(result).toBeCloseTo(1.01442, 4)
    })

    it('converts cubic meters to liters correctly', async () => {
      const result = convertUnit(1, 'cubicMeter', 'liter', 'volume')
      expect(result).toBe(1000)
    })
  })

  describe('Area Conversions', () => {
    it('converts square meters to square feet correctly', () => {
      const result = convertUnit(1, 'squareMeter', 'squareFoot', 'area')
      expect(result).toBeCloseTo(10.7639, 4)
    })

    it('converts hectares to acres correctly', () => {
      const result = convertUnit(1, 'hectare', 'acre', 'area')
      expect(result).toBeCloseTo(2.47105, 4)
    })

    it('converts square kilometers to square miles correctly', () => {
      const result = convertUnit(1, 'squareKilometer', 'squareMile', 'area')
      expect(result).toBeCloseTo(0.386102, 4)
    })
  })

  describe('Speed Conversions', () => {
    it('converts meters per second to kilometers per hour correctly', () => {
      const result = convertUnit(1, 'meterPerSecond', 'kilometerPerHour', 'speed')
      expect(result).toBeCloseTo(3.6, 4)
    })

    it('converts miles per hour to kilometers per hour correctly', () => {
      const result = convertUnit(60, 'milePerHour', 'kilometerPerHour', 'speed')
      expect(result).toBeCloseTo(96.5606, 3)
    })

    it('converts knots to miles per hour correctly', () => {
      const result = convertUnit(1, 'knot', 'milePerHour', 'speed')
      expect(result).toBeCloseTo(1.15078, 4)
    })
  })

  describe('Time Conversions', () => {
    it('converts hours to minutes correctly', () => {
      const result = convertUnit(1, 'hour', 'minute', 'time')
      expect(result).toBe(60)
    })

    it('converts days to hours correctly', () => {
      const result = convertUnit(1, 'day', 'hour', 'time')
      expect(result).toBe(24)
    })

    it('converts weeks to days correctly', () => {
      const result = convertUnit(1, 'week', 'day', 'time')
      expect(result).toBe(7)
    })

    it('converts milliseconds to seconds correctly', () => {
      const result = convertUnit(1000, 'millisecond', 'second', 'time')
      expect(result).toBe(1)
    })

    it('converts years to days correctly', () => {
      const result = convertUnit(1, 'year', 'day', 'time')
      expect(result).toBe(365.25)
    })
  })

  describe('Pressure Conversions', () => {
    it('converts pascal to kilopascal correctly', () => {
      const result = convertUnit(1000, 'pascal', 'kilopascal', 'pressure')
      expect(result).toBe(1)
    })

    it('converts bar to atmosphere correctly', () => {
      const result = convertUnit(1, 'bar', 'atmosphere', 'pressure')
      expect(result).toBeCloseTo(0.986923, 4)
    })

    it('converts psi to pascal correctly', () => {
      const result = convertUnit(1, 'psi', 'pascal', 'pressure')
      expect(result).toBeCloseTo(6894.76, 2)
    })
  })

  describe('Energy Conversions', () => {
    it('converts joules to calories correctly', () => {
      const result = convertUnit(1, 'joule', 'calorie', 'energy')
      expect(result).toBeCloseTo(0.239006, 4)
    })

    it('converts kilocalories to kilojoules correctly', () => {
      const result = convertUnit(1, 'kilocalorie', 'kilojoule', 'energy')
      expect(result).toBeCloseTo(4.184, 3)
    })

    it('converts kilowatt-hours to joules correctly', () => {
      const result = convertUnit(1, 'kilowattHour', 'joule', 'energy')
      expect(result).toBe(3600000)
    })
  })

  describe('Power Conversions', () => {
    it('converts watts to kilowatts correctly', () => {
      const result = convertUnit(1000, 'watt', 'kilowatt', 'power')
      expect(result).toBe(1)
    })

    it('converts horsepower to watts correctly', () => {
      const result = convertUnit(1, 'horsepower', 'watt', 'power')
      expect(result).toBeCloseTo(745.7, 1)
    })

    it('converts kilowatts to horsepower correctly', () => {
      const result = convertUnit(1, 'kilowatt', 'horsepower', 'power')
      expect(result).toBeCloseTo(1.34102, 4)
    })
  })

  describe('Digital Storage Conversions', () => {
    it('converts bytes to kilobytes correctly (binary)', () => {
      const result = convertUnit(1024, 'byte', 'kilobyte', 'digital')
      expect(result).toBe(1)
    })

    it('converts megabytes to gigabytes correctly', () => {
      const result = convertUnit(1024, 'megabyte', 'gigabyte', 'digital')
      expect(result).toBe(1)
    })

    it('converts bytes to bits correctly', () => {
      const result = convertUnit(1, 'byte', 'bit', 'digital')
      expect(result).toBe(8)
    })

    it('converts gigabits to megabits correctly', () => {
      const result = convertUnit(1, 'gigabit', 'megabit', 'digital')
      expect(result).toBe(1024)
    })

    it('converts terabytes to gigabytes correctly', () => {
      const result = convertUnit(1, 'terabyte', 'gigabyte', 'digital')
      expect(result).toBe(1024)
    })
  })

  describe('Helper Functions', () => {
    it('getAllCategories returns all 11 categories', () => {
      const categories = getAllCategories()
      expect(categories).toHaveLength(11)
      expect(categories).toContain('length')
      expect(categories).toContain('weight')
      expect(categories).toContain('temperature')
      expect(categories).toContain('volume')
      expect(categories).toContain('area')
      expect(categories).toContain('speed')
      expect(categories).toContain('time')
      expect(categories).toContain('pressure')
      expect(categories).toContain('energy')
      expect(categories).toContain('power')
      expect(categories).toContain('digital')
    })

    it('getUnitsForCategory returns units for length', () => {
      const units = getUnitsForCategory('length')
      expect(units.length).toBeGreaterThan(0)
      expect(units).toContain('meter')
      expect(units).toContain('foot')
      expect(units).toContain('mile')
    })

    it('getUnitsForCategory returns units for temperature', () => {
      const units = getUnitsForCategory('temperature')
      expect(units).toHaveLength(3)
      expect(units).toContain('celsius')
      expect(units).toContain('fahrenheit')
      expect(units).toContain('kelvin')
    })

    it('getUnitInfo returns correct unit information', () => {
      const info = getUnitInfo('length', 'meter')
      expect(info).toBeDefined()
      expect(info?.name).toBe('Meter')
      expect(info?.symbol).toBe('m')
    })

    it('getUnitInfo returns null for invalid unit', () => {
      const info = getUnitInfo('length', 'invalidUnit')
      expect(info).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('handles very large numbers', () => {
      const result = convertUnit(1000000, 'meter', 'kilometer', 'length')
      expect(result).toBe(1000)
    })

    it('handles very small numbers', () => {
      const result = convertUnit(0.001, 'meter', 'millimeter', 'length')
      expect(result).toBe(1)
    })

    it('handles decimal inputs correctly', () => {
      const result = convertUnit(1.5, 'meter', 'foot', 'length')
      expect(result).toBeCloseTo(4.92126, 4)
    })

    it('handles negative temperatures correctly', () => {
      const result = convertUnit(-40, 'celsius', 'fahrenheit', 'temperature')
      expect(result).toBe(-40)
    })
  })

  describe('Bidirectional Conversions', () => {
    it('converts meter to foot and back', () => {
      const feet = convertUnit(1, 'meter', 'foot', 'length')
      const meters = convertUnit(feet, 'foot', 'meter', 'length')
      expect(meters).toBeCloseTo(1, 10)
    })

    it('converts celsius to fahrenheit and back', () => {
      const fahrenheit = convertUnit(25, 'celsius', 'fahrenheit', 'temperature')
      const celsius = convertUnit(fahrenheit, 'fahrenheit', 'celsius', 'temperature')
      expect(celsius).toBeCloseTo(25, 10)
    })

    it('converts kilogram to pound and back', () => {
      const pounds = convertUnit(10, 'kilogram', 'pound', 'weight')
      const kilograms = convertUnit(pounds, 'pound', 'kilogram', 'weight')
      expect(kilograms).toBeCloseTo(10, 10)
    })

    it('converts liter to gallon and back', () => {
      const gallons = convertUnit(5, 'liter', 'gallon', 'volume')
      const liters = convertUnit(gallons, 'gallon', 'liter', 'volume')
      expect(liters).toBeCloseTo(5, 10)
    })
  })
})
