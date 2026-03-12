import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Terms of Service — ${siteConfig.name}`,
  description: `Terms of service for ${siteConfig.name}. Understand the terms governing use of our free online calculators.`,
  alternates: { canonical: `${siteConfig.url}/terms` },
  openGraph: {
    title: `Terms of Service — ${siteConfig.name}`,
    description: `Terms of service for ${siteConfig.name}. Understand the terms governing use of our free online calculators.`,
    url: `${siteConfig.url}/terms`,
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Terms of Service — ${siteConfig.name}`,
    description: `Terms of service for ${siteConfig.name}. Understand the terms governing use of our free online calculators.`,
  },
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <div className="max-w-content mx-auto">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Terms of Service' }]} />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Terms of Service</h1>
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <p>
          <strong>Effective date:</strong> March 2026
        </p>
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of the CalcuAI website at
          calcuai.com (the &quot;Site&quot;) operated by CalcuAI (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;).
          By accessing or using the Site, you agree to be bound by these Terms. If you do not
          agree, please do not use the Site.
        </p>

        <h2>Acceptance of Terms</h2>
        <p>
          By accessing or using CalcuAI, you confirm that you have read, understood, and agree
          to these Terms of Service. We may update these Terms from time to time, and your
          continued use of the Site constitutes acceptance of any changes.
        </p>

        <h2>Description of Service</h2>
        <p>
          CalcuAI provides free online calculators for finance, health, math, construction,
          science, business, everyday use, and unit conversions. The Site is free to use, requires
          no registration or account creation, and is designed to provide quick, accurate
          calculations for informational and educational purposes.
        </p>

        <h2>Disclaimer — No Professional Advice</h2>
        <p>
          <strong>
            The calculators and content on CalcuAI are for informational and educational
            purposes only. They do not constitute professional financial, medical, legal,
            engineering, tax, or construction advice.
          </strong>
        </p>
        <p>
          Calculator results are estimates and approximations based on the inputs you provide
          and the formulas used. They should not be relied upon as the sole basis for making
          important decisions. Specifically:
        </p>
        <ul>
          <li>
            <strong>Financial calculators</strong> provide estimates only. Actual loan payments,
            investment returns, tax obligations, and other financial outcomes depend on factors
            not captured by our calculators. Consult a qualified financial advisor, accountant,
            or tax professional for advice specific to your situation.
          </li>
          <li>
            <strong>Health calculators</strong> provide general reference values only. They are
            not medical diagnoses or treatment recommendations. Always consult a qualified
            healthcare provider before making health-related decisions.
          </li>
          <li>
            <strong>Construction calculators</strong> provide material and cost estimates only.
            Actual quantities, costs, and requirements vary by location, supplier, project
            conditions, and local building codes. Consult a licensed contractor or engineer for
            project-specific guidance.
          </li>
          <li>
            <strong>All other calculators</strong> are general-purpose tools. Verify results
            independently when accuracy is critical to your use case.
          </li>
        </ul>

        <h2>Accuracy</h2>
        <p>
          We strive for accuracy in all our calculators. Our formulas are based on
          industry-standard methods, published research, and authoritative sources (such as IRS
          publications, peer-reviewed studies, and professional standards). Each calculator is
          tested against known-correct values with multiple test cases.
        </p>
        <p>
          However, we make no guarantee that calculator results will be error-free, complete, or
          suitable for any particular purpose. Real-world results may vary due to factors
          including but not limited to rounding, regional differences, changing regulations,
          market conditions, and individual circumstances not accounted for by our models.
        </p>
        <p>
          If you discover an error in any calculator, please contact us at{' '}
          <a href="mailto:contact@calcuai.com">contact@calcuai.com</a> so we can investigate
          and correct it promptly.
        </p>

        <h2>Intellectual Property</h2>
        <p>
          All content on CalcuAI — including text, graphics, calculator designs, user interface
          elements, code, and the selection and arrangement of content — is the property of
          CalcuAI and is protected by applicable intellectual property laws.
        </p>
        <p>
          The mathematical formulas used in our calculators are generally in the public domain.
          However, our specific implementations, explanations, articles, and presentation of
          those formulas are original works and are protected by copyright.
        </p>
        <p>
          You may use our calculators for personal, educational, and professional purposes. You
          may share links to our pages. You may not reproduce, redistribute, or republish our
          content, articles, or calculator implementations without prior written permission.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by applicable law, CalcuAI and its operators shall not
          be liable for any direct, indirect, incidental, consequential, or special damages
          arising from or related to your use of, or inability to use, the Site or any calculator
          results.
        </p>
        <p>
          This includes, without limitation, damages arising from decisions made based on
          calculator results, reliance on information provided on the Site, or any errors or
          omissions in calculator outputs. You use the Site and its calculators entirely at your
          own risk.
        </p>

        <h2>Prohibited Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>
            Use automated tools, bots, scrapers, or scripts to access the Site or extract content,
            data, or calculator results in bulk.
          </li>
          <li>
            Redistribute, republish, or resell our content, articles, or calculator implementations
            without prior written permission.
          </li>
          <li>
            Attempt to interfere with, compromise, or disrupt the Site&apos;s operation, security,
            or infrastructure.
          </li>
          <li>
            Use the Site for any unlawful purpose or in violation of any applicable local, state,
            national, or international law.
          </li>
          <li>
            Frame, mirror, or embed our calculators or pages on other websites without permission.
          </li>
        </ul>

        <h2>Third-Party Links</h2>
        <p>
          The Site may contain links to third-party websites, resources, or services. These links
          are provided for convenience and reference only. We do not endorse, control, or assume
          responsibility for the content, privacy policies, or practices of any third-party sites.
          Your use of third-party websites is at your own risk and subject to their terms and
          policies.
        </p>

        <h2>Modifications to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. When we make changes, we will
          update the &quot;Effective date&quot; at the top of this page. Material changes may also be
          communicated through a notice on the Site. Your continued use of the Site after any
          modifications constitutes acceptance of the updated Terms.
        </p>

        <h2>Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the State
          of Florida, United States of America, without regard to its conflict of law provisions.
          Any disputes arising under or in connection with these Terms shall be subject to the
          exclusive jurisdiction of the courts located in the State of Florida.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at:
        </p>
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:contact@calcuai.com">contact@calcuai.com</a>
        </p>
      </div>
    </div>
  );
}
