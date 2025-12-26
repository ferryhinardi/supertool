'use client'

import { motion } from 'framer-motion'
import { Activity, Info, Lightbulb, Ruler, Scale, Sparkles, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FAQAccordion } from '@/components/ui/faq-accordion'
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={css({
          textAlign: 'center',
          spaceY: '4',
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
      </motion.div>

      <div
        className={css({
          display: 'grid',
          gridTemplateColumns: { base: '1fr', lg: '1fr 1fr' },
          gap: { base: '6', lg: '8' },
        })}
      >
        {/* Input Section */}
        <div className={css({ spaceY: '6' })}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
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
          </motion.div>

          {/* BMI Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
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
          </motion.div>
        </div>

        {/* Results Section */}
        <div className={css({ spaceY: '6' })}>
          {result ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
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
              </motion.div>

              {history.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
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
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
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
            </motion.div>
          )}
        </div>
      </div>

      {/* Pro Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
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
      </motion.div>

      {/* How to Use Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Card
          className={css({
            border: '1px solid',
            borderColor: 'blue.500/20',
            bg: 'blue.500/5',
            backdropFilter: 'blur(16px)',
            padding: '6',
          })}
        >
          <CardHeader
            className={css({
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: '3',
              padding: '0',
              marginBottom: '4',
            })}
          >
            <Lightbulb
              className={css({
                h: '6',
                w: '6',
                color: 'blue.400',
                flexShrink: '0',
              })}
            />
            <CardTitle
              className={css({
                fontSize: 'xl',
                fontWeight: 'semibold',
                color: 'blue.300',
              })}
            >
              How to Use BMI Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className={css({ padding: '0', spaceY: '4' })}>
            <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
              <Badge
                className={css({
                  bg: 'blue.500/20',
                  color: 'blue.300',
                  fontSize: 'sm',
                  fontWeight: 'bold',
                  px: '2.5',
                  py: '1',
                  flexShrink: '0',
                })}
              >
                1
              </Badge>
              <p className={css({ color: 'white', lineHeight: '1.6' })}>
                <strong className={css({ color: 'white' })}>Choose your unit system:</strong> Toggle
                between Metric (kg/cm) or Imperial (lbs/feet-inches) using the unit button at the
                top.
              </p>
            </div>

            <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
              <Badge
                className={css({
                  bg: 'blue.500/20',
                  color: 'blue.300',
                  fontSize: 'sm',
                  fontWeight: 'bold',
                  px: '2.5',
                  py: '1',
                  flexShrink: '0',
                })}
              >
                2
              </Badge>
              <p className={css({ color: 'white', lineHeight: '1.6' })}>
                <strong className={css({ color: 'white' })}>Enter your measurements:</strong> Input
                your weight and height accurately. For Imperial units, enter feet and inches
                separately.
              </p>
            </div>

            <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
              <Badge
                className={css({
                  bg: 'blue.500/20',
                  color: 'blue.300',
                  fontSize: 'sm',
                  fontWeight: 'bold',
                  px: '2.5',
                  py: '1',
                  flexShrink: '0',
                })}
              >
                3
              </Badge>
              <p className={css({ color: 'white', lineHeight: '1.6' })}>
                <strong className={css({ color: 'white' })}>Calculate and view results:</strong>{' '}
                Click "Calculate BMI" to see your BMI score, category, and position on the visual
                BMI chart.
              </p>
            </div>

            <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
              <Badge
                className={css({
                  bg: 'blue.500/20',
                  color: 'blue.300',
                  fontSize: 'sm',
                  fontWeight: 'bold',
                  px: '2.5',
                  py: '1',
                  flexShrink: '0',
                })}
              >
                4
              </Badge>
              <p className={css({ color: 'white', lineHeight: '1.6' })}>
                <strong className={css({ color: 'white' })}>Review health recommendations:</strong>{' '}
                Read the personalized health tips and ideal weight range based on your BMI category.
              </p>
            </div>

            <div className={css({ display: 'flex', alignItems: 'start', gap: '3' })}>
              <Badge
                className={css({
                  bg: 'blue.500/20',
                  color: 'blue.300',
                  fontSize: 'sm',
                  fontWeight: 'bold',
                  px: '2.5',
                  py: '1',
                  flexShrink: '0',
                })}
              >
                5
              </Badge>
              <p className={css({ color: 'white', lineHeight: '1.6' })}>
                <strong className={css({ color: 'white' })}>Track your progress:</strong> Your
                calculation history is automatically saved. Export results as JSON to track changes
                over time.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Social Share */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <SocialShare
          toolName="BMI & Health Calculator"
          toolUrl="https://supertool.com/tools/bmi-calculator"
          description="Calculate your Body Mass Index and get personalized health insights with this comprehensive BMI calculator. Track your progress over time!"
          hashtags={['BMI', 'HealthCalculator', 'Fitness', 'Wellness', 'HealthTracking']}
        />
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
      >
        <FAQAccordion
          faqs={[
            {
              question: 'What is BMI and how is it calculated?',
              answer:
                'BMI (Body Mass Index) is a measure of body fat based on height and weight. For metric units, BMI = weight(kg) / height(m)². For imperial units, BMI = (weight(lbs) / height(in)²) × 703. It provides a quick screening tool to categorize weight status.',
            },
            {
              question: 'How accurate is BMI for assessing health?',
              answer:
                "BMI is a useful screening tool but has limitations. It doesn't account for muscle mass, bone density, age, sex, or body composition. Athletes with high muscle mass may have high BMI but low body fat. Always consult healthcare professionals for comprehensive health assessment.",
            },
            {
              question: 'What do the different BMI categories mean?',
              answer:
                'BMI categories are: Underweight (<18.5), Normal Weight (18.5-24.9), Overweight (25-29.9), and Obese (≥30). These ranges correlate with health risks, but individual health depends on many factors beyond BMI alone.',
            },
            {
              question: 'Can I use this calculator for children and teenagers?',
              answer:
                'This calculator is designed for adults (18+ years). Children and teenagers require BMI-for-age percentile charts that account for age and sex-specific growth patterns. Consult a pediatrician for accurate BMI assessment for minors.',
            },
            {
              question: 'Is BMI accurate for athletes and bodybuilders?',
              answer:
                "BMI has limited accuracy for athletes and bodybuilders because it doesn't distinguish between muscle and fat. Someone with high muscle mass may be classified as overweight or obese despite having low body fat. Consider body composition analysis for more accurate assessment.",
            },
            {
              question: 'What is a healthy weight range for my height?',
              answer:
                'The calculator shows your ideal weight range based on a BMI of 18.5-24.9 for your height. This range represents the weight associated with lowest health risks for most adults, though individual healthy weights may vary based on body composition and other factors.',
            },
            {
              question: 'Should I be concerned if my BMI is outside the normal range?',
              answer:
                "BMI outside the normal range may indicate increased health risks, but it's not a definitive diagnosis. Factors like muscle mass, age, genetics, and overall health matter. If concerned, consult a healthcare provider for comprehensive evaluation and personalized advice.",
            },
            {
              question: 'How does BMI relate to body fat percentage?',
              answer:
                'BMI and body fat percentage are related but different. BMI is calculated from height and weight, while body fat percentage measures actual fat tissue. Two people with the same BMI can have very different body fat percentages depending on muscle mass and composition.',
            },
            {
              question: 'Can I track my BMI changes over time?',
              answer:
                'Yes! This calculator automatically saves your last 10 calculations in your browser. You can also export results as JSON files to track changes over time. Regular monitoring helps you see trends and progress toward health goals.',
            },
            {
              question: 'What should I do if I want to change my BMI?',
              answer:
                'To change BMI safely: 1) Consult healthcare providers for personalized plans, 2) Focus on balanced nutrition with appropriate calorie intake, 3) Include regular physical activity, 4) Set realistic goals (1-2 lbs/week for weight loss), and 5) Make sustainable lifestyle changes, not quick fixes.',
            },
          ]}
        />
      </motion.div>

      {/* Related Tools */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.5 }}
      >
        <RelatedTools currentToolPath="/tools/bmi-calculator" category="calculator" />
      </motion.div>

      {/* Tool Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <ToolRating toolId="/tools/bmi-calculator" toolName="BMI & Health Calculator" />
      </motion.div>

      {/* Global Tool Search Dialog (Cmd+K / Ctrl+K) */}

      <ToolSearch />
    </main>
  )
}
