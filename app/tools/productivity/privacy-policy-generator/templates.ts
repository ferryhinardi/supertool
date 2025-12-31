export interface CompanyInfo {
  companyName: string
  websiteUrl: string
  contactEmail: string
  country: string
  state?: string
  effectiveDate: string
}

export type IndustryType = 'saas' | 'ecommerce' | 'blog' | 'mobile-app' | 'general'
export type JurisdictionType = 'us' | 'eu-gdpr' | 'ccpa' | 'international'
export type DocumentType = 'privacy-policy' | 'cookie-policy' | 'terms-of-service'

export interface TemplateOptions {
  industry: IndustryType
  jurisdiction: JurisdictionType[]
  includeAnalytics: boolean
  includeCookies: boolean
  includeThirdPartyServices: boolean
  includeDataRetention: boolean
  includeChildrenPrivacy: boolean
  includeCaliforniaRights: boolean
  includeGDPRRights: boolean
}

export const INDUSTRIES = [
  {
    id: 'general',
    label: 'General Website',
    description: 'Standard privacy policy for any website',
  },
  {
    id: 'saas',
    label: 'SaaS/Software',
    description: 'For software-as-a-service and web applications',
  },
  {
    id: 'ecommerce',
    label: 'E-commerce',
    description: 'For online stores and marketplaces',
  },
  {
    id: 'blog',
    label: 'Blog/Content',
    description: 'For blogs, news sites, and content platforms',
  },
  {
    id: 'mobile-app',
    label: 'Mobile App',
    description: 'For iOS and Android applications',
  },
] as const

export const JURISDICTIONS = [
  {
    id: 'us',
    label: 'United States',
    description: 'US federal privacy laws',
    required: false,
  },
  {
    id: 'eu-gdpr',
    label: 'EU (GDPR)',
    description: 'European Union General Data Protection Regulation',
    required: false,
  },
  {
    id: 'ccpa',
    label: 'California (CCPA)',
    description: 'California Consumer Privacy Act',
    required: false,
  },
  {
    id: 'international',
    label: 'International',
    description: 'Global best practices',
    required: true,
  },
] as const

