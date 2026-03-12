# Component Patterns Reference

## CalculatorRenderer — The Core Component

The CalculatorRenderer is the single most important component. It reads a calculator spec and renders the full interactive calculator. Every calculator page uses this one component.

```tsx
// components/calculator/CalculatorRenderer.tsx
// PATTERN — adapt as needed during implementation

interface CalculatorRendererProps {
  spec: CalculatorSpec;
}

export function CalculatorRenderer({ spec }: CalculatorRendererProps) {
  const [inputs, setInputs] = useState<Record<string, any>>(getDefaults(spec));
  const [results, setResults] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string | null>(spec.tabs?.[0]?.id || null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCalculate = () => {
    const validationErrors = validateInputs(spec.inputs, inputs);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    const formula = getFormula(spec.formula);
    const output = formula(inputs);
    setResults(output);
  };

  return (
    <div className="calculator-container">
      {spec.tabs && <TabSwitcher tabs={spec.tabs} active={activeTab} onChange={setActiveTab} />}
      <div className="calculator-inputs">
        {spec.inputs.map(input => (
          <InputField
            key={input.id}
            field={input}
            value={inputs[input.id]}
            error={errors[input.id]}
            onChange={(val) => setInputs(prev => ({ ...prev, [input.id]: val }))}
          />
        ))}
      </div>
      <button onClick={handleCalculate} className="calculate-button">
        Calculate
      </button>
      {results && (
        <div className="calculator-results">
          {spec.outputs.map(output => (
            <OutputDisplay key={output.id} field={output} data={results} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Input Components

Each input type is a separate component. They all follow the same interface:

```tsx
interface InputComponentProps {
  field: InputField;       // From spec
  value: any;              // Current value
  error?: string;          // Validation error message
  onChange: (value: any) => void;
}
```

### NumberInput
```tsx
// For plain numbers (age, quantity, etc.)
// Shows: label, number input with step buttons, help text, error
// Formats: adds commas for large numbers in display
// Validates: min, max, required
```

### CurrencyInput
```tsx
// For dollar amounts
// Shows: label, "$" prefix, formatted number input, help text, error
// Formats: $350,000 display, strips formatting for calculation
// Validates: min, max, required
```

### PercentageInput
```tsx
// For rates and percentages
// Shows: label, number input, "%" suffix, help text, error
// Accepts: 6.5 (not 0.065) — conversion happens in formula
// Validates: min, max (typically 0-100 but can be wider for interest rates)
```

### DatePicker
```tsx
// For dates (birth date, start date, due date)
// Shows: label, date picker with month/day/year, help text, error
// Returns: ISO date string
// Validates: required, min/max date if set
```

### SelectInput
```tsx
// For dropdown selections (loan term, activity level)
// Shows: label, dropdown with options from spec, help text, error
// Returns: selected option value as string
```

### ToggleInput
```tsx
// For yes/no switches (include PMI, metric/imperial)
// Shows: label, toggle switch, help text
// Returns: boolean
```

### RangeInput
```tsx
// For sliders (age range, weight)
// Shows: label, slider, current value display, min/max labels
// Returns: number
```

### RadioInput
```tsx
// For small option sets (male/female, filing status)
// Shows: label, radio buttons inline or stacked, help text, error
// Returns: selected value as string
```

### UnitPairInput
```tsx
// For values with selectable units (height in ft/in or cm)
// Shows: label, number input, unit dropdown, help text, error
// Returns: { value: number, unit: string }
// The formula module handles unit conversion internally
```

## Output Components

### SingleValue
```tsx
// For the primary result (monthly payment, BMI score)
// Shows: large formatted number with label
// If highlight: true, uses accent color and larger font size
// Formats based on: currency ($1,770.49), percentage (24.5%), number (42)
```

### ValueGroup
```tsx
// For multiple related values (principal + interest + tax + insurance)
// Shows: grid of labeled values, all formatted consistently
// Used for loan breakdowns, macro splits, etc.
```

### DataTable
```tsx
// For tabular data (amortization schedule, payoff timeline)
// Shows: sortable table with columns defined in spec
// Pagination for tables with 100+ rows
// Column formatting per spec (currency, percentage, number)
```

### PieChart (Recharts)
```tsx
// For breakdowns (payment composition, macro split)
// Shows: pie/donut chart with legend
// Colors from spec chartConfig
// Hover shows exact values
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
```

### LineChart (Recharts)
```tsx
// For trends over time (balance payoff, growth projection)
// Shows: line chart with labeled axes
// X/Y labels from spec chartConfig
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
```

### BarChart (Recharts)
```tsx
// For comparisons (scenario A vs B)
// Shows: grouped or stacked bar chart
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
```

### GaugeIndicator
```tsx
// For range-based results (BMI category, risk level)
// Shows: visual gauge/scale with colored zones
// Pointer/marker shows where the user's result falls
// Ranges defined in spec gaugeConfig
// Custom component — no Recharts equivalent. Build with SVG or CSS.
```

### ComparisonView
```tsx
// For side-by-side scenario comparison
// Shows: two columns with matching output fields
// Used by calculators with "compare-scenarios" feature
```

## Feature Components

### TabSwitcher
```tsx
// Renders tabs when spec.tabs is defined
// Switches active tab, applies defaultInputOverrides
// Shows/hides inputs based on visibleInputs per tab
```

### CompareScenarios
```tsx
// Allows user to save a calculation, change inputs, calculate again, see both side by side
// Stores up to 3 scenarios
// Only rendered when "compare-scenarios" is in spec.features
```

### ShareUrl
```tsx
// Serializes current inputs to URL params
// Copy-to-clipboard button
// Only rendered when "shareable-url" is in spec.features
// Format: /finance/mortgage-calculator?homePrice=350000&rate=6.5&term=30
```

### PrintResults
```tsx
// Generates a clean printable view of inputs + results
// Opens print dialog
// Only rendered when "print-results" is in spec.features
```

## Design Rules

### Calculator Container
- Max width: 720px for the calculator widget area
- Background: white card with subtle shadow
- Padding: 24px on desktop, 16px on mobile
- Clear visual separation between inputs and results

### Inputs
- Stack vertically on mobile (single column)
- 2-column grid on desktop for calculators with 6+ inputs
- Labels above inputs, not beside
- Error messages in red below the input field
- Help text in muted gray below the input field
- Tab key moves between inputs

### Calculate Button
- Full width on mobile
- Right-aligned or centered on desktop
- Primary brand color
- "Calculate" text (not "Submit", not "Go")
- Disabled state while inputs are invalid

### Results
- Clear visual break between inputs and results (divider or background change)
- Primary result (highlight: true) is largest, most prominent
- Charts render below primary values
- Tables render last (largest element)
- All numbers formatted with proper commas, decimals, currency symbols

### Mobile
- Calculator must be visible without scrolling past the intro paragraph
- All inputs must be usable with thumb (min 44px touch targets)
- Select dropdowns use native mobile selectors
- Charts resize to fit mobile viewport
- Tables scroll horizontally if needed
