'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CalculatorSpec } from '@/lib/types';
import CalculatorRenderer from './CalculatorRenderer';

interface StickyCalculatorProps {
  spec: CalculatorSpec;
}

/**
 * Wraps CalculatorRenderer with sticky behavior:
 * - Desktop: calculator sticks in right sidebar when scrolled past
 * - Mobile: floating "Back to calculator" button when calculator is out of view
 */
export default function StickyCalculator({ spec }: StickyCalculatorProps) {
  const calcRef = useRef<HTMLDivElement>(null);
  const [showBackButton, setShowBackButton] = useState(false);

  useEffect(() => {
    const el = calcRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show the back-to-calculator button on mobile when calculator is not visible
        setShowBackButton(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToCalculator = useCallback(() => {
    calcRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <>
      {/* Calculator widget — sticky on desktop via CSS, normal flow on mobile */}
      <div
        ref={calcRef}
        className="xl:sticky xl:top-20 xl:self-start max-w-[360px]"
        id="calculator-widget"
      >
        <CalculatorRenderer spec={spec} compact />
      </div>

      {/* Mobile: floating "Back to calculator" button */}
      {showBackButton && (
        <button
          onClick={scrollToCalculator}
          className="xl:hidden fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-600 active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2"
          aria-label="Back to calculator"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
          Calculator
        </button>
      )}
    </>
  );
}