export function generatePrivacyPolicy(companyInfo: CompanyInfo, options: TemplateOptions): string {
  const sections: string[] = []

  // Header
  sections.push(`# Privacy Policy

**Effective Date:** ${companyInfo.effectiveDate}

**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

This Privacy Policy describes how ${companyInfo.companyName} ("we", "us", or "our") collects, uses, and shares your personal information when you visit or make a purchase from ${companyInfo.websiteUrl} (the "Site").
`)

  // Information We Collect
  sections.push(`## 1. Information We Collect

We collect information about you in the following ways:

### Information You Provide
When you use our ${options.industry === 'saas' ? 'service' : options.industry === 'ecommerce' ? 'store' : 'website'}, we collect information that you provide directly to us, including:

- **Account Information:** Name, email address, password${options.industry === 'ecommerce' ? ', billing and shipping addresses' : ''}
- **Profile Information:** ${options.industry === 'saas' ? 'Company name, job title, preferences' : options.industry === 'ecommerce' ? 'Purchase history, saved items, preferences' : 'User preferences and settings'}
- **Communications:** Information you provide when you contact us, subscribe to newsletters, or participate in surveys
${options.industry === 'ecommerce' ? '- **Payment Information:** Credit card details, billing address (processed securely by our payment processor)\n' : ''}

### Information Collected Automatically
When you access our ${options.industry === 'saas' ? 'service' : options.industry === 'mobile-app' ? 'app' : 'website'}, we automatically collect certain information, including:

- **Device Information:** IP address, browser type, operating system${options.industry === 'mobile-app' ? ', device model, mobile carrier' : ''}
- **Usage Information:** Pages visited, features used, time spent, referring URLs
${options.includeAnalytics ? '- **Analytics Data:** We use analytics services to understand how users interact with our service\n' : ''}${options.includeCookies ? '- **Cookies and Similar Technologies:** We use cookies and similar tracking technologies (see Cookie Policy below)\n' : ''}
`)

  // How We Use Your Information
  sections.push(`## 2. How We Use Your Information

We use the information we collect for the following purposes:

- **Provide and maintain our ${options.industry === 'saas' ? 'service' : options.industry === 'ecommerce' ? 'store' : 'website'}:** To operate and provide you with the features and functionality
${options.industry === 'ecommerce' ? '- **Process transactions:** To process payments and fulfill orders\n' : ''}${options.industry === 'saas' ? '- **Account management:** To create and manage your account, provide customer support\n' : ''}- **Communications:** To send you updates, newsletters, marketing materials (with your consent)
- **Improve our services:** To understand usage patterns and improve user experience
- **Security:** To detect, prevent, and address technical issues and fraudulent activity
- **Legal compliance:** To comply with applicable laws, regulations, and legal processes
`)

  // Data Sharing
  sections.push(`## 3. How We Share Your Information

We may share your information in the following circumstances:

- **Service Providers:** We share information with third-party service providers who perform services on our behalf (e.g., ${options.industry === 'ecommerce' ? 'payment processing, shipping, ' : ''}hosting, analytics, customer support)
${options.includeThirdPartyServices ? '- **Third-Party Services:** When you integrate third-party services with your account\n' : ''}- **Legal Requirements:** When required by law, subpoena, or other legal process
- **Business Transfers:** In connection with a merger, acquisition, or sale of assets
- **With Your Consent:** When you explicitly consent to sharing your information

We do not sell your personal information to third parties.
`)

  // GDPR Section
  if (options.jurisdiction.includes('eu-gdpr') || options.includeGDPRRights) {
    sections.push(`## 4. Your Rights (GDPR)

If you are located in the European Economic Area (EEA), you have certain rights regarding your personal information:

- **Right to Access:** You can request a copy of the personal information we hold about you
- **Right to Rectification:** You can request that we correct inaccurate or incomplete information
- **Right to Erasure:** You can request that we delete your personal information ("right to be forgotten")
- **Right to Restrict Processing:** You can request that we limit how we use your information
- **Right to Data Portability:** You can request a copy of your information in a machine-readable format
- **Right to Object:** You can object to certain types of processing of your information
- **Right to Withdraw Consent:** You can withdraw consent at any time (without affecting prior processing)

To exercise these rights, please contact us at ${companyInfo.contactEmail}.
`)
  }

  // CCPA Section
  if (options.jurisdiction.includes('ccpa') || options.includeCaliforniaRights) {
    sections.push(`## ${options.jurisdiction.includes('eu-gdpr') ? '5' : '4'}. California Privacy Rights (CCPA)

If you are a California resident, you have the following rights:

- **Right to Know:** You can request information about the categories and specific pieces of personal information we have collected
- **Right to Delete:** You can request deletion of your personal information
- **Right to Opt-Out:** You can opt-out of the sale of your personal information (we do not sell personal information)
- **Right to Non-Discrimination:** We will not discriminate against you for exercising your CCPA rights

To submit a request, contact us at ${companyInfo.contactEmail}. We will verify your identity before processing your request.
`)
  }

  const sectionNum =
    options.jurisdiction.includes('eu-gdpr') && options.jurisdiction.includes('ccpa')
      ? 6
      : options.jurisdiction.includes('eu-gdpr') || options.jurisdiction.includes('ccpa')
        ? 5
        : 4

  // Data Security
  sections.push(`## ${sectionNum}. Data Security

We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:

${options.industry === 'ecommerce' ? '- Secure Socket Layer (SSL) encryption for payment transactions\n' : ''}- Encryption of data in transit and at rest
- Regular security assessments and monitoring
- Access controls and authentication mechanisms
- Employee training on data protection

However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
`)

  // Data Retention
  if (options.includeDataRetention) {
    sections.push(`## ${sectionNum + 1}. Data Retention

We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.

${options.industry === 'ecommerce' ? '- **Transaction Records:** We retain order and payment information for accounting and legal purposes (typically 7 years)\n' : ''}- **Account Information:** We retain account data while your account is active and for a reasonable period thereafter
- **Marketing Data:** We retain marketing preferences until you unsubscribe or request deletion

When we no longer need your information, we will securely delete or anonymize it.
`)
  }

  // Children's Privacy
  if (options.includeChildrenPrivacy) {
    sections.push(`## ${sectionNum + (options.includeDataRetention ? 2 : 1)}. Children's Privacy

Our ${options.industry === 'saas' ? 'service' : options.industry === 'mobile-app' ? 'app' : 'website'} is not intended for children under the age of ${options.jurisdiction.includes('eu-gdpr') ? '16' : '13'}. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately at ${companyInfo.contactEmail}, and we will take steps to delete such information.
`)
  }

  const finalSectionNum =
    sectionNum + (options.includeDataRetention ? 1 : 0) + (options.includeChildrenPrivacy ? 1 : 0)

  // Cookies Section
  if (options.includeCookies) {
    sections.push(`## ${finalSectionNum + 1}. Cookies and Tracking Technologies

We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings. For more information, see our Cookie Policy.

### Types of Cookies We Use:
- **Essential Cookies:** Required for the website to function properly
- **Analytics Cookies:** Help us understand how visitors use our site
- **Functional Cookies:** Remember your preferences and settings
${options.includeAnalytics ? '- **Marketing Cookies:** Track your activity for advertising purposes (with your consent)\n' : ''}
`)
  }

  // Third-Party Links
  sections.push(`## ${finalSectionNum + (options.includeCookies ? 2 : 1)}. Third-Party Links

Our ${options.industry === 'saas' ? 'service' : options.industry === 'mobile-app' ? 'app' : 'website'} may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies before providing any information.
`)

  // International Transfers
  if (options.jurisdiction.includes('eu-gdpr') || options.jurisdiction.includes('international')) {
    sections.push(`## ${finalSectionNum + (options.includeCookies ? 3 : 2)}. International Data Transfers

Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws different from those in your country.

${options.jurisdiction.includes('eu-gdpr') ? 'If you are located in the EEA, we ensure that appropriate safeguards are in place when transferring your data outside the EEA, such as Standard Contractual Clauses approved by the European Commission.\n' : ''}
`)
  }

  // Changes to Policy
  sections.push(`## ${finalSectionNum + (options.includeCookies ? 3 : 2) + (options.jurisdiction.includes('eu-gdpr') || options.jurisdiction.includes('international') ? 1 : 0)}. Changes to This Privacy Policy

We may update this Privacy Policy from time to time. We will notify you of any material changes by:
- Posting the updated policy on this page
- Updating the "Last Updated" date at the top
${options.includeAnalytics ? '- Sending an email notification (if you have an account with us)\n' : ''}

We encourage you to review this Privacy Policy periodically.
`)

  // Contact Information
  sections.push(`## ${finalSectionNum + (options.includeCookies ? 4 : 3) + (options.jurisdiction.includes('eu-gdpr') || options.jurisdiction.includes('international') ? 1 : 0)}. Contact Us

If you have any questions about this Privacy Policy or our privacy practices, please contact us:

**${companyInfo.companyName}**  
Email: ${companyInfo.contactEmail}  
Website: ${companyInfo.websiteUrl}  
${companyInfo.state ? `Location: ${companyInfo.state}, ${companyInfo.country}` : `Location: ${companyInfo.country}`}

${options.jurisdiction.includes('eu-gdpr') ? `\n**Data Protection Officer (DPO):**  \nFor GDPR-related inquiries, you may contact our Data Protection Officer at ${companyInfo.contactEmail}` : ''}
`)

  return sections.join('\n')
}

