'use client'

import { Activity, Info, Ruler, Scale, Sparkles, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { RelatedTools } from '@/components/ui/related-tools'
import { SocialShare } from '@/components/ui/social-share'
import { ToolRating } from '@/components/ui/tool-rating'
import { ToolSearch } from '@/components/ui/tool-search'
import { trackEvent } from '@/lib/services/analytics'
import { css } from '@/styled-system/css'

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
        mx: 'auto',
        maxW: '7xl',
        w: 'full',
        px: { base: '4', sm: '6', md: '8' },
        py: { base: '6', sm: '8', md: '10' },
        spaceY: { base: '6', sm: '8', md: '10' },
      })}
    >
      {/* Header */}
      <div
        className={css({
          textAlign: 'center',
          spaceY: '4',
          animation: 'slideUp 0.5s ease-out forwards',
          opacity: 0,
        })}
      >
        <div
          className={css({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3',
            marginBottom: '4',
          })}
        >
          <Activity
            className={css({
              width: '2rem',
              height: '2rem',
              color: 'green.400',
            })}
          />
          <h1
            className={css({
              fontSize: { base: '3xl', sm: '4xl', md: '5xl' },
              fontWeight: 'extrabold',
              bgGradient: 'to-r',
              gradientFrom: 'green.400',
              gradientVia: 'emerald.400',
              gradientTo: 'teal.400',
              bgClip: 'text',
            })}
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            BMI & Health Calculator
          </h1>
        </div>
        <p
          className={css({
            mx: 'auto',
            maxW: '3xl',
            fontSize: { base: 'base', sm: 'lg' },
            color: 'white',
          })}
        >
          Calculate your Body Mass Index and get personalized health insights
        </p>
      </div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '1fr 1fr' },
          gap: { base: '6', lg: '8' },
        })}
      >
        {/* Input Section */}
        <div className={css({ spaceY: '6' })}>
          <div
            className={css({
              animation: 'slideUp 0.5s ease-out forwards',
              animationDelay: '0.1s',
              opacity: 0,
            })}
          >
            <Card
              className={css({
                padding: '6',
                border: '1px solid',
                borderColor: 'green.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <div
                className={css({
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '6',
                })}
              >
                <h2
                  className={css({
                    fontSize: 'xl',
                    fontWeight: 'semibold',
                    color: 'gray.100',
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
                  gap: '6',
                })}
              >
                <Field>
                  <FieldLabel
                    className={css({
                      color: 'white',
                    })}
                  >{`Weight (${isMetric ? 'kg' : 'lbs'})`}</FieldLabel>
                  <div
                    className={css({
                      display: 'flex',
                      gap: '2',
                      alignItems: 'center',
                    })}
                  >
                    <Scale
                      className={css({
                        width: '5',
                        height: '5',
                        color: 'white',
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
                    <FieldLabel
                      className={css({
                        color: 'white',
                      })}
                    >
                      Height (cm)
                    </FieldLabel>
                    <div
                      className={css({
                        display: 'flex',
                        gap: '2',
                        alignItems: 'center',
                      })}
                    >
                      <Ruler
                        className={css({
                          width: '5',
                          height: '5',
                          color: 'white',
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
                    <FieldLabel
                      className={css({
                        color: 'white',
                      })}
                    >
                      Height (feet & inches)
                    </FieldLabel>
                    <div
                      className={css({
                        display: 'flex',
                        gap: '2',
                        alignItems: 'center',
                      })}
                    >
                      <Ruler
                        className={css({
                          width: '5',
                          height: '5',
                          color: 'white',
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
                  gap: '3',
                  marginTop: '6',
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
          </div>

          {/* BMI Chart */}
          <div
            className={css({
              animation: 'slideUp 0.5s ease-out forwards',
              animationDelay: '0.2s',
              opacity: 0,
            })}
          >
            <Card
              className={css({
                padding: '6',
                border: '1px solid',
                borderColor: 'green.500/20',
                bg: 'gray.900/50',
                backdropFilter: 'blur(16px)',
              })}
            >
              <h2
                className={css({
                  fontSize: 'xl',
                  fontWeight: 'semibold',
                  color: 'gray.100',
                  marginBottom: '4',
                })}
              >
                BMI Classification Chart
              </h2>

              <div
                className={css({
                  marginBottom: '6',
                })}
              >
                <div
                  className={css({
                    height: '8',
                    borderRadius: 'lg',
                    overflow: 'hidden',
                    display: 'flex',
                    marginBottom: '2',
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
                      height: '8',
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
                          width: '6',
                          height: '6',
                          color: 'gray.100',
                        })}
                      />
                      <span
                        className={css({
                          fontSize: 'sm',
                          fontWeight: 'semibold',
                          color: 'gray.100',
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
                  gap: '2',
                  fontSize: 'sm',
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
                      color: 'white',
                    })}
                  >
                    Underweight
                  </span>
                  <span
                    className={css({
                      color: 'gray.200',
                      fontWeight: 'medium',
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
                      color: 'white',
                    })}
                  >
                    Normal Weight
                  </span>
                  <span
                    className={css({
                      color: 'gray.200',
                      fontWeight: 'medium',
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
                      color: 'white',
                    })}
                  >
                    Overweight
                  </span>
                  <span
                    className={css({
                      color: 'gray.200',
                      fontWeight: 'medium',
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
                      color: 'white',
                    })}
                  >
                    Obese
                  </span>
                  <span
                    className={css({
                      color: 'gray.200',
                      fontWeight: 'medium',
                    })}
                  >
                    ≥ 30
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Results Section */}
        <div className={css({ spaceY: '6' })}>
          {result ? (
            <>
              <div
                className={css({
                  animation: 'slideUp 0.5s ease-out forwards',
                  animationDelay: '0.3s',
                  opacity: 0,
                })}
              >
                <Card
                  className={css({
                    padding: '6',
                    border: '1px solid',
                    borderColor: 'green.500/20',
                    bg: 'gray.900/50',
                    backdropFilter: 'blur(16px)',
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4',
                    })}
                  >
                    <h2
                      className={css({
                        fontSize: 'xl',
                        fontWeight: 'semibold',
                        color: 'gray.100',
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
                      padding: '8 0',
                      borderBottom: '1px solid',
                      borderColor: 'gray.700',
                      marginBottom: '6',
                    })}
                  >
                    <div
                      className={css({
                        fontSize: '5xl',
                        fontWeight: 'bold',
                        color: 'gray.100',
                        marginBottom: '2',
                      })}
                    >
                      {result.bmi.toFixed(1)}
                    </div>
                    <Badge
                      className={css({
                        fontSize: 'base',
                        padding: '2 4',
                      })}
                    >
                      {result.category}
                    </Badge>
                  </div>

                  <div
                    className={css({
                      marginBottom: '6',
                    })}
                  >
                    <h3
                      className={css({
                        fontSize: 'base',
                        fontWeight: 'semibold',
                        color: 'gray.200',
                        marginBottom: '2',
                      })}
                    >
                      Ideal Weight Range
                    </h3>
                    <p
                      className={css({
                        fontSize: 'xl',
                        color: 'green.400',
                        fontWeight: 'semibold',
                      })}
                    >
                      {result.idealWeightRange[0].toFixed(1)} -{' '}
                      {result.idealWeightRange[1].toFixed(1)} {isMetric ? 'kg' : 'lbs'}
                    </p>
                    <p
                      className={css({
                        fontSize: 'sm',
                        color: 'white',
                        marginTop: '1',
                      })}
                    >
                      For your height of{' '}
                      {isMetric ? `${height}cm` : `${heightFeet}'${heightInches}"`}
                    </p>
                  </div>
                </Card>
              </div>

              <div
                className={css({
                  animation: 'slideUp 0.5s ease-out forwards',
                  animationDelay: '0.4s',
                  opacity: 0,
                })}
              >
                <Card
                  className={css({
                    padding: '6',
                    border: '1px solid',
                    borderColor: 'green.500/20',
                    bg: 'gray.900/50',
                    backdropFilter: 'blur(16px)',
                  })}
                >
                  <div
                    className={css({
                      display: 'flex',
                      gap: '2',
                      alignItems: 'flex-start',
                      marginBottom: '4',
                    })}
                  >
                    <Info
                      className={css({
                        width: '5',
                        height: '5',
                        color: 'blue.400',
                        flexShrink: '0',
                        marginTop: '1',
                      })}
                    />
                    <h2
                      className={css({
                        fontSize: 'xl',
                        fontWeight: 'semibold',
                        color: 'gray.100',
                      })}
                    >
                      Health Tips & Recommendations
                    </h2>
                  </div>

                  <ul
                    className={css({
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '3',
                      paddingLeft: '6',
                    })}
                  >
                    {result.healthTips.map((tip) => (
                      <li
                        key={tip}
                        className={css({
                          color: 'white',
                          lineHeight: '1.6',
                        })}
                      >
                        {tip}
                      </li>
                    ))}
                  </ul>

                  <div
                    className={css({
                      marginTop: '6',
                      padding: '4',
                      backgroundColor: 'blue.500/10',
                      border: '1px solid',
                      borderColor: 'blue.500/20',
                      borderRadius: 'lg',
                      fontSize: 'sm',
                      color: 'white',
                    })}
                  >
                    <strong className={css({ color: 'white' })}>Note:</strong> BMI is a screening
                    tool and does not diagnose health conditions. Factors like muscle mass, bone
                    density, and overall body composition are not considered. Always consult with a
                    healthcare professional for personalized health advice.
                  </div>
                </Card>
              </div>

              {history.length > 0 && (
                <div
                  className={css({
                    animation: 'slideUp 0.5s ease-out forwards',
                    animationDelay: '0.5s',
                    opacity: 0,
                  })}
                >
                  <Card
                    className={css({
                      padding: '6',
                      border: '1px solid',
                      borderColor: 'green.500/20',
                      bg: 'gray.900/50',
                      backdropFilter: 'blur(16px)',
                    })}
                  >
                    <h2
                      className={css({
                        fontSize: 'xl',
                        fontWeight: 'semibold',
                        color: 'gray.100',
                        marginBottom: '4',
                      })}
                    >
                      Recent History
                    </h2>

                    <div
                      className={css({
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '3',
                      })}
                    >
                      {history.slice(0, 5).map((entry) => (
                        <div
                          key={entry.date}
                          className={css({
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '3',
                            backgroundColor: 'gray.800/50',
                            borderRadius: 'lg',
                          })}
                        >
                          <div>
                            <div
                              className={css({
                                fontSize: 'sm',
                                color: 'white',
                              })}
                            >
                              {new Date(entry.date).toLocaleDateString()}
                            </div>
                            <div
                              className={css({
                                fontSize: 'sm',
                                color: 'white',
                              })}
                            >
                              {entry.weight}
                              {entry.isMetric ? 'kg' : 'lbs'} • {entry.height}
                              {entry.isMetric ? 'cm' : '"'}
                            </div>
                          </div>
                          <div
                            className={css({
                              fontSize: 'xl',
                              fontWeight: 'semibold',
                              color: 'gray.100',
                            })}
                          >
                            {entry.bmi.toFixed(1)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </>
          ) : (
            <div
              className={css({
                animation: 'slideUp 0.5s ease-out forwards',
                animationDelay: '0.3s',
                opacity: 0,
              })}
            >
              <Card
                className={css({
                  padding: '12 6',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'green.500/20',
                  bg: 'gray.900/50',
                  backdropFilter: 'blur(16px)',
                })}
              >
                <Activity
                  className={css({
                    width: '16',
                    height: '16',
                    color: 'gray.600',
                    margin: '0 auto 4',
                  })}
                />
                <h3
                  className={css({
                    fontSize: 'xl',
                    fontWeight: 'semibold',
                    color: 'gray.200',
                    marginBottom: '2',
                  })}
                >
                  Calculate Your BMI
                </h3>
                <p
                  className={css({
                    color: 'white',
                  })}
                >
                  Enter your weight and height to get started
                </p>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Pro Tips Section */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.6s',
          opacity: 0,
        })}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'amber.500/20',
            bg: 'amber.500/5',
            backdropFilter: 'blur(16px)',
            padding: '6',
          })}
        >
          <div className={css({ display: 'flex', alignItems: 'start', gap: '4' })}>
            <Sparkles
              className={css({
                h: '6',
                w: '6',
                color: 'amber.400',
                flexShrink: '0',
              })}
            />
            <div className={css({ spaceY: '2' })}>
              <h3
                className={css({
                  fontSize: 'lg',
                  fontWeight: 'semibold',
                  color: 'amber.300',
                })}
              >
                Pro Tips
              </h3>
              <ul className={css({ spaceY: '2', fontSize: 'sm', color: 'white' })}>
                <li>• Switch between metric and imperial units with one click</li>
                <li>• Your calculation history is automatically saved in your browser</li>
                <li>• Export your results as JSON for health tracking apps</li>
                <li>
                  • BMI is most accurate for adults; consult healthcare providers for children and
                  athletes
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Social Share */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '0.8s',
          opacity: 0,
        })}
      >
        <SocialShare
          toolName="BMI & Health Calculator"
          toolUrl="https://supertool.com/tools/bmi-calculator"
          description="Calculate your Body Mass Index and get personalized health insights with this comprehensive BMI calculator. Track your progress over time!"
          hashtags={['BMI', 'HealthCalculator', 'Fitness', 'Wellness', 'HealthTracking']}
        />
      </div>

      {/* Related Tools */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '1.0s',
          opacity: 0,
        })}
      >
        <RelatedTools currentToolPath="/tools/bmi-calculator" category="calculator" />
      </div>

      {/* Tool Rating */}
      <div
        className={css({
          animation: 'slideUp 0.5s ease-out forwards',
          animationDelay: '1.1s',
          opacity: 0,
        })}
      >
        <ToolRating toolId="/tools/bmi-calculator" toolName="BMI & Health Calculator" />
      </div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
