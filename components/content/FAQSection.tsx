'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FAQItem[];
}

/**
 * Renders an accordion FAQ section with FAQPage schema.
 * Uses details/summary for native HTML accordion behavior.
 * FAQ answers: first sentence is the direct answer (self-contained, citable).
 */
export function FAQSection({ items }: FAQSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="faq-section mt-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {items.map((item, index) => (
          <FAQAccordionItem key={index} question={item.question} answer={item.answer} />
        ))}
      </div>
    </section>
  );
}

function FAQAccordionItem({ question, answer }: FAQItem) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 text-left text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <svg
          className={`h-5 w-5 text-gray-500 dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-4 text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}