export function generateCookiePolicy(companyInfo: CompanyInfo): string {
  return `# Cookie Policy

**Effective Date:** ${companyInfo.effectiveDate}

**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## What Are Cookies?

Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.

## How We Use Cookies

${companyInfo.companyName} uses cookies and similar technologies for the following purposes:

### 1. Essential Cookies
These cookies are necessary for the website to function properly. They enable core functionality such as:
- User authentication and security
- Session management
- Load balancing
- Form submissions

You cannot opt-out of essential cookies as they are required for the website to work.

### 2. Analytics Cookies
We use analytics cookies to understand how visitors interact with our website. These cookies help us:
- Track page views and user journeys
- Measure website performance
- Identify areas for improvement
- Generate statistical reports

**Provider:** Google Analytics  
**Data Collected:** IP address (anonymized), browser type, pages visited, time spent  
**Retention:** 26 months

### 3. Functional Cookies
These cookies remember your preferences and settings to provide a personalized experience:
- Language preferences
- Regional settings
- Display preferences
- Saved items (e.g., shopping cart)

### 4. Marketing Cookies
With your consent, we use marketing cookies to:
- Display relevant advertisements
- Measure advertising effectiveness
- Retarget website visitors
- Build audience profiles

**Third-Party Providers:** Google Ads, Facebook Pixel (if applicable)

## Managing Cookies

You can control and manage cookies in several ways:

### Browser Settings
Most web browsers allow you to:
- View and delete cookies
- Block cookies from specific websites
- Block all cookies
- Clear cookies when you close your browser

**Note:** Blocking or deleting cookies may affect website functionality.

### Opt-Out Tools
- **Google Analytics:** [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout)
- **Network Advertising Initiative:** [NAI Opt-out](http://www.networkadvertising.org/choices/)
- **Digital Advertising Alliance:** [DAA Opt-out](http://www.aboutads.info/choices/)

### Cookie Consent Manager
When you first visit our website, you will see a cookie consent banner. You can manage your cookie preferences at any time by:
- Clicking the "Cookie Settings" link in the footer
- Accessing your browser settings
- Contacting us at ${companyInfo.contactEmail}

## Cookie List

Below is a list of cookies we use:

| Cookie Name | Type | Purpose | Duration |
|-------------|------|---------|----------|
| session_id | Essential | User session management | Session |
| csrf_token | Essential | Security and form protection | Session |
| _ga | Analytics | Google Analytics tracking | 2 years |
| _gid | Analytics | Google Analytics tracking | 24 hours |
| preferences | Functional | User preferences and settings | 1 year |

## Updates to This Policy

We may update this Cookie Policy from time to time. The "Last Updated" date at the top indicates when the policy was last revised.

## Contact Us

If you have questions about our use of cookies, please contact us:

**${companyInfo.companyName}**  
Email: ${companyInfo.contactEmail}  
Website: ${companyInfo.websiteUrl}
`
}

