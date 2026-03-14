const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, '..', 'content', 'calculators', 'construction');

// Door Replacement Cost Calculator MDX
const doorMdx = `{/* Section 3: BLUF Intro */}
<div className="bluf-intro">

Replacing a single interior hollow-core door costs $225\u2013$500 installed, while an exterior steel door runs $500\u2013$1,100 and a sliding glass door costs $1,300\u2013$3,600. Adding a new frame increases the door cost by 35%, and smart-lock hardware adds $150\u2013$400 per door. For a whole-house project replacing 5 interior doors, expect to pay $1,125\u2013$2,500 at the national average. Enter your door type, quantity, hardware, frame option, and region below for a personalized estimate with a side-by-side comparison of all seven door types.

</div>

{/* At a Glance */}
<div className="at-a-glance">

| Metric | Value |
|--------|-------|
| **Interior hollow-core** | $225\u2013$500 installed (door + labor) |
| **Interior solid-core** | $300\u2013$800 installed |
| **Exterior steel** | $500\u2013$1,100 installed |
| **Exterior fiberglass** | $650\u2013$1,500 installed |
| **Exterior wood** | $750\u2013$2,000 installed |
| **French door** | $1,100\u2013$3,100 installed |
| **Sliding glass door** | $1,300\u2013$3,600 installed |
| **Source** | HomeAdvisor / Angi, 2025\u20132026 |

</div>

{/* Sections 1, 2, 4, 5 are auto-rendered by CalculatorRenderer */}

{/* Section 6: What This Estimate Shows */}
## What This Estimates

This calculator provides installed cost ranges for seven common door types \u2014 interior hollow-core, interior solid-core, exterior steel, exterior fiberglass, exterior wood, French doors, and sliding glass doors \u2014 based on your hardware selection, frame option, trim work, quantity, and region. It produces a low/mid/high estimate per door, a project total for multiple doors, and a comparison table showing the base installed cost for every door type.

The **base door cost** uses 2025\u20132026 national average pricing from HomeAdvisor and Angi, covering the door unit itself. Interior hollow-core doors start at $75 while sliding glass doors range up to $3,000 for the unit alone. These prices reflect standard sizes \u2014 custom or oversized doors will cost more.

The **frame multiplier** adjusts the door cost when replacing the entire door unit including the jamb, hinges, and threshold. A door-only replacement (1.0x) swaps the slab into the existing frame. A door-with-frame replacement (1.35x) is necessary when the existing frame is damaged, rotted, warped, or non-standard. The 35% premium covers the prehung unit, shims, and additional installation labor.

The **hardware add-on** covers locksets and handles. Standard hardware is included in the base price. Upgraded hardware ($50\u2013$150) adds designer handles and premium deadbolts. Smart-lock hardware ($150\u2013$400) adds keypad, fingerprint, or app-controlled entry \u2014 increasingly popular for exterior doors.

The **labor rate** varies by door type. Interior doors take 1\u20132 hours to install at $150\u2013$300 per door. Exterior doors require 2\u20135 hours at $250\u2013$500 due to weatherproofing, threshold alignment, and security hardware. French and sliding glass doors are the most labor-intensive at $300\u2013$600 per door, requiring precise leveling and track installation.

{/* Section 7: How to Use This Calculator */}
## How to Use This Calculator

1. **Select your door type** \u2014 choose the type that matches your project. Interior hollow-core is the standard for bedrooms and closets. Interior solid-core is better for soundproofing and bathrooms. Exterior doors include steel (most durable), fiberglass (best insulation), and wood (highest curb appeal). French and sliding glass doors are specialty options for patios and entryways.

2. **Enter the quantity** \u2014 how many doors of this type you plan to replace. The calculator multiplies the per-door cost by your quantity. If you are replacing different door types, run the calculator separately for each type.

3. **Choose your hardware level** \u2014 standard hardware is included with any door. Upgraded adds premium handles and deadbolts. Smart-lock adds keyless entry \u2014 recommended for front doors and garage entries.

4. **Select the frame option** \u2014 choose door-only if your existing frame is in good condition and the new door is the same size. Choose door-with-frame if the frame is damaged, if you are changing door sizes, or if you want a complete prehung unit for easier installation.

5. **Select trim work** \u2014 no trim work is needed if the existing casing is in good condition. Standard trim ($50\u2013$150) replaces basic casing. Decorative trim ($150\u2013$400) adds crown molding, rosettes, or craftsman-style casings.

6. **Choose your region** \u2014 labor rates vary 15\u201340% across the U.S. The West Coast and Northeast are the most expensive; the South and Midwest are the least expensive.

{/* Section 8: The Formula */}
<div className="formula-section">

## The Formula

Door replacement cost is estimated using door unit price, adjusted for frame, hardware, trim, labor, and quantity.

**Per-door cost:**

$$C_{perDoor} = (D \\times F_m) + H + T + (L \\times R_m)$$

**Project total:**

$$C_{total} = C_{perDoor} \\times Q$$

$$C_{mid} = \\frac{C_{low} + C_{high}}{2}$$

Where:

- **D** = door unit cost (low/high range by type)
- **F_m** = frame multiplier (door-only: 1.0, with-frame: 1.35)
- **H** = hardware add-on cost (standard: $0, upgraded: $50\u2013$150, smart-lock: $150\u2013$400)
- **T** = trim work cost (none: $0, standard: $50\u2013$150, decorative: $150\u2013$400)
- **L** = labor cost per door (varies by door type)
- **R_m** = regional labor multiplier (0.85\u20131.25)
- **Q** = quantity of doors

**Door unit costs (2025-2026):**

| Door Type | Low | High |
|---|---|---|
| Interior Hollow-Core | $75 | $200 |
| Interior Solid-Core | $150 | $500 |
| Exterior Steel | $250 | $600 |
| Exterior Fiberglass | $400 | $1,000 |
| Exterior Wood | $500 | $1,500 |
| French Door | $800 | $2,500 |
| Sliding Glass Door | $1,000 | $3,000 |

**Source:** Cost data from **HomeAdvisor / Angi** 2025-2026 national averages and **American Architectural Manufacturers Association (AAMA)**.

</div>

{/* Section 9: Worked Examples */}
## Worked Example: 3 Interior Solid-Core Doors with Standard Trim

A homeowner is replacing 3 bedroom doors with solid-core doors, standard trim, standard hardware, door-only (existing frames are fine), in the Midwest.

**Step-by-step:**

1. Look up solid-core door cost: $150\u2013$500
2. Frame multiplier (door-only): **1.0x** \u2014 door remains $150\u2013$500
3. Hardware (standard): **$0**
4. Trim (standard): **$50\u2013$150**
5. Labor (interior): **$150\u2013$300** x 0.90 (Midwest) = **$135\u2013$270**
6. Per-door low: $150 + $0 + $50 + $135 = **$335**
7. Per-door high: $500 + $0 + $150 + $270 = **$920**
8. Project total (3 doors): **$1,005\u2013$2,760** (mid: **$1,882.50**)

**Interpretation:** At roughly $627 per door midpoint, solid-core doors are a worthwhile upgrade from hollow-core for bedrooms \u2014 they provide significantly better sound insulation, feel more substantial, and add to resale value. The Midwest regional rate saves about 10% compared to the national average.

{/* Section 10: Door Replacement Cost by Type */}
## Door Replacement Cost by Type

| Door Type | Door Cost | Labor Cost | Total Installed | Best For |
|---|---|---|---|---|
| Interior Hollow-Core | $75\u2013$200 | $150\u2013$300 | $225\u2013$500 | Closets, low-traffic rooms |
| Interior Solid-Core | $150\u2013$500 | $150\u2013$300 | $300\u2013$800 | Bedrooms, bathrooms, offices |
| Exterior Steel | $250\u2013$600 | $250\u2013$500 | $500\u2013$1,100 | Front/back doors (security) |
| Exterior Fiberglass | $400\u2013$1,000 | $250\u2013$500 | $650\u2013$1,500 | Energy efficiency, no warping |
| Exterior Wood | $500\u2013$1,500 | $250\u2013$500 | $750\u2013$2,000 | Curb appeal, custom finishes |
| French Door | $800\u2013$2,500 | $300\u2013$600 | $1,100\u2013$3,100 | Patios, dining rooms |
| Sliding Glass Door | $1,000\u2013$3,000 | $300\u2013$600 | $1,300\u2013$3,600 | Patios, deck access |

All costs are installed prices including labor. Prices reflect 2025\u20132026 U.S. national averages and vary 15\u201340% by region.

{/* Section 12: Factors That Affect Cost */}
## Factors That Affect Door Replacement Cost

**Door type and material** create the largest cost swing. The same opening can cost $225 with a hollow-core interior door or $3,600 with a sliding glass door \u2014 a 16x difference. Exterior doors cost more because they include insulation, weatherstripping, security hardware, and heavier construction.

**Frame condition** determines whether you need a door-only swap or a full prehung replacement. If the existing frame is square, plumb, and undamaged, a door-only replacement saves 35%. If the frame is rotted, warped, or non-standard, a prehung replacement with new frame is required and adds that 35% premium.

**Hardware selection** ranges from $0 (standard) to $400 (smart lock) per door. For a 5-door project, choosing smart locks on all doors adds $750\u2013$2,000 to the project cost. Most homeowners choose standard hardware for interior doors and upgraded or smart-lock hardware for exterior entry doors.

**Regional labor rates** vary significantly. A door installation that costs $150 in labor in the South costs $187 in the West Coast \u2014 a 25% difference. For multi-door projects, this regional variance compounds quickly.

**Quantity** drives project cost linearly. Replacing 1 interior door costs $225\u2013$500; replacing 10 costs $2,250\u2013$5,000. Some contractors offer volume discounts for projects of 5+ doors \u2014 always ask for a per-door rate on multi-door projects.

{/* Section 13: Assumptions & Limitations */}
## Assumptions & Limitations

- All costs are **installed prices** including standard labor and basic hardware. Custom finishes, paint matching, and specialty stains are not included.
- Cost ranges reflect **2025\u20132026 U.S. national averages** from HomeAdvisor and Angi. Your local market may vary 15\u201340% depending on regional labor rates.
- The calculator assumes **standard-size doors** (80 inches tall, 24\u201336 inches wide for interior, 36 inches wide for exterior). Oversized, arched, or custom doors cost 25\u2013100% more.
- The **frame multiplier** (1.35x) is an average \u2014 actual frame replacement cost depends on frame condition, wall thickness, and whether structural modifications are needed.
- This calculator does **not account for** painting or staining, storm doors, screen doors, pet doors, sidelights, transoms, or structural modifications to widen or narrow doorways.

{/* Section 14: FAQ */}
<div className="faq-section">

## Frequently Asked Questions

### How much does it cost to replace an interior door?

Replacing an interior door costs $225\u2013$800 installed, depending on whether you choose a hollow-core ($75\u2013$200) or solid-core ($150\u2013$500) door. Labor runs $150\u2013$300 per door for a standard slab-only swap. Adding a new frame increases the total by 35%. For a typical 3-bedroom home replacing all interior doors (6\u20138 doors), expect to pay $1,350\u2013$6,400 total at the national average.

### How much does it cost to replace an exterior door?

Replacing an exterior door costs $500\u2013$2,000 installed for steel, fiberglass, or wood options. Steel is the most affordable and secure ($500\u2013$1,100). Fiberglass offers the best energy efficiency and weather resistance ($650\u2013$1,500). Wood provides the highest curb appeal but requires more maintenance ($750\u2013$2,000). Labor for exterior doors runs $250\u2013$500 because installation involves weatherproofing, threshold alignment, and security hardware.

### Should I replace the door frame or just the door?

Replace just the door (slab-only) if the existing frame is square, plumb, and in good condition \u2014 this saves 35% on the door portion of the cost. Replace the full prehung unit (door + frame) if the frame is rotted, warped, damaged, or if you are changing door sizes. A carpenter can assess frame condition in a few minutes during the estimate visit.

### How long does it take to replace a door?

Interior door replacement takes 1\u20132 hours per door for a slab swap or 2\u20133 hours with a new frame. Exterior doors take 2\u20135 hours depending on complexity. French doors and sliding glass doors take 4\u20138 hours due to track installation and precise leveling. A whole-house interior door project (6\u20138 doors) typically takes a full day for an experienced installer.

### Is it worth upgrading to solid-core interior doors?

Solid-core doors cost $75\u2013$300 more than hollow-core per door but provide significantly better sound insulation (STC rating of 30\u201335 vs 20\u201325 for hollow-core), feel more substantial, resist damage better, and add to home resale value. They are especially worthwhile for bedrooms, bathrooms, and home offices where sound privacy matters. The ROI is strongest in homes valued above $300,000.

### Do I need a permit to replace a door?

Most jurisdictions do not require a permit for a like-for-like door replacement (same size opening, same type). However, if you are changing the size of the opening, adding a new door where there was not one before, or modifying a structural wall, a building permit is typically required. Permit fees range from $50 to $300. Check with your local building department before starting work.

</div>

{/* Section 15: Related Calculators \u2014 auto-rendered from spec */}

{/* Section 16: Methodology & Sources */}
## Methodology & Sources

This calculator estimates door replacement costs using installed pricing for seven common door types, adjusted for hardware upgrades, frame replacement, trim work, quantity, and regional labor rates. Door unit costs come from **HomeAdvisor** and **Angi** 2025\u20132026 national average surveys. The frame replacement multiplier of 1.35x reflects prehung vs slab-only pricing differentials from **American Architectural Manufacturers Association (AAMA)** data. Hardware pricing is based on major manufacturer MSRPs from Schlage, Kwikset, and August. Labor rates are derived from **Bureau of Labor Statistics** Occupational Employment and Wage Statistics for carpenters and door installers (SOC 47-2031). Regional multipliers (0.85x\u20131.25x) are based on BLS OES regional wage data. All prices are installed costs including standard labor. Regional variation of 15\u201340% is expected.

{/* Section 17: Disclaimer \u2014 auto-rendered */}`;

