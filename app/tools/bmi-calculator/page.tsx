'use client'

import { useState } from 'react'
import { Activity, Scale, Ruler, TrendingUp, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Field, FieldLabel } from '@/components/ui/field'
import { css } from '@/styled-system/css'
import { trackEvent } from '@/lib/analytics'

interface BMIResult {
  bmi: number
  category: string
  color: string
  healthTips: string[]
  idealWeightRange: [number, number]
}

interface BMIHistory {
  date: string
  bmi: number
  weight: number
  height: number
  isMetric: boolean
}

export default function BMICalculator() {
  const [isMetric, setIsMetric] = useState(true)
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [result, setResult] = useState<BMIResult | null>(null)
  const [history, setHistory] = useState<BMIHistory[]>(() => {
    // Load history from localStorage on initial mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bmi-history')
      return saved ? JSON.parse(saved) : []
    }
    return []
  })

  const calculateBMI = (weight: number, height: number, isMetric: boolean): number => {
    if (isMetric) {
      const heightInMeters = height / 100
      return weight / (heightInMeters * heightInMeters)
    } else {
      return (weight / (height * height)) * 703
    }
  }

  const getCategory = (bmi: number): { category: string; color: string; healthTips: string[] } => {
    if (bmi < 18.5) {
      return {
        category: 'Underweight',
        color: 'blue',
        healthTips: [
          'Consult with a healthcare provider to determine if your weight is healthy for you',
          'Focus on nutrient-dense foods to gain weight healthily',
          'Include protein-rich foods, healthy fats, and complex carbohydrates',
          'Consider strength training to build muscle mass',
          'Eat more frequent, smaller meals throughout the day',
        ],
      }
    } else if (bmi < 25) {
      return {
        category: 'Normal Weight',
        color: 'green',
        healthTips: [
          'Maintain your healthy weight through balanced diet and regular exercise',
          'Aim for at least 150 minutes of moderate aerobic activity per week',
          'Include a variety of fruits, vegetables, whole grains, and lean proteins',
          'Stay hydrated by drinking plenty of water',
          'Get adequate sleep (7-9 hours per night) for overall health',
        ],
      }
    } else if (bmi < 30) {
      return {
        category: 'Overweight',
        color: 'yellow',
        healthTips: [
          'Consider a gradual weight loss of 1-2 pounds per week',
          'Increase physical activity to at least 300 minutes per week',
          'Reduce portion sizes and limit high-calorie foods',
          'Choose whole grains over refined carbohydrates',
          'Consult a healthcare provider for personalized weight management advice',
        ],
      }
    } else {
      return {
        category: 'Obese',
        color: 'red',
        healthTips: [
          'Consult with a healthcare provider for a comprehensive weight management plan',
          'Consider working with a registered dietitian for nutrition guidance',
          'Start with moderate physical activity and gradually increase intensity',
          'Focus on sustainable lifestyle changes rather than quick fixes',
          'Monitor for obesity-related health conditions (diabetes, heart disease, etc.)',
        ],
      }
    }
  }

  const getIdealWeightRange = (height: number, isMetric: boolean): [number, number] => {
    const heightInMeters = isMetric ? height / 100 : height * 0.0254
    const minWeight = 18.5 * (heightInMeters * heightInMeters)
    const maxWeight = 24.9 * (heightInMeters * heightInMeters)

    if (!isMetric) {
      return [minWeight * 2.20462, maxWeight * 2.20462]
    }
    return [minWeight, maxWeight]
  }

  const handleCalculate = () => {
    const weightNum = parseFloat(weight)
    let heightNum: number

    if (isMetric) {
      heightNum = parseFloat(height)
    } else {
      const feet = parseFloat(heightFeet)
      const inches = parseFloat(heightInches)
      heightNum = feet * 12 + inches
    }

    if (!weightNum || weightNum <= 0 || !heightNum || heightNum <= 0) {
      return
    }

    const bmi = calculateBMI(weightNum, heightNum, isMetric)
    const categoryData = getCategory(bmi)
    const idealWeightRange = getIdealWeightRange(heightNum, isMetric)

    const newResult: BMIResult = {
      bmi,
      category: categoryData.category,
      color: categoryData.color,
      healthTips: categoryData.healthTips,
      idealWeightRange,
    }

    setResult(newResult)

    // Save to history
    const newHistory: BMIHistory = {
      date: new Date().toISOString(),
      bmi,
      weight: weightNum,
      height: heightNum,
      isMetric,
    }
    const updatedHistory = [newHistory, ...history].slice(0, 10) // Keep last 10
    setHistory(updatedHistory)
    localStorage.setItem('bmi-history', JSON.stringify(updatedHistory))

    trackEvent({
      action: 'bmi_calculator_calculate',
      category: 'BMI Calculator',
      label: categoryData.category,
      value: Math.round(bmi),
    })
  }

  const handleReset = () => {
    setWeight('')
    setHeight('')
    setHeightFeet('')
    setHeightInches('')
    setResult(null)
    trackEvent({
      action: 'bmi_calculator_reset',
      category: 'BMI Calculator',
    })
  }

  const handleUnitToggle = () => {
    setIsMetric(!isMetric)
    setWeight('')
    setHeight('')
    setHeightFeet('')
    setHeightInches('')
    setResult(null)
    trackEvent({
      action: 'bmi_calculator_unit_toggle',
      category: 'BMI Calculator',
      label: !isMetric ? 'metric' : 'imperial',
    })
  }

  const handleExport = () => {
    if (!result) return

    const exportData = {
      date: new Date().toISOString(),
      bmi: result.bmi.toFixed(1),
      category: result.category,
      weight: `${weight}${isMetric ? 'kg' : 'lbs'}`,
      height: isMetric ? `${height}cm` : `${heightFeet}'${heightInches}"`,
      idealWeightRange: `${result.idealWeightRange[0].toFixed(1)}-${result.idealWeightRange[1].toFixed(1)}${isMetric ? 'kg' : 'lbs'}`,
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bmi-result-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)

    trackEvent({
      action: 'bmi_calculator_export',
      category: 'BMI Calculator',
      label: result.category,
    })
  }

  const getBMIPosition = (bmi: number): string => {
    if (bmi < 15) return '0%'
    if (bmi > 40) return '100%'
    const position = ((bmi - 15) / 25) * 100
    return `${Math.min(Math.max(position, 0), 100)}%`
  }

  return (
    <main
      className={css({
        maxWidth: '1200px',
        margin: '0 auto',
        padding: { base: '1rem', md: '2rem' },
      })}
    >
      <div
        className={css({
          marginBottom: '2rem',
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '0.5rem',
          })}
        >
          <Activity
            className={css({
              width: '2rem',
              height: '2rem',
              color: 'green.500',
            })}
          />
          <h1
            className={css({
              fontSize: '2rem',
              fontWeight: 'bold',
              color: 'gray.900',
              _dark: { color: 'gray.100' },
            })}
          >
            BMI & Health Calculator
          </h1>
        </div>
        <p
          className={css({
            color: 'gray.600',
            _dark: { color: 'gray.400' },
          })}
        >
          Calculate your Body Mass Index and get personalized health insights
        </p>
      </div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '1fr 1fr' },
          gap: '2rem',
        })}
      >
        {/* Input Section */}
        <div>
          <Card
            className={css({
              padding: '1.5rem',
              marginBottom: '1.5rem',
            })}
          >
            <div
              className={css({
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              })}
            >
              <h2
                className={css({
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'gray.900',
                  _dark: { color: 'gray.100' },
                })}
              >
                Enter Your Details
              </h2>
              <Button onClick={handleUnitToggle} variant="outline" size="sm">
                {isMetric ? 'Metric' : 'Imperial'}
              </Button>
            </div>

            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              })}
            >
              <Field>
                <FieldLabel>{`Weight (${isMetric ? 'kg' : 'lbs'})`}</FieldLabel>
                <div
                  className={css({
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'center',
                  })}
                >
                  <Scale
                    className={css({
                      width: '1.25rem',
                      height: '1.25rem',
                      color: 'gray.500',
                    })}
                  />
                  <Input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={`Enter weight in ${isMetric ? 'kg' : 'lbs'}`}
                    min="0"
                    step="0.1"
                  />
                </div>
              </Field>

              {isMetric ? (
                <Field>
                  <FieldLabel>Height (cm)</FieldLabel>
                  <div
                    className={css({
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                    })}
                  >
                    <Ruler
                      className={css({
                        width: '1.25rem',
                        height: '1.25rem',
                        color: 'gray.500',
                      })}
                    />
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="Enter height in cm"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </Field>
              ) : (
                <Field>
                  <FieldLabel>Height (feet & inches)</FieldLabel>
                  <div
                    className={css({
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                    })}
                  >
                    <Ruler
                      className={css({
                        width: '1.25rem',
                        height: '1.25rem',
                        color: 'gray.500',
                      })}
                    />
                    <Input
                      type="number"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      placeholder="Feet"
                      min="0"
                      step="1"
                      className={css({ flex: '1' })}
                    />
                    <Input
                      type="number"
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      placeholder="Inches"
                      min="0"
                      max="11"
                      step="0.1"
                      className={css({ flex: '1' })}
                    />
                  </div>
                </Field>
              )}
            </div>

            <div
              className={css({
                display: 'flex',
                gap: '0.75rem',
                marginTop: '1.5rem',
              })}
            >
              <Button onClick={handleCalculate} className={css({ flex: '1' })}>
                Calculate BMI
              </Button>
              <Button onClick={handleReset} variant="outline">
                Reset
              </Button>
            </div>
          </Card>

          {/* BMI Chart */}
          <Card
            className={css({
              padding: '1.5rem',
            })}
          >
            <h2
              className={css({
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'gray.900',
                _dark: { color: 'gray.100' },
                marginBottom: '1rem',
              })}
            >
              BMI Classification Chart
            </h2>

            <div
              className={css({
                marginBottom: '1.5rem',
              })}
            >
              <div
                className={css({
                  height: '2rem',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  display: 'flex',
                  marginBottom: '0.5rem',
                })}
              >
                <div
                  className={css({
                    flex: '1',
                    backgroundColor: 'blue.400',
                  })}
                />
                <div
                  className={css({
                    flex: '1',
                    backgroundColor: 'green.400',
                  })}
                />
                <div
                  className={css({
                    flex: '1',
                    backgroundColor: 'yellow.400',
                  })}
                />
                <div
                  className={css({
                    flex: '1',
                    backgroundColor: 'red.400',
                  })}
                />
              </div>

              {result && (
                <div
                  className={css({
                    position: 'relative',
                    height: '2rem',
                  })}
                >
                  <div
                    className={css({
                      position: 'absolute',
                      top: '0',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    })}
                    style={{ left: getBMIPosition(result.bmi) }}
                  >
                    <TrendingUp
                      className={css({
                        width: '1.5rem',
                        height: '1.5rem',
                        color: 'gray.900',
                        _dark: { color: 'gray.100' },
                      })}
                    />
                    <span
                      className={css({
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'gray.900',
                        _dark: { color: 'gray.100' },
                      })}
                    >
                      {result.bmi.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div
              className={css({
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.875rem',
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                })}
              >
                <span
                  className={css({
                    color: 'gray.600',
                    _dark: { color: 'gray.400' },
                  })}
                >
                  Underweight
                </span>
                <span
                  className={css({
                    color: 'gray.900',
                    _dark: { color: 'gray.100' },
                  })}
                >
                  &lt; 18.5
                </span>
              </div>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                })}
              >
                <span
                  className={css({
                    color: 'gray.600',
                    _dark: { color: 'gray.400' },
                  })}
                >
                  Normal Weight
                </span>
                <span
                  className={css({
                    color: 'gray.900',
                    _dark: { color: 'gray.100' },
                  })}
                >
                  18.5 - 24.9
                </span>
              </div>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                })}
              >
                <span
                  className={css({
                    color: 'gray.600',
                    _dark: { color: 'gray.400' },
                  })}
                >
                  Overweight
                </span>
                <span
                  className={css({
                    color: 'gray.900',
                    _dark: { color: 'gray.100' },
                  })}
                >
                  25 - 29.9
                </span>
              </div>
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                })}
              >
                <span
                  className={css({
                    color: 'gray.600',
                    _dark: { color: 'gray.400' },
                  })}
                >
                  Obese
                </span>
                <span
                  className={css({
                    color: 'gray.900',
                    _dark: { color: 'gray.100' },
                  })}
                >
                  ≥ 30
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Results Section */}
        <div>
          {result ? (
            <>
              <Card
                className={css({
                  padding: '1.5rem',
                  marginBottom: '1.5rem',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  })}
                >
                  <h2
                    className={css({
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: 'gray.900',
                      _dark: { color: 'gray.100' },
                    })}
                  >
                    Your Results
                  </h2>
                  <Button onClick={handleExport} variant="outline" size="sm">
                    Export
                  </Button>
                </div>

                <div
                  className={css({
                    textAlign: 'center',
                    padding: '2rem 0',
                    borderBottom: '1px solid',
                    borderColor: 'gray.200',
                    _dark: { borderColor: 'gray.700' },
                    marginBottom: '1.5rem',
                  })}
                >
                  <div
                    className={css({
                      fontSize: '3rem',
                      fontWeight: 'bold',
                      color: 'gray.900',
                      _dark: { color: 'gray.100' },
                      marginBottom: '0.5rem',
                    })}
                  >
                    {result.bmi.toFixed(1)}
                  </div>
                  <Badge
                    className={css({
                      fontSize: '1rem',
                      padding: '0.5rem 1rem',
                    })}
                  >
                    {result.category}
                  </Badge>
                </div>

                <div
                  className={css({
                    marginBottom: '1.5rem',
                  })}
                >
                  <h3
                    className={css({
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: 'gray.900',
                      _dark: { color: 'gray.100' },
                      marginBottom: '0.5rem',
                    })}
                  >
                    Ideal Weight Range
                  </h3>
                  <p
                    className={css({
                      fontSize: '1.25rem',
                      color: 'green.600',
                      _dark: { color: 'green.400' },
                      fontWeight: '600',
                    })}
                  >
                    {result.idealWeightRange[0].toFixed(1)} -{' '}
                    {result.idealWeightRange[1].toFixed(1)} {isMetric ? 'kg' : 'lbs'}
                  </p>
                  <p
                    className={css({
                      fontSize: '0.875rem',
                      color: 'gray.600',
                      _dark: { color: 'gray.400' },
                      marginTop: '0.25rem',
                    })}
                  >
                    For your height of {isMetric ? `${height}cm` : `${heightFeet}'${heightInches}"`}
                  </p>
                </div>
              </Card>

              <Card
                className={css({
                  padding: '1.5rem',
                })}
              >
                <div
                  className={css({
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                  })}
                >
                  <Info
                    className={css({
                      width: '1.25rem',
                      height: '1.25rem',
                      color: 'blue.500',
                      flexShrink: '0',
                      marginTop: '0.25rem',
                    })}
                  />
                  <h2
                    className={css({
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: 'gray.900',
                      _dark: { color: 'gray.100' },
                    })}
                  >
                    Health Tips & Recommendations
                  </h2>
                </div>

                <ul
                  className={css({
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    paddingLeft: '1.5rem',
                  })}
                >
                  {result.healthTips.map((tip, index) => (
                    <li
                      key={index}
                      className={css({
                        color: 'gray.700',
                        _dark: { color: 'gray.300' },
                        lineHeight: '1.6',
                      })}
                    >
                      {tip}
                    </li>
                  ))}
                </ul>

                <div
                  className={css({
                    marginTop: '1.5rem',
                    padding: '1rem',
                    backgroundColor: 'blue.50',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    color: 'gray.700',
                    _dark: { backgroundColor: 'blue.900/20', color: 'gray.300' },
                  })}
                >
                  <strong>Note:</strong> BMI is a screening tool and does not diagnose health
                  conditions. Factors like muscle mass, bone density, and overall body composition
                  are not considered. Always consult with a healthcare professional for personalized
                  health advice.
                </div>
              </Card>

              {history.length > 0 && (
                <Card
                  className={css({
                    padding: '1.5rem',
                    marginTop: '1.5rem',
                  })}
                >
                  <h2
                    className={css({
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: 'gray.900',
                      _dark: { color: 'gray.100' },
                      marginBottom: '1rem',
                    })}
                  >
                    Recent History
                  </h2>

                  <div
                    className={css({
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.75rem',
                    })}
                  >
                    {history.slice(0, 5).map((entry, index) => (
                      <div
                        key={index}
                        className={css({
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          backgroundColor: 'gray.50',
                          _dark: { backgroundColor: 'gray.800' },
                          borderRadius: '0.375rem',
                        })}
                      >
                        <div>
                          <div
                            className={css({
                              fontSize: '0.875rem',
                              color: 'gray.600',
                              _dark: { color: 'gray.400' },
                            })}
                          >
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                          <div
                            className={css({
                              fontSize: '0.875rem',
                              color: 'gray.700',
                              _dark: { color: 'gray.300' },
                            })}
                          >
                            {entry.weight}
                            {entry.isMetric ? 'kg' : 'lbs'} • {entry.height}
                            {entry.isMetric ? 'cm' : '"'}
                          </div>
                        </div>
                        <div
                          className={css({
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: 'gray.900',
                            _dark: { color: 'gray.100' },
                          })}
                        >
                          {entry.bmi.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          ) : (
            <Card
              className={css({
                padding: '3rem 1.5rem',
                textAlign: 'center',
              })}
            >
              <Activity
                className={css({
                  width: '4rem',
                  height: '4rem',
                  color: 'gray.300',
                  _dark: { color: 'gray.600' },
                  margin: '0 auto 1rem',
                })}
              />
              <h3
                className={css({
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: 'gray.900',
                  _dark: { color: 'gray.100' },
                  marginBottom: '0.5rem',
                })}
              >
                Calculate Your BMI
              </h3>
              <p
                className={css({
                  color: 'gray.600',
                  _dark: { color: 'gray.400' },
                })}
              >
                Enter your weight and height to get started
              </p>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