export function generateTermsOfService(companyInfo: CompanyInfo, industry: IndustryType): string {
  return `# Terms of Service

**Effective Date:** ${companyInfo.effectiveDate}

**Last Updated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

## 1. Agreement to Terms

By accessing or using ${companyInfo.websiteUrl} (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.

## 2. Description of Service

${companyInfo.companyName} provides ${industry === 'saas' ? 'a software-as-a-service platform' : industry === 'ecommerce' ? 'an online marketplace for purchasing products' : industry === 'mobile-app' ? 'a mobile application' : 'a website and related services'} (collectively, the "Service").

${industry === 'saas' ? '### Service Features\n- Account creation and management\n- Access to software features and functionality\n- Customer support\n- Data storage and processing\n' : ''}${industry === 'ecommerce' ? '### Service Features\n- Product browsing and search\n- Secure payment processing\n- Order fulfillment\n- Customer support\n' : ''}

## 3. User Accounts

${
  industry === 'saas' || industry === 'ecommerce'
    ? `### Account Creation
To use certain features of the Service, you must create an account. You agree to:
- Provide accurate, current, and complete information
- Maintain the security of your password
- Notify us immediately of any unauthorized access
- Accept responsibility for all activities under your account

### Account Termination
We reserve the right to suspend or terminate your account if you violate these Terms.
`
    : 'You may use the Service without creating an account, but certain features may require registration.'
}

## 4. Acceptable Use Policy

You agree NOT to:
- Violate any laws or regulations
- Infringe on intellectual property rights
- Transmit viruses, malware, or harmful code
- Attempt to gain unauthorized access to the Service
- Harass, abuse, or harm other users
- Use the Service for fraudulent purposes
${industry === 'saas' ? '- Reverse engineer or attempt to extract source code\n' : ''}${industry === 'ecommerce' ? '- Make unauthorized purchases or fraudulent transactions\n' : ''}- Scrape, crawl, or data mine the Service without permission

Violations may result in account termination and legal action.

## 5. ${industry === 'ecommerce' ? 'Purchases and Payments' : 'Payment Terms'}

${
  industry === 'ecommerce'
    ? `### Product Information
We strive to display accurate product information, but we do not guarantee accuracy. Prices and availability are subject to change without notice.

### Orders and Payment
- All orders are subject to acceptance and availability
- Payment is required at the time of purchase
- We accept [payment methods]
- Prices are in [currency]

### Shipping and Delivery
- Shipping times are estimates and not guaranteed
- Risk of loss passes to you upon delivery
- International orders may be subject to customs fees

### Returns and Refunds
- Returns must be made within [X days] of purchase
- Items must be in original condition
- Refunds will be processed within [X days]
- Shipping costs are non-refundable
`
    : industry === 'saas'
      ? `### Subscription Plans
We offer various subscription plans with different features and pricing. By subscribing:
- You agree to pay the subscription fees
- Payments are processed automatically
- Subscriptions renew automatically unless canceled

### Cancellation
You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds for partial periods.

### Price Changes
We may change subscription prices with 30 days' notice. Continued use after price change constitutes acceptance.
`
      : 'Payment terms will be provided at the time of purchase, if applicable.'
}

## 6. Intellectual Property Rights

### Our Content
All content on the Service, including text, graphics, logos, images, and software, is owned by ${companyInfo.companyName} or our licensors and is protected by copyright, trademark, and other intellectual property laws.

### Your Content
${industry === 'saas' ? 'You retain ownership of content you upload to the Service ("User Content"). By uploading User Content, you grant us a license to use, store, and process it as necessary to provide the Service.' : 'If you submit content to the Service, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content.'}

## 7. Disclaimers

THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:

- Warranties of merchantability
- Fitness for a particular purpose
- Non-infringement
- Accuracy, reliability, or availability of the Service

WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.

## 8. Limitation of Liability

TO THE MAXIMUM EXTENT PERMITTED BY LAW, ${companyInfo.companyName.toUpperCase()} SHALL NOT BE LIABLE FOR:

- Indirect, incidental, special, or consequential damages
- Loss of profits, data, or business opportunities
- Damages arising from your use or inability to use the Service
${industry === 'ecommerce' ? '- Product defects or delivery issues\n' : ''}

OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE PAST 12 MONTHS, OR $100, WHICHEVER IS GREATER.

## 9. Indemnification

You agree to indemnify and hold harmless ${companyInfo.companyName}, its affiliates, and their respective officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including attorney's fees) arising from:

- Your use of the Service
- Your violation of these Terms
- Your violation of any rights of another party
${industry === 'saas' ? '- Your User Content\n' : ''}

## 10. Dispute Resolution

### Governing Law
These Terms are governed by the laws of ${companyInfo.state ? `${companyInfo.state}, ${companyInfo.country}` : companyInfo.country}, without regard to conflict of law principles.

### Arbitration
Any disputes arising from these Terms or the Service shall be resolved through binding arbitration, except:
- Small claims court matters
- Intellectual property disputes
- Injunctive relief

### Class Action Waiver
You agree to resolve disputes on an individual basis and waive the right to participate in class actions or representative proceedings.

## 11. Termination

We may terminate or suspend your access to the Service at any time, with or without cause, with or without notice.

Upon termination:
${industry === 'saas' ? '- Your account will be deactivated\n- You will lose access to your data\n- Subscription fees are non-refundable\n' : '- You must cease using the Service\n- Certain provisions of these Terms will survive termination\n'}

## 12. Changes to Terms

We reserve the right to modify these Terms at any time. We will notify you of material changes by:
- Posting the updated Terms on this page
- Updating the "Last Updated" date
${industry === 'saas' || industry === 'ecommerce' ? '- Sending an email notification\n' : ''}

Continued use of the Service after changes constitutes acceptance of the new Terms.

## 13. Miscellaneous

### Entire Agreement
These Terms constitute the entire agreement between you and ${companyInfo.companyName} regarding the Service.

### Severability
If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full effect.

### Waiver
Our failure to enforce any right or provision of these Terms will not constitute a waiver of such right or provision.

### Assignment
You may not assign or transfer these Terms without our consent. We may assign these Terms without restriction.

## 14. Contact Information

If you have questions about these Terms, please contact us:

**${companyInfo.companyName}**  
Email: ${companyInfo.contactEmail}  
Website: ${companyInfo.websiteUrl}  
${companyInfo.state ? `Location: ${companyInfo.state}, ${companyInfo.country}` : `Location: ${companyInfo.country}`}
`
}