// EV Charger Installation Cost Calculator MDX
const evMdx = `{/* Section 3: BLUF Intro */}
<div className="bluf-intro">

Installing a Level 2 home EV charger costs $775\u2013$1,650 at the national average for a 32-amp unit with a dedicated 240V circuit and permit. Upgrading to a 48-amp charger raises the range to $1,075\u2013$2,150, while an 80-amp unit runs $1,375\u2013$2,650. If your electrical panel needs a main upgrade, add $1,500\u2013$3,000 on top. The total cost for a fully loaded installation \u2014 premium 80-amp charger, long circuit run, panel upgrade, and permit on the West Coast \u2014 can reach $7,180. Enter your charger level, brand, circuit distance, panel situation, and region below for a personalized estimate with a comparison of all four charger levels.

</div>

{/* At a Glance \u2014 EV Charger Installation Costs */}
<div className="at-a-glance">

| Metric | Value |
|--------|-------|
| **Level 1 (120V, included EVSE)** | $175\u2013$450 (outlet install + permit only) |
| **Level 2 \u2014 32A** | $775\u2013$1,650 installed |
| **Level 2 \u2014 48A** | $1,075\u2013$2,150 installed |
| **Level 2 \u2014 80A** | $1,375\u2013$2,650 installed |
| **Sub-panel addition** | +$500\u2013$1,500 |
| **Main panel upgrade** | +$1,500\u2013$3,000 |
| **Source** | HomeAdvisor / Angi, 2025\u20132026; DOE AFDC |

</div>

{/* Sections 1, 2, 4, 5 are auto-rendered by CalculatorRenderer */}

{/* Section 6: What This Estimate Shows */}
## What This Estimates

This calculator provides installed cost ranges for home EV charger installations across four levels \u2014 Level 1 (120V), Level 2 at 32 amps, 48 amps, and 80 amps \u2014 with brand tier pricing, circuit distance adjustments, panel upgrade options, permit costs, and regional labor multipliers. It produces a low/mid/high total estimate, a charger level comparison table, and charging speed information.

The **charger unit cost** covers the EVSE (Electric Vehicle Supply Equipment) hardware. Level 1 charging uses the cord included with your vehicle \u2014 $0 charger cost. Level 2 chargers range from $300 for a basic 32-amp unit to $1,200 for a premium 80-amp unit. The brand multiplier adjusts this base: basic brands (1.0x), mid-range like ChargePoint or JuiceBox (1.15x), premium like Wallbox Pulsar Plus (1.40x), and Tesla Wall Connector (1.25x).

The **labor cost** covers the electrical work \u2014 running a dedicated 240V circuit from your panel to the charger location, mounting the charger, and final testing. Base labor ranges from $400\u2013$800 for a 32-amp circuit to $600\u2013$1,200 for an 80-amp circuit. The circuit distance multiplier increases labor for longer runs: under 25 feet (1.0x), 25\u201350 feet (1.20x), or over 50 feet (1.50x) \u2014 longer runs require more wire, conduit, and labor time.

The **panel upgrade cost** is the biggest potential add-on. Many older homes have 100-amp or 150-amp panels that cannot support a Level 2 charger without an upgrade. A sub-panel addition ($500\u2013$1,500) works if the main panel has spare capacity. A full main panel upgrade ($1,500\u2013$3,000) is needed when the existing panel is at capacity or undersized.

{/* Section 7: How to Use This Calculator */}
## How to Use This Calculator

1. **Select your charger level** \u2014 Level 1 uses a standard 120V outlet and adds only 3\u20135 miles of range per hour \u2014 fine for plug-in hybrids or short commutes. Level 2 at 32 amps covers most daily driving needs (20\u201325 miles/hr). Level 2 at 48 amps is the sweet spot for most battery EVs (30\u201335 miles/hr). Level 2 at 80 amps is for high-capacity batteries like Tesla Model S/X or Ford F-150 Lightning (40\u201350 miles/hr).

2. **Choose your brand tier** \u2014 basic chargers are functional and reliable. Mid-range adds WiFi connectivity, scheduling, and usage tracking. Premium adds load management, solar integration, and advanced app features. Tesla Wall Connector is the Tesla-specific option with power sharing support.

3. **Select your circuit distance** \u2014 measure from your electrical panel to where you want the charger mounted (typically in the garage near where you park). Under 25 feet is ideal and keeps costs lowest. Over 50 feet adds 50% to labor due to additional wire, conduit, and installation time.

4. **Choose your panel situation** \u2014 if your home has a 200-amp panel with spare breaker slots, select "No Panel Upgrade." If your panel is full but adequate amperage, a sub-panel may work. If you have a 100-amp or 150-amp panel, a main panel upgrade is likely required for Level 2 charging.

5. **Select permit status** \u2014 most jurisdictions require an electrical permit for 240V circuit installation. The permit ensures the work is inspected and meets code. Permit fees range from $75\u2013$250.

6. **Choose your region** \u2014 electrician labor rates vary significantly across the U.S. The West Coast and Northeast are 20\u201325% above the national average; the South and Midwest are 10\u201315% below.

{/* Section 8: The Formula */}
<div className="formula-section">

## The Formula

EV charger installation cost is the sum of charger hardware, electrical labor, panel upgrades, and permit fees.

**Total cost:**

$$C_{total} = (D \\times B_m) + (L \\times F_d \\times R_m) + P + K$$

$$C_{mid} = \\frac{C_{low} + C_{high}}{2}$$

Where:

- **D** = charger unit cost (low/high range by level)
- **B_m** = brand multiplier (basic: 1.0, mid-range: 1.15, premium: 1.40, Tesla: 1.25)
- **L** = base labor cost (varies by charger level amperage)
- **F_d** = circuit distance multiplier (under-25ft: 1.0, 25-50ft: 1.20, over-50ft: 1.50)
- **R_m** = regional labor multiplier (0.85\u20131.25)
- **P** = panel upgrade cost (none: $0, subpanel: $500\u2013$1,500, main: $1,500\u2013$3,000)
- **K** = permit cost (yes: $75\u2013$250, no: $0)

**Charger unit costs (2025-2026):**

| Charger Level | Low | High | Charging Speed |
|---|---|---|---|
| Level 1 (120V) | $0 | $0 | 3\u20135 miles/hr |
| Level 2 \u2014 32A | $300 | $600 | 20\u201325 miles/hr |
| Level 2 \u2014 48A | $500 | $900 | 30\u201335 miles/hr |
| Level 2 \u2014 80A | $700 | $1,200 | 40\u201350 miles/hr |

**Source:** Cost data from **HomeAdvisor / Angi** 2025-2026 national averages and **U.S. Department of Energy Alternative Fuels Data Center (AFDC)**.

</div>

{/* Section 9: Worked Examples */}
## Worked Example: Level 2 48A Charger in a Northeast Home

A homeowner in Connecticut is installing a Level 2 48-amp charger (mid-range brand) with a 30-foot circuit run, no panel upgrade needed, permit required.

**Step-by-step:**

1. Look up 48A charger cost: $500\u2013$900
2. Brand multiplier (mid-range, 1.15x): $575\u2013$1,035
3. Look up labor base: $500\u2013$1,000
4. Circuit distance (25\u201350ft, 1.20x): $600\u2013$1,200
5. Regional multiplier (Northeast, 1.20x): $720\u2013$1,440
6. Panel upgrade (none): **$0**
7. Permit: **$75\u2013$250**
8. Total low: $575 + $720 + $0 + $75 = **$1,370**
9. Total high: $1,035 + $1,440 + $0 + $250 = **$2,725**
10. Total mid: ($1,370 + $2,725) / 2 = **$2,047.50**

**Interpretation:** At roughly $2,048 midpoint, this is a typical installation for an EV owner with a relatively modern electrical panel. The 48-amp charger delivers 30\u201335 miles of range per hour \u2014 enough to fully charge most EVs overnight in 6\u201310 hours. The Northeast premium adds about 20% to labor costs compared to the national average. Federal tax credits (up to $1,000 through the Inflation Reduction Act Section 30C) can offset a significant portion of this cost.

{/* Section 10: Charger Level Comparison */}
## EV Charger Installation Cost by Level

| Charger Level | Charger Cost | Labor Cost | Total Installed | Charging Speed | Best For |
|---|---|---|---|---|---|
| Level 1 (120V) | $0 (included) | $100\u2013$200 | $175\u2013$450 | 3\u20135 mi/hr | PHEVs, short commutes |
| Level 2 \u2014 32A | $300\u2013$600 | $400\u2013$800 | $775\u2013$1,650 | 20\u201325 mi/hr | Most daily drivers |
| Level 2 \u2014 48A | $500\u2013$900 | $500\u2013$1,000 | $1,075\u2013$2,150 | 30\u201335 mi/hr | Most battery EVs |
| Level 2 \u2014 80A | $700\u2013$1,200 | $600\u2013$1,200 | $1,375\u2013$2,650 | 40\u201350 mi/hr | Large battery EVs, trucks |

All costs include permit ($75\u2013$250) and assume under-25ft circuit distance at national average. Panel upgrades not included. Prices reflect 2025\u20132026 U.S. national averages.

{/* Section 12: Factors That Affect Cost */}
## Factors That Affect EV Charger Installation Cost

**Charger amperage** is the primary cost driver after panel upgrades. The jump from 32A to 80A adds $400\u2013$600 in charger cost and $200\u2013$400 in labor because higher-amperage circuits require heavier gauge wire (6 AWG for 48A vs 4 AWG for 80A) and larger breakers.

**Circuit distance** has a major impact on labor. Every additional foot of circuit run requires more copper wire (currently $2\u2013$5 per foot for 6 AWG THHN) and conduit. A 50+ foot run can add $200\u2013$600 to labor compared to a short run under 25 feet. Mount the charger as close to your electrical panel as possible.

**Panel capacity** is the single biggest cost wildcard. If your home already has a 200A panel with spare slots, you pay nothing extra. If you need a main panel upgrade ($1,500\u2013$3,000), that alone can double the project cost. Have an electrician assess your panel before purchasing a charger.

**Brand and features** affect charger unit cost. A basic Lectron 32A charger costs $300; a Wallbox Pulsar Plus 48A with solar integration and load management costs over $900. The feature premium is worth considering if you have solar panels or need to manage household electrical load.

**Regional labor rates** vary 15\u201340% across the U.S. An installation that costs $600 in labor in Texas costs $750 on the West Coast. For installations requiring panel upgrades, this regional premium compounds across both the charger and panel work.

**Federal and state incentives** can offset 25\u201350% of the total cost. The Inflation Reduction Act Section 30C provides a federal tax credit of up to $1,000 (30% of costs) for home EV charger installations. Many states and utilities offer additional rebates of $200\u2013$500. Check the DOE AFDC database for incentives in your area.

{/* Section 13: Assumptions & Limitations */}
## Assumptions & Limitations

- All costs are **installed prices** including standard labor, wire, conduit, breaker, and charger mounting. Trenching for outdoor runs, concrete work, and decorative conduit covers are not included.
- Cost ranges reflect **2025\u20132026 U.S. national averages** from HomeAdvisor, Angi, and manufacturer MSRPs. Your local market may vary 15\u201340%.
- The calculator assumes a **single charger installation** on a residential property. Commercial installations, multi-charger setups, and load management systems require custom estimating.
- **Level 1 costs** reflect outlet installation or upgrade only \u2014 the EVSE cord is included with the vehicle.
- The **panel upgrade cost** is a separate add-on and assumes a standard residential upgrade. Homes requiring service entrance cable replacement or utility meter upgrades may cost more.
- This calculator does **not account for** utility meter upgrades, concrete pad work for outdoor chargers, Wi-Fi extenders for smart chargers, or time-of-use electricity rate impacts on charging costs.
- **Tax credits and rebates** are not deducted from the estimates. Check the DOE AFDC for current federal and state incentives.

{/* Section 14: FAQ */}
<div className="faq-section">

## Frequently Asked Questions

### How much does it cost to install a home EV charger?

A home Level 2 EV charger installation costs $775\u2013$2,650 depending on amperage (32A, 48A, or 80A), brand, circuit distance, and region. The charger unit itself costs $300\u2013$1,200 and installation labor runs $400\u2013$1,200. Add $75\u2013$250 for a permit. If your electrical panel needs an upgrade, add $500\u2013$3,000 on top. The average homeowner pays approximately $1,200\u2013$1,800 for a standard 48-amp Level 2 installation.

### Do I need to upgrade my electrical panel for an EV charger?

You need a panel upgrade if your existing panel does not have enough capacity for a dedicated 240V circuit. A 200-amp panel can typically support a 48-amp charger without upgrades if spare breaker slots are available. A 100-amp panel almost always requires an upgrade for Level 2 charging. A 150-amp panel may or may not need an upgrade depending on existing load. Have a licensed electrician perform a load calculation before purchasing a charger.

### What is the difference between Level 1 and Level 2 EV charging?

Level 1 uses a standard 120V household outlet and charges at 3\u20135 miles of range per hour \u2014 adding roughly 30\u201350 miles overnight. Level 2 uses a dedicated 240V circuit and charges at 20\u201350 miles per hour depending on amperage, fully charging most EVs in 4\u201310 hours overnight. Level 1 is sufficient for plug-in hybrids and short commutes under 30 miles per day. Level 2 is recommended for any battery-electric vehicle used for daily driving.

### Is a Level 2 EV charger worth the investment?

A Level 2 charger is worth the investment for most battery-EV owners. At average U.S. electricity rates ($0.16/kWh), charging at home costs roughly $0.04\u2013$0.05 per mile versus $0.10\u2013$0.15 per mile at public DC fast chargers. Over 5 years of typical driving (12,000 miles/year), home charging saves $3,600\u2013$7,200 compared to public fast charging. The charger installation typically pays for itself within 1\u20132 years through fuel savings alone.

### What size EV charger do I need?

A 32-amp charger (7.7 kW) is sufficient for plug-in hybrids and EVs with batteries under 60 kWh driven under 40 miles per day. A 48-amp charger (11.5 kW) is the sweet spot for most battery EVs including Tesla Model 3, Chevrolet Equinox EV, and Hyundai Ioniq 5. An 80-amp charger (19.2 kW) is recommended for large-battery vehicles like Tesla Model S/X, Ford F-150 Lightning, and GMC Hummer EV that need faster overnight charging.

### Can I install an EV charger myself?

Level 1 charging requires no installation \u2014 simply plug the included cord into a standard outlet. Level 2 installation requires a licensed electrician in most jurisdictions because it involves a dedicated 240V circuit, new breaker, and electrical permit. DIY electrical work for 240V circuits is prohibited by code in many areas and may void your homeowner insurance. Always hire a licensed electrician for Level 2 installations.

### Are there tax credits for EV charger installation?

The federal Inflation Reduction Act Section 30C provides a tax credit of up to $1,000 (30% of total installation costs) for home EV charger installations through 2032. The property must be in a qualifying census tract. Many states offer additional incentives: California provides up to $500, Colorado up to $500, and several utilities offer rebates of $200\u2013$500. Check the U.S. DOE Alternative Fuels Data Center for current incentives in your area.

</div>

{/* Section 15: Related Calculators \u2014 auto-rendered from spec */}

{/* Section 16: Methodology & Sources */}
## Methodology & Sources

This calculator estimates home EV charger installation costs using charger unit pricing by amperage level, adjusted for brand tier, circuit run distance, panel upgrade requirements, permit fees, and regional labor multipliers. Charger hardware pricing comes from manufacturer MSRPs (Tesla, ChargePoint, JuiceBox, Wallbox, Grizzl-E, Lectron) cross-referenced with **HomeAdvisor** and **Angi** 2025\u20132026 national average surveys. Charging speed specifications come from the **U.S. Department of Energy Alternative Fuels Data Center (AFDC)**. Labor rates are derived from **Bureau of Labor Statistics** Occupational Employment and Wage Statistics for electricians (SOC 47-2111). Circuit distance multipliers are based on **NECA** (National Electrical Contractors Association) linear-foot wiring cost data. Panel upgrade costs come from HomeAdvisor 2025\u20132026 electrical panel cost guides. Regional multipliers (0.85x\u20131.25x) are based on BLS OES regional wage data. All prices are installed costs including standard labor. Regional variation of 15\u201340% is expected.

{/* Section 17: Disclaimer \u2014 auto-rendered */}`;

fs.writeFileSync(path.join(basePath, 'door-replacement-cost-calculator.mdx'), doorMdx, 'utf-8');
console.log('Door MDX written: ' + doorMdx.length + ' chars');

fs.writeFileSync(path.join(basePath, 'ev-charger-installation-cost-calculator.mdx'), evMdx, 'utf-8');
console.log('EV Charger MDX written: ' + evMdx.length + ' chars');
