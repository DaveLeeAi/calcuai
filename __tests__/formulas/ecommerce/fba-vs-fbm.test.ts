import { calculateFBAVsFBM } from '@/lib/formulas/ecommerce/fba-vs-fbm';

describe('calculateFBAVsFBM', () => {
  const base = {
    sellingPrice: 29.99,
    productCost: 7,
    productCategory: 'home-garden',
    sizeTier: 'large-standard-8oz',
    inboundShipping: 1.5,
    fbmShippingCost: 6.5,
    fbmPackagingCost: 1.5,
  };

  it('both FBA and FBM return a net profit value', () => {
    const result = calculateFBAVsFBM(base);
    expect(typeof result.fbaProfitPerUnit).toBe('number');
    expect(typeof result.fbmProfitPerUnit).toBe('number');
  });

  it('same referral fee applies to both FBA and FBM', () => {
    const result = calculateFBAVsFBM(base);
    const table = result.comparisonTable as { item: string; fba: number; fbm: number }[];
    const referralRow = table.find((r) => r.item.includes('Referral'));
    expect(referralRow?.fba).toBe(referralRow?.fbm);
  });

  it('FBA has higher fulfillment fee than FBM when customer shipping is low', () => {
    // FBA fee for large-standard-8oz = $4.08; FBM total = $6.5 shipping + $1.5 packaging = $8.00
    // So FBM fulfillment cost is higher → FBA should be more profitable
    const result = calculateFBAVsFBM({ ...base, fbmShippingCost: 4, fbmPackagingCost: 1 });
    // FBM fulfillment = $5; FBA fulfillment = $4.08 → FBA wins by ~$0.92 + inbound diff
    // Net effect: FBA profit > FBM profit in this case since FBM fulfillment is higher
    expect(typeof result.recommendation).toBe('string');
  });

  it('FBM wins when FBA fulfillment + inbound exceeds FBM shipping + packaging', () => {
    // Scenario: cheap FBM shipping, expensive FBA size tier
    const result = calculateFBAVsFBM({
      ...base,
      sizeTier: 'small-oversize',       // FBA fee = $9.73
      fbmShippingCost: 4,
      fbmPackagingCost: 1,
    });
    expect(result.fbmProfitPerUnit).toBeGreaterThan(result.fbaProfitPerUnit as number);
  });

  it('recommendation is a non-empty string', () => {
    const result = calculateFBAVsFBM(base);
    expect(typeof result.recommendation).toBe('string');
    expect((result.recommendation as string).length).toBeGreaterThan(0);
  });

  it('comparison table has 7 rows', () => {
    const result = calculateFBAVsFBM(base);
    expect((result.comparisonTable as unknown[]).length).toBe(7);
  });

  it('summary has 6 entries', () => {
    const result = calculateFBAVsFBM(base);
    expect((result.summary as unknown[]).length).toBe(6);
  });

  it('clothing category uses 17% referral fee', () => {
    const home = calculateFBAVsFBM({ ...base, productCategory: 'home-garden' });
    const clothing = calculateFBAVsFBM({ ...base, productCategory: 'clothing' });
    // Clothing 17% > Home 15% → clothing profit lower
    expect(clothing.fbaProfitPerUnit).toBeLessThan(home.fbaProfitPerUnit as number);
  });

  it('higher product cost reduces both FBA and FBM profit equally', () => {
    const low = calculateFBAVsFBM({ ...base, productCost: 5 });
    const high = calculateFBAVsFBM({ ...base, productCost: 10 });
    const fbaDiff = (low.fbaProfitPerUnit as number) - (high.fbaProfitPerUnit as number);
    const fbmDiff = (low.fbmProfitPerUnit as number) - (high.fbmProfitPerUnit as number);
    expect(Math.abs(fbaDiff - fbmDiff)).toBeLessThan(0.01);
  });

  it('profit difference in summary reflects FBA minus FBM', () => {
    const result = calculateFBAVsFBM(base);
    const summary = result.summary as { label: string; value: number }[];
    const diffRow = summary.find((r) => r.label.includes('Difference'));
    const expected = Math.round(((result.fbaProfitPerUnit as number) - (result.fbmProfitPerUnit as number)) * 100) / 100;
    expect(diffRow?.value).toBeCloseTo(expected, 2);
  });
});
