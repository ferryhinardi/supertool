export type UnitCategory =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'volume'
  | 'area'
  | 'speed'
  | 'time'
  | 'pressure'
  | 'energy'
  | 'power'
  | 'digital'

export interface Unit {
  name: string
  symbol: string
  toBase: (value: number) => number
  fromBase: (value: number) => number
}

export interface UnitDefinition {
  category: UnitCategory
  name: string
  units: Record<string, Unit>
}

// Conversion definitions
export const unitDefinitions: Record<UnitCategory, UnitDefinition> = {
  length: {
    category: 'length',
    name: 'Length',
    units: {
      meter: {
        name: 'Meter',
        symbol: 'm',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      kilometer: {
        name: 'Kilometer',
        symbol: 'km',
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      centimeter: {
        name: 'Centimeter',
        symbol: 'cm',
        toBase: (v) => v / 100,
        fromBase: (v) => v * 100,
      },
      millimeter: {
        name: 'Millimeter',
        symbol: 'mm',
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      micrometer: {
        name: 'Micrometer',
        symbol: 'µm',
        toBase: (v) => v / 1_000_000,
        fromBase: (v) => v * 1_000_000,
      },
      nanometer: {
        name: 'Nanometer',
        symbol: 'nm',
        toBase: (v) => v / 1_000_000_000,
        fromBase: (v) => v * 1_000_000_000,
      },
      mile: {
        name: 'Mile',
        symbol: 'mi',
        toBase: (v) => v * 1609.344,
        fromBase: (v) => v / 1609.344,
      },
      yard: {
        name: 'Yard',
        symbol: 'yd',
        toBase: (v) => v * 0.9144,
        fromBase: (v) => v / 0.9144,
      },
      foot: {
        name: 'Foot',
        symbol: 'ft',
        toBase: (v) => v * 0.3048,
        fromBase: (v) => v / 0.3048,
      },
      inch: {
        name: 'Inch',
        symbol: 'in',
        toBase: (v) => v * 0.0254,
        fromBase: (v) => v / 0.0254,
      },
      nauticalMile: {
        name: 'Nautical Mile',
        symbol: 'nmi',
        toBase: (v) => v * 1852,
        fromBase: (v) => v / 1852,
      },
    },
  },
  weight: {
    category: 'weight',
    name: 'Weight / Mass',
    units: {
      kilogram: {
        name: 'Kilogram',
        symbol: 'kg',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      gram: {
        name: 'Gram',
        symbol: 'g',
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      milligram: {
        name: 'Milligram',
        symbol: 'mg',
        toBase: (v) => v / 1_000_000,
        fromBase: (v) => v * 1_000_000,
      },
      metricTon: {
        name: 'Metric Ton',
        symbol: 't',
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      pound: {
        name: 'Pound',
        symbol: 'lb',
        toBase: (v) => v * 0.45359237,
        fromBase: (v) => v / 0.45359237,
      },
      ounce: {
        name: 'Ounce',
        symbol: 'oz',
        toBase: (v) => v * 0.028349523125,
        fromBase: (v) => v / 0.028349523125,
      },
      ton: {
        name: 'Ton (US)',
        symbol: 'ton',
        toBase: (v) => v * 907.18474,
        fromBase: (v) => v / 907.18474,
      },
      stone: {
        name: 'Stone',
        symbol: 'st',
        toBase: (v) => v * 6.35029318,
        fromBase: (v) => v / 6.35029318,
      },
    },
  },
  temperature: {
    category: 'temperature',
    name: 'Temperature',
    units: {
      celsius: {
        name: 'Celsius',
        symbol: '°C',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      fahrenheit: {
        name: 'Fahrenheit',
        symbol: '°F',
        toBase: (v) => ((v - 32) * 5) / 9,
        fromBase: (v) => (v * 9) / 5 + 32,
      },
      kelvin: {
        name: 'Kelvin',
        symbol: 'K',
        toBase: (v) => v - 273.15,
        fromBase: (v) => v + 273.15,
      },
    },
  },
  volume: {
    category: 'volume',
    name: 'Volume',
    units: {
      liter: {
        name: 'Liter',
        symbol: 'L',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      milliliter: {
        name: 'Milliliter',
        symbol: 'mL',
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      cubicMeter: {
        name: 'Cubic Meter',
        symbol: 'm³',
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      cubicCentimeter: {
        name: 'Cubic Centimeter',
        symbol: 'cm³',
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      gallon: {
        name: 'Gallon (US)',
        symbol: 'gal',
        toBase: (v) => v * 3.785411784,
        fromBase: (v) => v / 3.785411784,
      },
      quart: {
        name: 'Quart (US)',
        symbol: 'qt',
        toBase: (v) => v * 0.946352946,
        fromBase: (v) => v / 0.946352946,
      },
      pint: {
        name: 'Pint (US)',
        symbol: 'pt',
        toBase: (v) => v * 0.473176473,
        fromBase: (v) => v / 0.473176473,
      },
      cup: {
        name: 'Cup (US)',
        symbol: 'cup',
        toBase: (v) => v * 0.2365882365,
        fromBase: (v) => v / 0.2365882365,
      },
      fluidOunce: {
        name: 'Fluid Ounce (US)',
        symbol: 'fl oz',
        toBase: (v) => v * 0.0295735295625,
        fromBase: (v) => v / 0.0295735295625,
      },
      tablespoon: {
        name: 'Tablespoon',
        symbol: 'tbsp',
        toBase: (v) => v * 0.01478676478125,
        fromBase: (v) => v / 0.01478676478125,
      },
      teaspoon: {
        name: 'Teaspoon',
        symbol: 'tsp',
        toBase: (v) => v * 0.00492892159375,
        fromBase: (v) => v / 0.00492892159375,
      },
    },
  },
  area: {
    category: 'area',
    name: 'Area',
    units: {
      squareMeter: {
        name: 'Square Meter',
        symbol: 'm²',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      squareKilometer: {
        name: 'Square Kilometer',
        symbol: 'km²',
        toBase: (v) => v * 1_000_000,
        fromBase: (v) => v / 1_000_000,
      },
      squareCentimeter: {
        name: 'Square Centimeter',
        symbol: 'cm²',
        toBase: (v) => v / 10_000,
        fromBase: (v) => v * 10_000,
      },
      squareMillimeter: {
        name: 'Square Millimeter',
        symbol: 'mm²',
        toBase: (v) => v / 1_000_000,
        fromBase: (v) => v * 1_000_000,
      },
      hectare: {
        name: 'Hectare',
        symbol: 'ha',
        toBase: (v) => v * 10_000,
        fromBase: (v) => v / 10_000,
      },
      acre: {
        name: 'Acre',
        symbol: 'ac',
        toBase: (v) => v * 4046.8564224,
        fromBase: (v) => v / 4046.8564224,
      },
      squareMile: {
        name: 'Square Mile',
        symbol: 'mi²',
        toBase: (v) => v * 2_589_988.110336,
        fromBase: (v) => v / 2_589_988.110336,
      },
      squareYard: {
        name: 'Square Yard',
        symbol: 'yd²',
        toBase: (v) => v * 0.83612736,
        fromBase: (v) => v / 0.83612736,
      },
      squareFoot: {
        name: 'Square Foot',
        symbol: 'ft²',
        toBase: (v) => v * 0.09290304,
        fromBase: (v) => v / 0.09290304,
      },
      squareInch: {
        name: 'Square Inch',
        symbol: 'in²',
        toBase: (v) => v * 0.00064516,
        fromBase: (v) => v / 0.00064516,
      },
    },
  },
  speed: {
    category: 'speed',
    name: 'Speed',
    units: {
      meterPerSecond: {
        name: 'Meter per Second',
        symbol: 'm/s',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      kilometerPerHour: {
        name: 'Kilometer per Hour',
        symbol: 'km/h',
        toBase: (v) => v / 3.6,
        fromBase: (v) => v * 3.6,
      },
      milePerHour: {
        name: 'Mile per Hour',
        symbol: 'mph',
        toBase: (v) => v * 0.44704,
        fromBase: (v) => v / 0.44704,
      },
      footPerSecond: {
        name: 'Foot per Second',
        symbol: 'ft/s',
        toBase: (v) => v * 0.3048,
        fromBase: (v) => v / 0.3048,
      },
      knot: {
        name: 'Knot',
        symbol: 'kn',
        toBase: (v) => v * 0.514444,
        fromBase: (v) => v / 0.514444,
      },
      mach: {
        name: 'Mach',
        symbol: 'Ma',
        toBase: (v) => v * 343,
        fromBase: (v) => v / 343,
      },
    },
  },
  time: {
    category: 'time',
    name: 'Time',
    units: {
      second: {
        name: 'Second',
        symbol: 's',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      millisecond: {
        name: 'Millisecond',
        symbol: 'ms',
        toBase: (v) => v / 1000,
        fromBase: (v) => v * 1000,
      },
      microsecond: {
        name: 'Microsecond',
        symbol: 'µs',
        toBase: (v) => v / 1_000_000,
        fromBase: (v) => v * 1_000_000,
      },
      nanosecond: {
        name: 'Nanosecond',
        symbol: 'ns',
        toBase: (v) => v / 1_000_000_000,
        fromBase: (v) => v * 1_000_000_000,
      },
      minute: {
        name: 'Minute',
        symbol: 'min',
        toBase: (v) => v * 60,
        fromBase: (v) => v / 60,
      },
      hour: {
        name: 'Hour',
        symbol: 'h',
        toBase: (v) => v * 3600,
        fromBase: (v) => v / 3600,
      },
      day: {
        name: 'Day',
        symbol: 'd',
        toBase: (v) => v * 86400,
        fromBase: (v) => v / 86400,
      },
      week: {
        name: 'Week',
        symbol: 'wk',
        toBase: (v) => v * 604800,
        fromBase: (v) => v / 604800,
      },
      month: {
        name: 'Month',
        symbol: 'mo',
        toBase: (v) => v * 2629800, // Average month (30.44 days)
        fromBase: (v) => v / 2629800,
      },
      year: {
        name: 'Year',
        symbol: 'yr',
        toBase: (v) => v * 31557600, // 365.25 days
        fromBase: (v) => v / 31557600,
      },
    },
  },
  pressure: {
    category: 'pressure',
    name: 'Pressure',
    units: {
      pascal: {
        name: 'Pascal',
        symbol: 'Pa',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      kilopascal: {
        name: 'Kilopascal',
        symbol: 'kPa',
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      bar: {
        name: 'Bar',
        symbol: 'bar',
        toBase: (v) => v * 100_000,
        fromBase: (v) => v / 100_000,
      },
      atmosphere: {
        name: 'Atmosphere',
        symbol: 'atm',
        toBase: (v) => v * 101_325,
        fromBase: (v) => v / 101_325,
      },
      psi: {
        name: 'PSI',
        symbol: 'psi',
        toBase: (v) => v * 6894.757293168,
        fromBase: (v) => v / 6894.757293168,
      },
      torr: {
        name: 'Torr',
        symbol: 'Torr',
        toBase: (v) => v * 133.322,
        fromBase: (v) => v / 133.322,
      },
    },
  },
  energy: {
    category: 'energy',
    name: 'Energy',
    units: {
      joule: {
        name: 'Joule',
        symbol: 'J',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      kilojoule: {
        name: 'Kilojoule',
        symbol: 'kJ',
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      calorie: {
        name: 'Calorie',
        symbol: 'cal',
        toBase: (v) => v * 4.184,
        fromBase: (v) => v / 4.184,
      },
      kilocalorie: {
        name: 'Kilocalorie',
        symbol: 'kcal',
        toBase: (v) => v * 4184,
        fromBase: (v) => v / 4184,
      },
      wattHour: {
        name: 'Watt-hour',
        symbol: 'Wh',
        toBase: (v) => v * 3600,
        fromBase: (v) => v / 3600,
      },
      kilowattHour: {
        name: 'Kilowatt-hour',
        symbol: 'kWh',
        toBase: (v) => v * 3_600_000,
        fromBase: (v) => v / 3_600_000,
      },
      electronvolt: {
        name: 'Electronvolt',
        symbol: 'eV',
        toBase: (v) => v * 1.602176634e-19,
        fromBase: (v) => v / 1.602176634e-19,
      },
      btu: {
        name: 'BTU',
        symbol: 'BTU',
        toBase: (v) => v * 1055.06,
        fromBase: (v) => v / 1055.06,
      },
    },
  },
  power: {
    category: 'power',
    name: 'Power',
    units: {
      watt: {
        name: 'Watt',
        symbol: 'W',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      kilowatt: {
        name: 'Kilowatt',
        symbol: 'kW',
        toBase: (v) => v * 1000,
        fromBase: (v) => v / 1000,
      },
      megawatt: {
        name: 'Megawatt',
        symbol: 'MW',
        toBase: (v) => v * 1_000_000,
        fromBase: (v) => v / 1_000_000,
      },
      horsepower: {
        name: 'Horsepower',
        symbol: 'hp',
        toBase: (v) => v * 745.699872,
        fromBase: (v) => v / 745.699872,
      },
      btuPerHour: {
        name: 'BTU per Hour',
        symbol: 'BTU/h',
        toBase: (v) => v * 0.29307107,
        fromBase: (v) => v / 0.29307107,
      },
    },
  },
  digital: {
    category: 'digital',
    name: 'Digital Storage',
    units: {
      byte: {
        name: 'Byte',
        symbol: 'B',
        toBase: (v) => v,
        fromBase: (v) => v,
      },
      kilobyte: {
        name: 'Kilobyte',
        symbol: 'KB',
        toBase: (v) => v * 1024,
        fromBase: (v) => v / 1024,
      },
      megabyte: {
        name: 'Megabyte',
        symbol: 'MB',
        toBase: (v) => v * 1024 * 1024,
        fromBase: (v) => v / (1024 * 1024),
      },
      gigabyte: {
        name: 'Gigabyte',
        symbol: 'GB',
        toBase: (v) => v * 1024 * 1024 * 1024,
        fromBase: (v) => v / (1024 * 1024 * 1024),
      },
      terabyte: {
        name: 'Terabyte',
        symbol: 'TB',
        toBase: (v) => v * 1024 * 1024 * 1024 * 1024,
        fromBase: (v) => v / (1024 * 1024 * 1024 * 1024),
      },
      petabyte: {
        name: 'Petabyte',
        symbol: 'PB',
        toBase: (v) => v * 1024 * 1024 * 1024 * 1024 * 1024,
        fromBase: (v) => v / (1024 * 1024 * 1024 * 1024 * 1024),
      },
      bit: {
        name: 'Bit',
        symbol: 'bit',
        toBase: (v) => v / 8,
        fromBase: (v) => v * 8,
      },
      kilobit: {
        name: 'Kilobit',
        symbol: 'Kb',
        toBase: (v) => (v * 1024) / 8,
        fromBase: (v) => (v * 8) / 1024,
      },
      megabit: {
        name: 'Megabit',
        symbol: 'Mb',
        toBase: (v) => (v * 1024 * 1024) / 8,
        fromBase: (v) => (v * 8) / (1024 * 1024),
      },
      gigabit: {
        name: 'Gigabit',
        symbol: 'Gb',
        toBase: (v) => (v * 1024 * 1024 * 1024) / 8,
        fromBase: (v) => (v * 8) / (1024 * 1024 * 1024),
      },
    },
  },
}

export function convertUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  category: UnitCategory
): number {
  if (fromUnit === toUnit) return value

  const categoryDef = unitDefinitions[category]
  const from = categoryDef.units[fromUnit]
  const to = categoryDef.units[toUnit]

  if (!from || !to) {
    throw new Error(`Invalid units for category ${category}`)
  }

  // Convert to base unit, then to target unit
  const baseValue = from.toBase(value)
  return to.fromBase(baseValue)
}

export function getAllCategories(): UnitCategory[] {
  return Object.keys(unitDefinitions) as UnitCategory[]
}

export function getUnitsForCategory(category: UnitCategory): string[] {
  return Object.keys(unitDefinitions[category].units)
}

export function getUnitInfo(category: UnitCategory, unit: string): Unit | null {
  return unitDefinitions[category].units[unit] || null
}
