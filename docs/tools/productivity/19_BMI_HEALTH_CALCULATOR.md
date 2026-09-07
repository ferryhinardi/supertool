# BMI & Health Calculator

## Overview

The **BMI & Health Calculator** is a comprehensive tool for calculating Body Mass Index (BMI) and providing personalized health insights. It supports both metric and imperial measurement systems, provides health recommendations based on BMI categories, and tracks your BMI history over time.

## Features

### 1. **Dual Unit Support**

- **Metric System**: Weight in kilograms (kg), height in centimeters (cm)
- **Imperial System**: Weight in pounds (lbs), height in feet and inches
- Easy toggle between measurement systems
- Automatic unit conversion

### 2. **BMI Calculation**

The tool uses the standard BMI formula:

- **Metric**: BMI = weight (kg) / height² (m²)
- **Imperial**: BMI = (weight (lbs) / height² (inches²)) × 703

### 3. **Health Categories**

BMI results are classified into four standard categories:

- **Underweight**: BMI < 18.5
- **Normal Weight**: BMI 18.5 - 24.9
- **Overweight**: BMI 25 - 29.9
- **Obese**: BMI ≥ 30

### 4. **Visual BMI Chart**

- Color-coded BMI range visualization
- Real-time indicator showing your current BMI position
- Clear category boundaries and ranges

### 5. **Ideal Weight Range**

- Calculates your ideal weight range for your height
- Based on the healthy BMI range (18.5 - 24.9)
- Displayed in your preferred unit system

### 6. **Personalized Health Tips**

Category-specific health recommendations:

**Underweight:**

- Consultation recommendations
- Nutrient-dense food suggestions
- Strength training guidance
- Meal frequency advice

**Normal Weight:**

- Maintenance strategies
- Exercise recommendations (150+ minutes/week)
- Balanced diet guidance
- Sleep and hydration tips

**Overweight:**

- Safe weight loss strategies (1-2 lbs/week)
- Increased activity recommendations (300+ minutes/week)
- Portion control advice
- Professional consultation guidance

**Obese:**

- Comprehensive health plan recommendations
- Professional support guidance (dietitian, healthcare provider)
- Sustainable lifestyle changes
- Health monitoring advice

### 7. **BMI History Tracking**

- Stores last 10 BMI calculations in browser localStorage
- View historical data with dates
- Track progress over time
- Compare previous measurements

### 8. **Export Functionality**

Export your BMI results as JSON including:

- Calculation date
- BMI value and category
- Weight and height measurements
- Ideal weight range
- Easy sharing and record-keeping

## How to Use

### Step 1: Select Unit System

Click the **Metric/Imperial** button to choose your preferred measurement system.

### Step 2: Enter Your Details

**For Metric:**

- Enter your weight in kilograms (e.g., 70)
- Enter your height in centimeters (e.g., 175)

**For Imperial:**

- Enter your weight in pounds (e.g., 154)
- Enter your height in feet (e.g., 5) and inches (e.g., 9)

### Step 3: Calculate

Click the **Calculate BMI** button to see your results.

### Step 4: Review Results

- Your BMI value will be displayed prominently
- Your health category is shown with a badge
- Review your ideal weight range
- Read personalized health tips
- See your position on the BMI chart

### Step 5: Export (Optional)

Click **Export** to download your results as a JSON file for your records.

## Understanding Your Results

### BMI Limitations

While BMI is a useful screening tool, it has limitations:

- Does not account for muscle mass
- Does not consider bone density
- Does not evaluate body composition
- May not be accurate for athletes, bodybuilders, or elderly individuals
- Does not account for age, gender, or ethnicity differences

### When to Consult a Healthcare Professional

- If your BMI is outside the normal range
- For personalized weight management advice
- If you have health conditions (diabetes, heart disease, etc.)
- Before starting any weight loss program
- For comprehensive health assessment

## Technical Details

### Calculation Accuracy

- BMI values are calculated to 2 decimal places
- All measurements use standard medical formulas
- Results match WHO (World Health Organization) guidelines

### Data Privacy

- All calculations are performed locally in your browser
- BMI history is stored in browser localStorage only
- No data is sent to external servers
- Clear browser data to remove history

### Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile and desktop
- Requires JavaScript enabled

## Analytics

The tool tracks anonymous usage analytics for:

- BMI calculations performed
- Unit system preferences (metric vs imperial)
- Export actions
- Reset actions

This helps improve the tool and understand usage patterns.

## Examples

### Example 1: Metric Calculation

**Input:**

- Weight: 70 kg
- Height: 175 cm

**Output:**

- BMI: 22.9
- Category: Normal Weight
- Ideal Weight Range: 56.7 - 76.3 kg

### Example 2: Imperial Calculation

**Input:**

- Weight: 154 lbs
- Height: 5 feet 9 inches

**Output:**

- BMI: 22.7
- Category: Normal Weight
- Ideal Weight Range: 125 - 169 lbs

## Testing

The BMI calculator includes comprehensive test coverage:

- Metric and imperial unit calculations
- All BMI category classifications
- Boundary condition testing
- Edge case handling
- Unit conversion consistency
- Real-world scenario validation

Run tests with:

```bash
npm test app/tools/bmi-calculator/__tests__/logic.test.ts
```

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatible
- Clear labels and descriptions
- High contrast color scheme

## Related Tools

- **Daily Task Summary**: Track health-related tasks and goals
- **Unit Converter**: Convert between different measurement units
- **Split Bill**: Calculate shared meal costs

## Resources

### Additional Information

- [WHO BMI Classification](https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight)
- [CDC BMI Information](https://www.cdc.gov/healthyweight/assessing/bmi/index.html)
- [NIH Body Weight Planner](https://www.niddk.nih.gov/bwp)

### Disclaimer

This tool is for informational purposes only and should not be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for personalized health guidance.

## Version History

- **v1.0.0** (2025): Initial release with full BMI calculation features
  - Metric and imperial unit support
  - Health category classification
  - Ideal weight range calculator
  - Personalized health tips
  - BMI history tracking
  - Export functionality

## Support

For issues, questions, or feature requests:

- GitHub: [ferryhinardi/supertool](https://github.com/ferryhinardi/supertool)
- Submit an issue on the GitHub repository

---

**Built with ❤️ by Ferry**
