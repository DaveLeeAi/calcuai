import { calculateACoS } from '@/lib/formulas/ecommerce/amazon-acos';

describe('calculateACoS', () => {
  const base = {
    adSpend: 1200,
    adAttributedSales: 8000,
    totalStoreSales: 20000,
    grossMargin: 35,
  };

  it('calculates ACoS = ad spend / ad sales × 100', () => {
    const result = calculateACoS(base);
    // 1200 / 8000 × 100 = 15%
    expect(result.acos).toBeCloseTo(15, 1);
  });

  it('calculates TACoS = ad spend / total sales × 100', () => {
    const result = calculateACoS(base);
    // 1200 / 20000 × 100 = 6%
    expect(result.tacos).toBeCloseTo(6, 1);
  });

  it('calculates ROAS = ad sales / ad spend', () => {
    const result = calculateACoS(base);
    // 8000 / 1200 = 6.67
    expect(result.roas).toBeCloseTo(6.67, 1);
  });

  it('break-even ACoS equals gross margin', () => {
    const result = calculateACoS(base);
    expect(result.breakEvenAcos).toBe(35);
  });

  it('ACoS below break-even means profitable campaigns', () => {
    const result = calculateACoS(base); // 15% ACoS < 35% break-even
    const table = result.acosStatusTable as { metric: string; status: string }[];
    const acosRow = table.find((r) => r.metric === 'ACoS');
    expect(acosRow?.status).toContain('✅');
  });

  it('ACoS above break-even means unprofitable campaigns', () => {
    const result = calculateACoS({ ...base, adAttributedSales: 1000 }); // 1200/1000 = 120% ACoS > 35%
    const table = result.acosStatusTable as { metric: string; status: string }[];
    const acosRow = table.find((r) => r.metric === 'ACoS');
    expect(acosRow?.status).toContain('❌');
  });

  it('TACoS below 10% shows healthy status', () => {
    const result = calculateACoS(base); // 6% TACoS
    const table = result.acosStatusTable as { metric: string; status: string }[];
    const tacosRow = table.find((r) => r.metric === 'TACoS');
    expect(tacosRow?.status).toContain('✅');
  });

  it('TACoS above 15% shows high status', () => {
    const result = calculateACoS({ ...base, adSpend: 4000, totalStoreSales: 20000 }); // 20% TACoS
    const table = result.acosStatusTable as { metric: string; status: string }[];
    const tacosRow = table.find((r) => r.metric === 'TACoS');
    expect(tacosRow?.status).toContain('❌');
  });

  it('ACoS of 0 when no ad spend', () => {
    const result = calculateACoS({ ...base, adSpend: 0.01, adAttributedSales: 10000 });
    expect(result.acos).toBeCloseTo(0, 0);
  });

  it('ROAS of 1 when spend equals ad revenue', () => {
    const result = calculateACoS({ ...base, adAttributedSales: 1200 });
    expect(result.roas).toBeCloseTo(1, 2);
  });

  it('status table has 4 rows', () => {
    const result = calculateACoS(base);
    expect((result.acosStatusTable as unknown[]).length).toBe(4);
  });

  it('summary has 8 entries', () => {
    const result = calculateACoS(base);
    expect((result.summary as unknown[]).length).toBe(8);
  });

  it('higher gross margin raises break-even ACoS', () => {
    const low = calculateACoS({ ...base, grossMargin: 20 });
    const high = calculateACoS({ ...base, grossMargin: 60 });
    expect(high.breakEvenAcos).toBeGreaterThan(low.breakEvenAcos as number);
  });
});
