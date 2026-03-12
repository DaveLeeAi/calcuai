import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `Privacy Policy — ${siteConfig.name}`,
  description: `Privacy policy for ${siteConfig.name}. Learn how we handle your data when you use our free online calculators.`,
  alternates: { canonical: `${siteConfig.url}/privacy` },
  openGraph: {
    title: `Privacy Policy — ${siteConfig.name}`,
    description: `Privacy policy for ${siteConfig.name}. Learn how we handle your data when you use our free online calculators.`,
    url: `${siteConfig.url}/privacy`,
    type: 'website',
    siteName: siteConfig.name,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: `Privacy Policy — ${siteConfig.name}`,
    description: `Privacy policy for ${siteConfig.name}. Learn how we handle your data when you use our free online calculators.`,
  },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-content mx-auto">
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]} />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none">
        <p>
          <strong>Last updated:</strong> March 2026
        </p>
        <p>
          CalcuAI (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the website calcuai.com (the &quot;Site&quot;).
          This Privacy Policy explains how we collect, use, and protect information when you use our
          free online calculators. CalcuAI does not require user accounts, logins, or registration of
          any kind. We are committed to keeping your experience simple, private, and transparent.
        </p>

        <h2>Information We Collect</h2>
        <p>
          CalcuAI is designed to work without collecting personal information. We do not require you
          to create an account, provide your name, email address, or any other personal details to
          use our calculators. All calculations are performed in your browser and are not transmitted
          to our servers.
        </p>
        <p>We may automatically collect limited, anonymous technical information including:</p>
        <ul>
          <li>Pages visited and calculators used</li>
          <li>Browser type and version</li>
          <li>Device type (desktop, mobile, tablet)</li>
          <li>General geographic region (country/city level, not precise location)</li>
          <li>Referring website or search engine</li>
          <li>Time spent on pages</li>
        </ul>
        <p>
          This information is collected in aggregate and cannot be used to identify individual users.
        </p>

        <h2>How We Use Information</h2>
        <p>The anonymous analytics data we collect is used solely to:</p>
        <ul>
          <li>Understand which calculators are most useful to visitors</li>
          <li>Improve calculator accuracy, performance, and user experience</li>
          <li>Identify and fix technical issues</li>
          <li>Make informed decisions about which new calculators to build</li>
        </ul>
        <p>
          We do not sell, rent, trade, or otherwise share any data with third parties for marketing
          or advertising purposes. We do not build user profiles. We do not track you across other websites.
        </p>

        <h2>Cookies &amp; Tracking</h2>
        <p>CalcuAI uses a limited number of cookies:</p>
        <ul>
          <li>
            <strong>Analytics cookies:</strong> We use Google Analytics to collect anonymous usage
            statistics. These cookies help us understand how visitors interact with our Site. Google
            Analytics data is aggregated and does not identify individual users. You can opt out of
            Google Analytics by installing the{' '}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              Google Analytics Opt-out Browser Add-on
            </a>.
          </li>
          <li>
            <strong>Essential cookies:</strong> Minimal cookies required for the Site to function
            properly (e.g., remembering your cookie preferences). These do not track your behavior.
          </li>
        </ul>
        <p>
          We do not use advertising cookies, retargeting pixels, or social media tracking scripts.
        </p>

        <h2>Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li>
            <strong>Google Analytics:</strong> For anonymous website usage statistics. Google&apos;s
            privacy policy is available at{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              policies.google.com/privacy
            </a>.
          </li>
          <li>
            <strong>Vercel:</strong> Our hosting provider. Vercel&apos;s privacy policy is available at{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
              vercel.com/legal/privacy-policy
            </a>.
          </li>
        </ul>
        <p>
          CalcuAI does not currently display advertisements. If this changes in the future, this
          Privacy Policy will be updated accordingly.
        </p>

        <h2>Data Retention</h2>
        <p>
          Since we do not collect personal data, there is no personal data to retain or delete.
          Anonymous analytics data is retained within Google Analytics according to our configured
          retention settings (currently 14 months) and is used only in aggregate form.
        </p>
        <p>
          Calculator inputs you enter are processed entirely in your browser. We do not store,
          log, or transmit your calculation inputs or results to our servers.
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          CalcuAI is not directed at children under the age of 13. We do not knowingly collect
          personal information from children under 13. Since our Site does not require accounts or
          collect personal data, we believe our service is compliant with the Children&apos;s Online
          Privacy Protection Act (COPPA). If you believe a child has somehow provided us with
          personal information, please contact us at{' '}
          <a href="mailto:contact@calcuai.com">contact@calcuai.com</a> and we will promptly
          address the concern.
        </p>

        <h2>Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>
            <strong>Opt out of analytics cookies:</strong> Use the Google Analytics Opt-out Browser
            Add-on or configure your browser to block third-party cookies.
          </li>
          <li>
            <strong>Browse without cookies:</strong> You can use most of our calculators with
            cookies disabled, though some functionality may be limited.
          </li>
          <li>
            <strong>Contact us with questions:</strong> If you have any privacy-related questions
            or concerns, we are happy to address them.
          </li>
        </ul>
        <p>
          Since we do not collect personal data, there is no personal data to access, correct,
          or delete. If you are located in the EU/EEA or California and have questions about your
          rights under GDPR or CCPA, please contact us and we will respond promptly.
        </p>

        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time to reflect changes in our practices
          or for other operational, legal, or regulatory reasons. When we make changes, we will
          update the &quot;Last updated&quot; date at the top of this page. We encourage you to review
          this policy periodically. Your continued use of the Site after any changes constitutes
          acceptance of the updated policy.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or our data practices, please
          contact us at:
        </p>
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:contact@calcuai.com">contact@calcuai.com</a>
        </p>
      </div>
    </div>
  );
}
