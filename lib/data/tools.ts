import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  Braces,
  Brain,
  Cake,
  Calendar,
  Camera,
  Clipboard,
  Clock,
  Code,
  CookingPot,
  Database,
  Dices,
  Diff,
  DollarSign,
  Eye,
  EyeOff,
  FileCheck,
  FileDown,
  FileImage,
  FileJson,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  FolderEdit,
  Gauge,
  GitCompare,
  Globe,
  Grid,
  Hash,
  Image,
  ImagePlus,
  Key,
  Layers,
  Lightbulb,
  Link2,
  Lock,
  Mail,
  MessageSquare,
  Minimize2,
  Network,
  Palette,
  PenTool,
  Percent,
  QrCode,
  Repeat,
  ScanLine,
  Scissors,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Table,
  Terminal,
  Timer,
  TrendingDown,
  Type,
  Upload,
  Users,
  Video,
  Wand2,
} from 'lucide-react'
import type React from 'react'

export type ToolCategory =
  | 'all'
  | 'data'
  | 'media'
  | 'development'
  | 'productivity'
  | 'security'
  | 'finance'
  | 'design'

export interface Tool {
  title: string
  description: string
  icon: React.ElementType
  href: string
  gradient: string
  features: string[]
  category: ToolCategory
  comingSoon?: boolean
  popular?: boolean
  new?: boolean
  premium?: boolean // Requires paid subscription for access
  sidebarPriority?: 'high' | 'low' // Controls ordering within sidebar category groups
}

export const tools: Tool[] = [
  // Popular tools first
  {
    title: 'JSON Beautifier & Formatter',
    description:
      'Professional JSON formatting tool with real-time syntax highlighting, validation, minification, and error detection. Perfect for debugging API responses and configuration files.',
    icon: Code,
    href: '/tools/data/json-beautify',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Syntax Highlighting', 'Validation', 'Minify', 'Copy & Download'],
    category: 'data',
    popular: true,
  },

  // New tools
  {
    title: 'URL Encoder/Decoder',
    description:
      'Encode and decode URLs with encodeURI, encodeURIComponent, and their decode counterparts. Handle special characters in URLs and query parameters.',
    icon: Link2,
    href: '/tools/development/url-encoder',
    gradient: 'from-cyan-500 to-blue-500',
    features: [
      'encodeURI & encodeURIComponent',
      'decodeURI & decodeURIComponent',
      'Swap input/output',
      'Quick examples',
    ],
    category: 'development',
    new: true,
  },
  {
    title: 'Case Converter',
    description:
      'Convert text between camelCase, PascalCase, snake_case, kebab-case, and more. Preview all case formats at once.',
    icon: Type,
    href: '/tools/productivity/case-converter',
    gradient: 'from-purple-500 to-pink-500',
    features: ['11 case formats', 'Preview all at once', 'One-click copy', 'Smart word detection'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Random Generator',
    description:
      'Generate cryptographically secure random numbers, strings, UUIDs, and passwords. Perfect for testing and development.',
    icon: Dices,
    href: '/tools/data/random-generator',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Numbers & decimals', 'Custom strings', 'UUID v4', 'Secure passwords'],
    category: 'data',
    new: true,
  },
  {
    title: 'Countdown Timer',
    description:
      'Set a countdown to any date and time. Share the link with others to count down together.',
    icon: Clock,
    href: '/tools/productivity/countdown-timer',
    gradient: 'from-orange-500 to-red-500',
    features: ['Live countdown', 'Shareable links', 'Quick presets', 'Event naming'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Resume Builder Pro',
    description:
      'Professional resume builder with 10 ATS-optimized templates. Create stunning resumes with real-time preview, ATS scoring, and export to PDF or JSON. Perfect for job seekers and career changers.',
    icon: FileText,
    href: '/tools/productivity/resume-builder',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['10 Templates', 'ATS Score', 'Live Preview', 'PDF/JSON Export'],
    category: 'productivity',
    new: true,
    popular: true,
    sidebarPriority: 'high',
  },
  {
    title: 'Cover Letter Builder',
    description:
      'Create professional cover letters with 5 customizable templates. Real-time preview, word count tracking, and export to visual or ATS-friendly PDF. Perfect companion to Resume Builder.',
    icon: FileText,
    href: '/tools/productivity/cover-letter-builder',
    gradient: 'from-purple-500 to-pink-500',
    features: ['5 Templates', 'Word Count', 'Live Preview', 'PDF/JSON Export'],
    category: 'productivity',
    new: true,
    popular: true,
    sidebarPriority: 'high',
  },
  {
    title: 'Privacy Policy Generator',
    description:
      'Generate GDPR & CCPA compliant privacy policies, cookie policies, and terms of service instantly. Professional templates for SaaS, e-commerce, blogs, and mobile apps. Download as HTML or PDF.',
    icon: FileCheck,
    href: '/tools/productivity/privacy-policy-generator',
    gradient: 'from-green-500 to-emerald-500',
    features: ['GDPR & CCPA', '3 Document Types', 'PDF/HTML Export', '5 Industries'],
    category: 'productivity',
    new: true,
    popular: true,
  },
  {
    title: 'Code Diff Viewer',
    description:
      'GitHub-style diff comparison tool for text, JSON, and code files. Compare changes side-by-side with split or unified view, perfect for code reviews and version control.',
    icon: GitCompare,
    href: '/tools/development/diff',
    gradient: 'from-orange-500 to-red-500',
    features: ['Split/Unified View', 'JSON Support', 'Syntax Highlighting', 'Line Numbers'],
    category: 'development',
    new: true,
  },
  {
    title: 'AI Code Converter',
    description:
      'Convert code between 12+ programming languages instantly with AI. Translate Python, JavaScript, TypeScript, Java, C++, Go, Rust, and more. Includes syntax highlighting, explanations, and optimization options.',
    icon: Sparkles,
    href: '/tools/development/ai-code-converter',
    gradient: 'from-yellow-500 to-orange-500',
    features: ['12+ Languages', 'AI-Powered', 'Syntax Highlighting', 'Code Optimization'],
    category: 'development',
    new: true,
    popular: true,
  },
  {
    title: 'Webhook Tester',
    description:
      'Test and debug webhooks in real-time. Generate unique webhook URLs, inspect incoming requests with headers and payloads, customize responses, and view request history. Perfect for webhook development.',
    icon: Activity,
    href: '/tools/development/webhook-tester',
    gradient: 'from-green-500 to-cyan-500',
    features: ['Unique URLs', 'Real-Time Updates', 'Request Inspector', 'Custom Responses'],
    category: 'development',
    new: true,
  },
  {
    title: 'Regex Tester',
    description:
      'Test and validate regular expressions with live matching and syntax highlighting. Comprehensive pattern library, multi-language code generation, and detailed match results. Perfect for regex development.',
    icon: Search,
    href: '/tools/development/regex-tester',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Live Matching', 'Pattern Library', 'Code Generation', 'Match Highlighting'],
    category: 'development',
    new: true,
  },
  {
    title: 'SQL Formatter',
    description:
      'Format and beautify SQL queries with proper indentation and syntax highlighting. Support for multiple SQL dialects (MySQL, PostgreSQL, SQLite, SQL Server). Minify SQL for production use.',
    icon: Database,
    href: '/tools/development/sql-formatter',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Multi-Dialect Support', 'Format & Minify', 'Syntax Validation', 'Example Queries'],
    category: 'development',
    new: true,
  },
  {
    title: 'Markdown Editor & Preview',
    description:
      'GitHub-flavored markdown editor with live preview. Write README files, PR summaries, and documentation with support for tables, task lists, code highlighting, and more.',
    icon: FileText,
    href: '/tools/productivity/markdown-editor',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Live Preview', 'GFM Support', 'Syntax Highlight', 'Export HTML/MD'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'URL Shortener & Analytics',
    description:
      'Create short, memorable links with custom aliases. Track clicks, geographic data, referrers, and user devices. Generate QR codes for easy mobile sharing.',
    icon: Globe,
    href: '/tools/productivity/url-shortener',
    gradient: 'from-cyan-500 to-blue-500',
    features: ['Custom Aliases', 'Click Analytics', 'QR Codes', 'Link Management'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Text Transformer & Counter',
    description:
      'Powerful text manipulation tool with 20+ operations: case conversion, duplicate removal, word/character counting, sorting, trimming, and find-replace with regex support.',
    icon: Scissors,
    href: '/tools/productivity/text-transformer',
    gradient: 'from-yellow-500 to-orange-500',
    features: ['Case Conversion', 'Word Count', 'Remove Duplicates', 'Sort Lines'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Lorem Ipsum Generator',
    description:
      'Generate placeholder text for your designs and mockups. Create paragraphs, sentences, or words with customizable count and HTML formatting.',
    icon: FileText,
    href: '/tools/productivity/lorem-ipsum',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Paragraphs/Sentences/Words', 'HTML Format', 'Text Statistics', 'Copy to Clipboard'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Word Counter Pro',
    description:
      'Comprehensive text analysis tool that counts words, characters, sentences, and paragraphs. Get reading time estimates, keyword density analysis, and detailed text statistics.',
    icon: Type,
    href: '/tools/productivity/word-counter',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Word/Character Count', 'Reading Time', 'Keyword Density', 'Text Statistics'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Character Map',
    description:
      'Browse and copy 300+ special characters, symbols, and Unicode characters with a single click. Includes arrows, math symbols, currency signs, Greek letters, punctuation, and more.',
    icon: Grid,
    href: '/tools/productivity/character-map',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['300+ Characters', 'Search', 'Copy to Clipboard', '6 Categories'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Email Signature Generator',
    description:
      'Create professional HTML email signatures with customizable templates, social icons, colors, and branding. Export as HTML or plain text for any email client.',
    icon: Mail,
    href: '/tools/productivity/email-signature',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['6 Templates', 'Social Icons', 'Custom Branding', 'HTML/Text Export'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Image Optimizer & Converter',
    description:
      'Professional image compression tool that reduces file size by up to 80% without visible quality loss. Supports JPG, PNG, WebP formats with bulk processing and dimension resizing.',
    icon: Image,
    href: '/tools/media/image-optimizer',
    gradient: 'from-teal-500 to-cyan-500',
    features: ['WebP/AVIF', 'Bulk Processing', 'Quality Control', 'Resize'],
    category: 'media',
    new: true,
  },
  {
    title: 'Video Converter & Compressor',
    description:
      'Convert videos between formats (MP4, WebM, AVI, MOV) and compress file sizes with modern codecs (H.264, H.265, VP9). All processing happens in your browser using FFmpeg.',
    icon: Video,
    href: '/tools/media/video-converter',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Multiple Formats', 'Fast Conversion', 'Compression', 'Web Optimized'],
    category: 'media',
    new: true,
  },
  {
    title: 'Image to PDF Converter',
    description:
      'Convert JPG, PNG, WebP, and other image formats to PDF instantly. Combine multiple images into a single PDF document with customizable page size, orientation, and layout options.',
    icon: FileText,
    href: '/tools/media/image-to-pdf',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Multiple Images', 'Custom Pages', 'No Upload', 'Instant Download'],
    category: 'media',
    new: true,
  },
  {
    title: 'Video Subtitle Combiner',
    description:
      'Merge SRT subtitle files with your videos directly in the browser. Burn subtitles permanently into video files with customizable fonts, colors, and positioning using FFmpeg.',
    icon: FileText,
    href: '/tools/media/video-subtitle-combiner',
    gradient: 'from-blue-500 via-indigo-500 to-purple-500',
    features: ['SRT Support', 'Custom Styling', 'Burn Subtitles', 'Browser Processing'],
    category: 'media',
    new: true,
  },
  {
    title: 'Meme Generator',
    description:
      'Create viral memes in seconds with 25+ popular templates or upload your own image. Add text, customize fonts, and download instantly. Perfect for social media content creators.',
    icon: Sparkles,
    href: '/tools/media/meme-generator',
    gradient: 'from-purple-500 to-pink-500',
    features: ['25+ Templates', 'Custom Upload', 'Text Customization', 'Instant Download'],
    category: 'media',
    new: true,
  },

  // Active tools (not popular or new)
  {
    title: 'Cloud File Upload',
    description:
      'Secure cloud storage uploader with drag-and-drop interface. Upload any file type and get instant shareable public URLs with automatic cloud backup and CDN delivery.',
    icon: Upload,
    href: '/tools/productivity/upload',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Drag & Drop', 'Cloud Storage', 'Public URLs', 'Instant Sharing'],
    category: 'productivity',
    premium: true, // Cloud storage and CDN delivery costs
    sidebarPriority: 'high',
  },

  // Coming soon tools
  {
    title: 'Base64 Encoder & Decoder',
    description:
      'Convert text, files, and images to Base64 encoding with instant decoding support. Preview encoded images directly in browser before downloading or copying.',
    icon: Lock,
    href: '/tools/security/base64',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['Text & Files', 'Image Preview', 'Copy & Download', 'URL Safe'],
    category: 'security',
    new: true,
  },

  // Finance & Calculations
  {
    title: 'Split Bill Calculator',
    description:
      'Split bills among friends with ease. Calculate individual shares, add tips and taxes, track payments, and generate shareable summaries. Perfect for dining out or shared expenses.',
    icon: Users,
    href: '/tools/finance/split-bill',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Multiple People', 'Tip & Tax', 'Payment Tracking', 'Share Summary'],
    category: 'finance',
    new: true,
    popular: true,
  },
  {
    title: 'QR Code Generator',
    description:
      'Generate QR codes instantly for URLs, text, WiFi credentials, contact info, and more. Customize colors, add logos, and download in high resolution PNG or SVG format.',
    icon: QrCode,
    href: '/tools/productivity/qr-code',
    gradient: 'from-violet-500 to-purple-500',
    features: ['Multiple Types', 'Customizable', 'High Resolution', 'Logo Support'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Password Generator',
    description:
      'Generate cryptographically secure passwords with customizable length and character sets. Includes password strength meter, bulk generation, and memorable password options.',
    icon: Key,
    href: '/tools/security/password-generator',
    gradient: 'from-red-500 to-pink-500',
    features: ['Secure Random', 'Custom Rules', 'Strength Meter', 'Bulk Generate'],
    category: 'security',
    new: true,
    popular: true,
  },
  {
    title: 'Unit Converter',
    description:
      'Convert between 30+ unit categories including length, weight, temperature, volume, area, speed, time, and more. Supports metric, imperial, and scientific units.',
    icon: Repeat,
    href: '/tools/productivity/unit-converter',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['30+ Categories', 'Bidirectional', 'Favorites', 'Scientific Units'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Timezone Converter',
    description:
      'Convert time across multiple timezones with DST awareness. Perfect for scheduling international meetings, coordinating with remote teams, and tracking global events.',
    icon: Globe,
    href: '/tools/productivity/timezone-converter',
    gradient: 'from-indigo-500 to-blue-500',
    features: ['Multiple Zones', 'DST Aware', 'Meeting Planner', 'Time Slider'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Tip Calculator',
    description:
      'Calculate tips quickly with preset percentages (10%, 15%, 18%, 20%) or custom amounts. Split bills among multiple people and round totals up or down for convenience.',
    icon: DollarSign,
    href: '/tools/finance/tip-calculator',
    gradient: 'from-green-500 to-teal-500',
    features: ['Quick Presets', 'Split Bill', 'Round Options', 'Total Summary'],
    category: 'finance',
    new: true,
  },
  {
    title: 'Currency Converter',
    description:
      'Convert between 150+ world currencies with real-time exchange rates. View historical rate charts, save favorite pairs, and get accurate conversion calculations.',
    icon: DollarSign,
    href: '/tools/finance/currency-converter',
    gradient: 'from-yellow-500 to-orange-500',
    features: ['Live Rates', '150+ Currencies', 'Rate History', 'Favorites'],
    category: 'finance',
    new: true,
    premium: true, // Requires paid exchange rate API (e.g., exchangerate-api.io, fixer.io)
  },
  {
    title: 'Pomodoro Timer',
    description:
      'Boost productivity with the Pomodoro Technique. Customizable work/break intervals, task tracking, statistics, and desktop notifications to keep you focused.',
    icon: Timer,
    href: '/tools/productivity/pomodoro',
    gradient: 'from-red-500 to-orange-500',
    features: ['Custom Intervals', 'Task Lists', 'Statistics', 'Sound Alerts'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Percentage Calculator',
    description:
      'Calculate percentages, discounts, markups, and taxes instantly. Multiple calculation modes including percentage of, increase/decrease, and reverse percentage calculations.',
    icon: Percent,
    href: '/tools/finance/percentage-calculator',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Multiple Modes', 'Discount Calculator', 'Tax Calculator', 'Reverse Calculate'],
    category: 'finance',
    new: true,
  },
  {
    title: 'Age Calculator',
    description:
      'Calculate exact age from birthdate with precision down to days, hours, and minutes. See days until next birthday, age in different units, and life event milestones.',
    icon: Cake,
    href: '/tools/productivity/age-calculator',
    gradient: 'from-pink-500 to-rose-500',
    features: ['Exact Age', 'Next Birthday', 'Multiple Units', 'Life Events'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Invoice Generator',
    description:
      'Create professional invoices with customizable templates. Add line items, taxes, discounts, payment terms, and company branding. Export as PDF or print directly.',
    icon: FileSpreadsheet,
    href: '/tools/productivity/invoice-generator',
    gradient: 'from-blue-500 to-indigo-500',
    features: ['Templates', 'Tax & Discount', 'PDF Export', 'Client Management'],
    category: 'productivity',
    premium: true,
  },
  {
    title: 'PDF Tools Suite',
    description:
      'Comprehensive PDF toolkit to merge, split, compress, and convert PDFs. Add watermarks, extract pages, convert to images, and more. All processing done in-browser.',
    icon: FileDown,
    href: '/tools/productivity/pdf-tools',
    gradient: 'from-red-500 to-orange-500',
    features: ['Merge/Split', 'Compress', 'Convert', 'Watermark'],
    category: 'productivity',
    sidebarPriority: 'high',
  },
  {
    title: 'Loan & Mortgage Calculator',
    description:
      'Calculate monthly payments, total interest, and amortization schedules for loans and mortgages. Compare different scenarios and visualize payment breakdowns over time.',
    icon: TrendingDown,
    href: '/tools/finance/loan-calculator',
    gradient: 'from-emerald-500 to-teal-500',
    features: ['Amortization Table', 'Payment Schedule', 'Interest Breakdown', 'Compare Loans'],
    category: 'finance',
  },
  {
    title: 'BMI & Health Calculator',
    description:
      'Calculate Body Mass Index (BMI), ideal weight range, and health categories. Support for both metric and imperial units with personalized health insights and recommendations.',
    icon: Activity,
    href: '/tools/productivity/bmi-calculator',
    gradient: 'from-green-500 to-emerald-500',
    features: ['BMI Chart', 'Health Tips', 'Imperial/Metric', 'Ideal Weight Range'],
    category: 'productivity',
  },
  {
    title: 'Stopwatch & Timer',
    description:
      'Professional stopwatch with lap tracking and multiple simultaneous countdown timers. Save timer presets, set custom alarms, and get desktop notifications when time is up.',
    icon: Clock,
    href: '/tools/productivity/stopwatch-timer',
    gradient: 'from-cyan-500 to-blue-500',
    features: ['Multiple Timers', 'Lap Times', 'Presets', 'Alarm Sounds'],
    category: 'productivity',
  },
  {
    title: 'Tally Counter',
    description:
      'Simple and effective tally counter for counting events, inventory, or attendance. Features increment, decrement, reset functions, and customizable step values.',
    icon: Star,
    href: '/tools/productivity/tally-counter',
    gradient: 'from-yellow-500 to-orange-500',
    features: ['Increment/Decrement', 'Reset', 'Custom Steps', 'Keyboard Support'],
    category: 'productivity',
  },
  {
    title: 'JSON to CSV Converter',
    description:
      'Convert JSON data to CSV format with support for nested objects and arrays. Flatten complex structures, customize delimiters, preview results, and download instantly.',
    icon: FileSpreadsheet,
    href: '/tools/data/json-to-csv',
    gradient: 'from-teal-500 to-green-500',
    features: ['Flatten Nested', 'Custom Delimiter', 'Download', 'Preview'],
    category: 'data',
    new: true,
  },
  {
    title: 'Markdown Table Generator',
    description:
      'Create and edit Markdown tables visually. Import from CSV or JSON, customize column alignment, and export to Markdown, HTML, JSON, or CSV formats.',
    icon: Table,
    href: '/tools/data/markdown-table',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Visual Editor', 'CSV/JSON Import', 'Multiple Exports', 'Column Alignment'],
    category: 'data',
    new: true,
  },
  {
    title: 'Encryption & Decryption Tool',
    description:
      'Encrypt and decrypt text using AES-256 encryption. Create password-protected notes, generate secure sharing links, with all processing done locally in your browser.',
    icon: Shield,
    href: '/tools/security/encryption-tool',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['AES-256', 'Password Protected', 'Secure Sharing', 'No Server Storage'],
    category: 'security',
    new: true,
  },
  {
    title: 'IP Address Lookup',
    description:
      'Discover your public IP address and get detailed geolocation information. View ISP details, timezone, coordinates, and support for both IPv4 and IPv6 addresses.',
    icon: Network,
    href: '/tools/development/ip-lookup',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Geolocation', 'ISP Info', 'Map View', 'IPv4/IPv6'],
    category: 'development',
    new: true,
    premium: true, // Requires geolocation API (e.g., ipapi.co, ipinfo.io)
  },
  {
    title: 'Website Screenshot Tool',
    description:
      'Capture high-resolution screenshots of any website. Full-page capture or viewport only, multiple device sizes, and instant download. Perfect for documentation and testing.',
    icon: Smartphone,
    href: '/tools/development/website-screenshot',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Full Page', 'Device Sizes', 'High Resolution', 'Download'],
    category: 'development',
    new: true,
    premium: true, // Requires headless browser API (e.g., ScreenshotAPI, ApiFlash)
  },
  {
    title: 'Hash Generator & Verifier',
    description:
      'Generate cryptographic hashes using MD5, SHA-1, SHA-256, SHA-512, and more. Hash text or entire files, compare hashes, and verify file integrity.',
    icon: Hash,
    href: '/tools/security/hash-generator',
    gradient: 'from-red-500 to-pink-500',
    features: ['Multiple Algorithms', 'File Hashing', 'Compare & Verify', 'HMAC'],
    category: 'security',
    new: true,
  },
  {
    title: 'SSL/TLS Certificate Checker',
    description:
      'Inspect SSL/TLS certificate details, expiration dates, and security status for any website. Check certificate chain, cipher suites, and get security recommendations with SSL Labs API integration.',
    icon: ShieldCheck,
    href: '/tools/security/ssl-checker',
    gradient: 'from-teal-500 to-cyan-500',
    features: ['Certificate Details', 'Expiry Alerts', 'Chain Verification', 'Security Score'],
    category: 'security',
  },
  {
    title: 'Password Strength Analyzer',
    description:
      'Measure password entropy and security strength with visual feedback. Detect common patterns, dictionary words, and get actionable recommendations to improve password safety using zxcvbn library.',
    icon: ShieldAlert,
    href: '/tools/security/password-strength',
    gradient: 'from-yellow-500 to-red-500',
    features: ['Entropy Score', 'Pattern Detection', 'Dictionary Check', 'Improvement Tips'],
    category: 'security',
  },
  {
    title: 'Text Steganography Tool',
    description:
      'Hide secret messages within plain text using zero-width characters. Encode and decode hidden text that is invisible to the naked eye. Perfect for secure communication and digital watermarking.',
    icon: EyeOff,
    href: '/tools/security/steganography',
    gradient: 'from-gray-500 to-slate-700',
    features: ['Zero-Width Encoding', 'Invisible Text', 'Decode Messages', 'Copy & Share'],
    category: 'security',
  },
  {
    title: 'File Integrity Verifier',
    description:
      'Upload files and verify integrity by comparing MD5, SHA-1, SHA-256 hashes. Detect tampering, corruption, or unauthorized modifications. Uses WebCrypto API for secure client-side hashing.',
    icon: FileCheck,
    href: '/tools/security/file-verifier',
    gradient: 'from-emerald-500 to-green-500',
    features: ['Hash Comparison', 'Multiple Algorithms', 'Tamper Detection', 'No Upload to Server'],
    category: 'security',
  },

  // Developer Tools (Advanced)
  {
    title: 'API Request Tester',
    description:
      'Lightweight Postman-like tool to test REST APIs directly in your browser. Send GET, POST, PUT, DELETE requests with custom headers, body, and authentication. Save request presets and share with teams.',
    icon: Terminal,
    href: '/tools/development/api-tester',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['All HTTP Methods', 'Custom Headers', 'Save Presets', 'Share URLs'],
    category: 'development',
    new: true,
  },
  {
    title: 'GraphQL Playground',
    description:
      'Interactive GraphQL playground and API tester. Write queries, explore schemas, test mutations, and inspect responses with real-time validation. Includes sample queries and history tracking.',
    icon: Network,
    href: '/tools/development/graphql-playground',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Query Builder', 'Variables Support', 'History & Favorites', 'Sample Queries'],
    category: 'development',
    new: true,
  },
  {
    title: 'JWT Decoder & Inspector',
    description:
      'Decode, verify, and validate JSON Web Tokens (JWT) securely in your browser. View header, payload, and signature. Validate token expiry and structure without server calls.',
    icon: Shield,
    href: '/tools/development/jwt-decoder',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['Decode JWT', 'Verify Signature', 'Expiry Check', 'Secure & Local'],
    category: 'development',
    new: true,
  },
  {
    title: 'YAML ↔ JSON Converter',
    description:
      'Convert YAML to JSON and vice versa with syntax highlighting and validation. Perfect for Kubernetes configs, Docker Compose files, and API specifications.',
    icon: FileJson,
    href: '/tools/development/yaml-json',
    gradient: 'from-green-500 to-emerald-500',
    features: ['YAML ⇄ JSON', 'Syntax Highlight', 'Validation', 'Copy & Download'],
    category: 'development',
    new: true,
  },
  {
    title: 'Dockerfile Formatter & Linter',
    description:
      'Beautify and lint Dockerfiles with best practices and security recommendations. Auto-format with proper indentation, detect common issues, and optimize build layers.',
    icon: FileText,
    href: '/tools/development/dockerfile-formatter',
    gradient: 'from-cyan-500 to-blue-500',
    features: ['Auto Format', 'Best Practices', 'Security Checks', 'Layer Optimization'],
    category: 'development',
    new: true,
  },

  {
    title: 'JWT Debugger & Decoder',
    description:
      'Decode, verify, and debug JSON Web Tokens (JWT) with full support for multiple algorithms. Generate new tokens, validate signatures, check expiration, and inspect claims. Perfect for API debugging and authentication troubleshooting.',
    icon: ShieldCheck,
    href: '/tools/development/jwt-debugger',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Decode JWT', 'Verify Signature', 'Generate Tokens', 'Validate Claims'],
    category: 'development',
    new: true,
  },
  {
    title: 'Cron Expression Builder',
    description:
      'Visual cron expression generator with human-readable explanations and platform-specific syntax. Build cron schedules with dropdowns, preview next 10 execution times, and validate expressions. Supports Unix, Quartz, AWS, Spring, and Kubernetes formats.',
    icon: Clock,
    href: '/tools/development/cron-builder',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Visual Builder', 'Human-Readable', '30+ Presets', 'Multi-Platform'],
    category: 'development',
    new: true,
  },
  {
    title: 'Cron Expression Parser',
    description:
      'Parse and validate cron expressions with live execution previews. Export configurations for Kubernetes CronJobs, GitHub Actions, GitLab CI/CD, AWS, and standard crontab. Ideal for DevOps workflows.',
    icon: Calendar,
    href: '/tools/development/cron-expression',
    gradient: 'from-teal-500 to-green-500',
    features: [
      'Expression Validation',
      'Execution Preview',
      'Multi-Platform Export',
      'Config Generator',
    ],
    category: 'development',
    new: true,
  },

  // Data & Conversion Utilities (Coming Soon)
  {
    title: 'CSV ↔ Excel Converter',
    description:
      'Convert between CSV and Excel (XLSX) formats directly in your browser. No server upload needed - all processing happens locally with support for large files and multiple sheets.',
    icon: FileSpreadsheet,
    href: '/tools/data/csv-excel',
    gradient: 'from-green-500 to-teal-500',
    features: ['CSV ⇄ XLSX', 'Multiple Sheets', 'Large Files', 'Browser-Only'],
    category: 'data',
    premium: true,
  },
  {
    title: 'JSON Schema Generator',
    description:
      'Automatically generate JSON Schema from sample JSON data. Validate structure, infer types, and create reusable schemas for API documentation and data validation.',
    icon: Code,
    href: '/tools/data/json-schema',
    gradient: 'from-purple-500 to-indigo-500',
    features: ['Auto Generate', 'Type Inference', 'Schema Validation', 'Copy & Export'],
    category: 'data',
    new: true,
  },
  {
    title: 'UUID Generator & Validator',
    description:
      'Generate and validate UUIDs (v1, v3, v4, v5) with bulk generation support. Perfect for database keys, API identifiers, and unique resource naming. Includes format verification.',
    icon: Hash,
    href: '/tools/data/uuid-generator',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['UUID v1-v5', 'Bulk Generate', 'Validation', 'Format Check'],
    category: 'data',
  },
  {
    title: 'Date Formatter & Parser',
    description:
      'Convert timestamps between formats and timezones. Parse Unix timestamps, ISO 8601, custom date formats. Calculate date differences and format dates for any locale.',
    icon: Calendar,
    href: '/tools/data/date-formatter',
    gradient: 'from-orange-500 to-red-500',
    features: ['Multiple Formats', 'Timezone Convert', 'Date Difference', 'Locale Support'],
    category: 'data',
  },
  {
    title: 'CSV Merger & Splitter',
    description:
      'Merge multiple CSV files into one or split large CSVs by row count or filter conditions. Supports column mapping, deduplication, and custom merge rules.',
    icon: FileSpreadsheet,
    href: '/tools/data/csv-merger',
    gradient: 'from-teal-500 to-emerald-500',
    features: ['Merge CSVs', 'Split by Rules', 'Deduplicate', 'Column Mapping'],
    category: 'data',
    premium: true,
  },

  // Other tools
  {
    title: 'Daily Task Summary',
    description:
      'Summarize your daily tasks and activities. Get insights into your productivity patterns and identify areas for improvement.',
    icon: Calendar,
    href: '/tools/productivity/daily-task-summary',
    gradient: 'from-green-500 to-blue-500',
    features: ['Task Overview', 'Time Tracking', 'Productivity Insights', 'Download'],
    category: 'productivity',
  },
  {
    title: 'Prompt Formatter',
    description:
      'Format and optimize prompts for AI models. Enhance clarity and structure to get better responses from language models.',
    icon: Wand2,
    href: '/tools/development/prompt-formatter',
    gradient: 'from-purple-500 to-pink-500',
    features: [
      'Prompt Optimization',
      'AI Model Compatibility',
      'Real-time Preview',
      'Downloadable Templates',
    ],
    category: 'development',
  },

  // Design & Visual Tools
  {
    title: 'Icon Search & Download Hub',
    description:
      'Search and download 1000+ free Lucide icons instantly. Customize size, color, and stroke width. Export as SVG or copy React component code. Perfect for web designers and developers.',
    icon: Search,
    href: '/tools/design/icon-search',
    gradient: 'from-purple-500 to-pink-500',
    features: ['1000+ Icons', 'Customizable', 'SVG Export', 'React Code'],
    category: 'design',
    new: true,
    popular: true,
  },
  {
    title: 'Device Mockup Generator',
    description:
      'Create professional device mockups instantly. Add screenshots to realistic iPhone, MacBook, iPad, and Android frames. Customize backgrounds with gradients or solid colors. Export high-resolution mockups perfect for presentations, portfolios, and app store previews.',
    icon: Smartphone,
    href: '/tools/design/device-mockup',
    gradient: 'from-blue-500 to-purple-500',
    features: ['15+ Device Frames', 'Custom Backgrounds', 'High-Res Export', 'Landscape/Portrait'],
    category: 'design',
    new: true,
    popular: true,
  },
  {
    title: 'Digital Signature Generator',
    description:
      'Create beautiful digital signatures for documents, emails, and professional use. Choose from 6 elegant fonts, customize colors, size, underline and italic styles. Download as PNG, SVG, or JPG.',
    icon: PenTool,
    href: '/tools/design/signature-generator',
    gradient: 'from-pink-500 to-rose-500',
    features: [
      '6 Professional Fonts',
      'Full Customization',
      'Multiple Formats',
      'Copy to Clipboard',
    ],
    category: 'design',
    new: true,
    popular: true,
  },
  {
    title: 'Gradient Generator',
    description:
      'Create beautiful CSS gradients visually with an intuitive interface. Support for linear, radial, and conic gradients. Export as CSS, copy code, or save presets.',
    icon: Wand2,
    href: '/tools/design/gradient-generator',
    gradient: 'from-purple-500 via-pink-500 to-orange-500',
    features: ['Multiple Types', 'Color Picker', 'CSS Export', 'Presets'],
    category: 'design',
  },
  {
    title: 'Color Picker & Palette Generator',
    description:
      'Advanced color tool for designers and developers. Pick colors, generate harmonious palettes, create gradients, and convert between HEX, RGB, HSL, and HSV formats instantly.',
    icon: Palette,
    href: '/tools/design/color-picker',
    gradient: 'from-pink-500 to-rose-500',
    features: ['HEX/RGB/HSL', 'Palettes', 'Gradients', 'Accessibility'],
    category: 'design',
    new: true,
  },
  {
    title: 'Favicon Generator',
    description:
      'Convert logos, images, or emojis into favicons for websites. Generate all required sizes (16x16, 32x32, 180x180) and formats (ICO, PNG, SVG) with preview and instant download.',
    icon: Smartphone,
    href: '/tools/design/favicon-generator',
    gradient: 'from-violet-500 to-purple-500',
    features: ['Multiple Sizes', 'ICO/PNG/SVG', 'Emoji Support', 'Preview & Download'],
    category: 'design',
  },
  {
    title: 'Screenshot Diff Tool',
    description:
      'Compare UI screenshots pixel-by-pixel to detect visual changes. Perfect for QA testing, design reviews, and tracking UI regressions. Highlights differences with customizable sensitivity.',
    icon: Diff,
    href: '/tools/design/screenshot-diff',
    gradient: 'from-orange-500 to-red-500',
    features: ['Pixel Comparison', 'Diff Highlight', 'Sensitivity Control', 'Side-by-Side View'],
    category: 'design',
  },
  {
    title: 'SVG Optimizer & Editor',
    description:
      'Minify and optimize SVG files with live preview. Remove unnecessary metadata, compress paths, and reduce file size by up to 70%. Edit colors, viewBox, and attributes visually.',
    icon: Layers,
    href: '/tools/design/svg-optimizer',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Minify SVG', 'Live Preview', 'Color Editor', 'Size Reduction'],
    category: 'design',
  },
  {
    title: 'Image Metadata Viewer',
    description:
      'Extract and view EXIF, GPS, camera settings, and technical metadata from photos. See location, date taken, camera model, exposure settings, and more. Perfect for photographers.',
    icon: Camera,
    href: '/tools/design/image-metadata',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['EXIF Data', 'GPS Location', 'Camera Settings', 'Date & Time'],
    category: 'design',
  },
  {
    title: 'Color Contrast Checker',
    description:
      'WCAG 2.1 compliant color contrast analyzer for accessibility. Test foreground and background color combinations, get AA/AAA ratings, and ensure your designs are readable for everyone.',
    icon: Eye,
    href: '/tools/design/color-contrast',
    gradient: 'from-pink-500 to-rose-500',
    features: ['WCAG 2.1', 'AA/AAA Rating', 'Live Preview', 'Accessibility Score'],
    category: 'design',
  },
  {
    title: 'AI Photo Editor',
    description:
      'Professional photo editor with AI image generation powered by DALL-E. Apply filters, adjust brightness/contrast/saturation, transform images with rotate and flip, and generate AI images from text descriptions.',
    icon: ImagePlus,
    href: '/tools/design/photo-editor',
    gradient: 'from-purple-500 via-pink-500 to-orange-500',
    features: [
      'AI Image Generation',
      'Professional Filters',
      'Advanced Adjustments',
      'Transform Tools',
    ],
    category: 'design',
    premium: true,
    new: true,
    popular: true,
  },
  {
    title: 'Placeholder Image Generator',
    description:
      'Generate custom placeholder images with custom dimensions, colors, and text overlay. Perfect for mockups, prototypes, and design work. Download as SVG or PNG with 30+ preset sizes.',
    icon: ImagePlus,
    href: '/tools/design/placeholder-generator',
    gradient: 'from-pink-500 to-rose-500',
    features: ['Custom Sizes', 'Color Picker', 'Text Overlay', 'SVG & PNG Export'],
    category: 'design',
    new: true,
  },
  {
    title: 'Logo Maker',
    description:
      'Create professional logos with 1000+ icons, custom fonts, and color palettes. Export as PNG or SVG for free. No design skills required.',
    icon: PenTool,
    href: '/tools/design/logo-maker',
    gradient: 'from-purple-500 to-pink-500',
    features: ['1000+ Icons', 'Custom Fonts', 'Color Palettes', 'PNG/SVG Export'],
    category: 'design',
    new: true,
    popular: true,
  },

  // Productivity & Workflow Tools
  {
    title: 'Task Timer with Sessions',
    description:
      'Track multiple task timers concurrently with session management. Monitor time spent on different projects, pause and resume timers, and sync across devices with Pro subscription.',
    icon: Timer,
    href: '/tools/productivity/task-timer',
    gradient: 'from-blue-500 to-purple-500',
    features: ['Multiple Timers', 'Session Tracking', 'Sync Devices', 'Export Reports'],
    category: 'productivity',
    premium: true,
  },
  {
    title: 'Clipboard History Manager',
    description:
      'Save and manage your clipboard history locally in your browser. Search through past clipboard items, pin favorites, and restore any copied text or data instantly.',
    icon: Clipboard,
    href: '/tools/productivity/clipboard-history',
    gradient: 'from-cyan-500 to-teal-500',
    features: ['Local Storage', 'Search History', 'Pin Favorites', 'Quick Restore'],
    category: 'productivity',
  },
  {
    title: 'Daily Note Generator',
    description:
      'Generate timestamped daily notes automatically with customizable templates. Organize thoughts, tasks, and ideas with date-based structure and quick access to recent notes.',
    icon: FileText,
    href: '/tools/productivity/daily-note',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Auto Timestamps', 'Custom Templates', 'Date Navigation', 'Export Markdown'],
    category: 'productivity',
  },
  {
    title: 'Batch File Renamer',
    description:
      'Rename multiple files by pattern or custom rules using the browser File API. Apply prefix/suffix, find-replace, sequential numbering, and preview changes before applying.',
    icon: FolderEdit,
    href: '/tools/productivity/batch-rename',
    gradient: 'from-orange-500 to-red-500',
    features: ['Pattern Rules', 'Find & Replace', 'Sequential Numbers', 'Preview Changes'],
    category: 'productivity',
  },
  {
    title: 'JSON to Markdown Table',
    description:
      'Convert JSON arrays to beautifully formatted Markdown tables instantly. Customize column headers, alignment, and formatting. Perfect for documentation and README files.',
    icon: Table,
    href: '/tools/data/json-markdown-table',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Auto Format', 'Custom Headers', 'Column Alignment', 'Copy & Download'],
    category: 'data',
  },

  // System & Utility Tools
  {
    title: 'Browser Fingerprint Viewer',
    description:
      'Discover your unique browser fingerprint and device characteristics. View user agent, canvas fingerprint, WebGL renderer, screen resolution, installed fonts, and more for privacy awareness.',
    icon: Fingerprint,
    href: '/tools/development/browser-fingerprint',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['Device Info', 'Canvas Fingerprint', 'WebGL Data', 'Privacy Insights'],
    category: 'development',
    new: true,
  },
  {
    title: 'Network Speed Test',
    description:
      'Test your internet connection speed directly in the browser. Measure download speed, upload speed, latency, and jitter with real-time results.',
    icon: Gauge,
    href: '/tools/development/speed-test',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Download Speed', 'Upload Speed', 'Latency Test', 'Jitter Analysis'],
    category: 'development',
    new: true,
  },
  {
    title: 'Clipboard Formatter',
    description:
      'Automatically format pasted text with smart detection. Remove extra whitespace, fix line breaks, convert tabs to spaces, and apply case transformations on paste.',
    icon: Clipboard,
    href: '/tools/productivity/clipboard-formatter',
    gradient: 'from-green-500 to-teal-500',
    features: ['Auto Format', 'Smart Detection', 'Case Transform', 'Whitespace Cleanup'],
    category: 'productivity',
  },
  {
    title: 'File Metadata Inspector',
    description:
      'Inspect file metadata without uploading. View MIME type, file size, hash (MD5/SHA-256), creation date, and technical properties. Perfect for debugging and file verification.',
    icon: FileSearch,
    href: '/tools/development/file-inspector',
    gradient: 'from-orange-500 to-red-500',
    features: ['MIME Type', 'File Hash', 'Size Analysis', 'No Upload Required'],
    category: 'development',
    premium: true,
  },

  // Text, Content & AI Tools
  {
    title: 'Grammar & Spell Checker',
    description:
      'Detect and fix grammar, spelling, and syntax errors with AI-powered suggestions. Support for multiple languages with style recommendations and contextual corrections. Powered by OpenAI GPT-4o-mini.',
    icon: FileCheck,
    href: '/tools/productivity/grammar-checker',
    gradient: 'from-green-500 to-teal-500',
    features: ['Grammar Check', 'Spell Check', 'Style Tips', 'AI-Powered'],
    category: 'productivity',
    premium: false,
  },
  {
    title: 'AI Prompt Explainer',
    description:
      'Analyze and optimize AI prompts for better results. Get suggestions to improve clarity, structure, and effectiveness. Learn prompt engineering techniques with AI-powered insights.',
    icon: Lightbulb,
    href: '/tools/development/ai-prompt-explainer',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Prompt Analysis', 'Optimization Tips', 'Best Practices', 'AI Insights'],
    category: 'development',
    premium: true,
  },
  {
    title: 'Text Summarizer',
    description:
      'Summarize long articles, documents, and text with AI. Generate concise bullet points or paragraph summaries. Adjustable summary length and tone for different use cases.',
    icon: Minimize2,
    href: '/tools/productivity/text-summarizer',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['AI Summaries', 'Bullet Points', 'Adjustable Length', 'Key Highlights'],
    category: 'productivity',
    premium: true,
    sidebarPriority: 'high',
  },
  {
    title: 'Keyword Density Analyzer',
    description:
      'Analyze keyword usage and density in your content for SEO optimization. Track keyword frequency, identify overuse, and get suggestions for better keyword distribution and content balance.',
    icon: BarChart3,
    href: '/tools/productivity/keyword-density',
    gradient: 'from-orange-500 to-red-500',
    features: ['Keyword Tracking', 'Density Analysis', 'SEO Score', 'Distribution Chart'],
    category: 'productivity',
    premium: false,
  },
  {
    title: 'Text Similarity Checker',
    description:
      'Compare text blocks and measure similarity percentage using NLP algorithms. Detect duplicate content, plagiarism, and text variations. Batch comparison available in Pro version.',
    icon: GitCompare,
    href: '/tools/productivity/text-similarity',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['Similarity Score', 'NLP Analysis', 'Batch Compare', 'Highlight Matches'],
    category: 'productivity',
    premium: false,
  },

  // AI-Powered Tools
  {
    title: 'AI Text Rewriter',
    description:
      'Rewrite content with AI-powered tone and style control. Transform text for different audiences, adjust formality, simplify complex writing, or make content more engaging using OpenAI GPT models.',
    icon: Sparkles,
    href: '/tools/productivity/ai-text-rewriter',
    gradient: 'from-violet-500 to-fuchsia-500',
    features: ['Tone Control', 'Style Adjustment', 'Multiple Variants', 'Preserve Meaning'],
    category: 'productivity',
    premium: false,
    sidebarPriority: 'high',
  },
  {
    title: 'AI JSON Analyzer',
    description:
      'Understand complex JSON structures with AI-powered analysis. Get natural language summaries, detect patterns, explain data relationships, and debug JSON with GPT function calling.',
    icon: Brain,
    href: '/tools/development/ai-json-analyzer',
    gradient: 'from-blue-500 to-indigo-500',
    features: ['Structure Summary', 'Pattern Detection', 'Relationship Mapping', 'Debug Insights'],
    category: 'development',
    premium: true,
  },
  {
    title: 'AI Command Explainer',
    description:
      'Explain complex CLI commands in plain English with AI assistance. Understand bash, git, docker, kubectl commands with detailed breakdowns. Free for basic explanations, unlimited with Pro.',
    icon: MessageSquare,
    href: '/tools/development/ai-command-explainer',
    gradient: 'from-green-500 to-teal-500',
    features: [
      'Command Breakdown',
      'Parameter Explanation',
      'Safety Warnings',
      'Alternative Suggestions',
    ],
    category: 'development',
    premium: false,
  },
  {
    title: 'AI Image Caption Generator',
    description:
      'Generate descriptive alt text and captions for images automatically using Vision API. Improve accessibility, SEO, and content discoverability with AI-powered image descriptions.',
    icon: ImagePlus,
    href: '/tools/media/ai-image-caption',
    gradient: 'from-pink-500 to-rose-500',
    features: [
      'Alt Text Generation',
      'SEO Optimization',
      'Accessibility Focus',
      'Batch Processing',
    ],
    category: 'media',
    premium: true,
  },
  {
    title: 'Image Format Converter',
    description:
      'Convert images between PNG, JPEG, WEBP, and GIF formats instantly. Adjust quality, preview results, compare file sizes, and download converted images. Free online converter.',
    icon: FileImage,
    href: '/tools/media/image-format-converter',
    gradient: 'from-purple-500 to-indigo-500',
    features: ['Format Conversion', 'Quality Control', 'Size Comparison', 'Live Preview'],
    category: 'media',
    new: true,
  },
  {
    title: 'QR Code Scanner',
    description:
      'Scan and read QR codes instantly from images or webcam. Upload photos or use your camera to decode QR codes. View scan history and copy decoded data with one click.',
    icon: ScanLine,
    href: '/tools/media/qr-code-scanner',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Image Upload', 'Webcam Scanner', 'Scan History', 'One-Click Copy'],
    category: 'media',
    new: true,
  },
  {
    title: 'Image to Text Converter',
    description:
      'Extract text from images using OCR. Upload photos, screenshots, or documents and convert them to editable text. Supports 12+ languages including English, Spanish, Chinese, and Japanese. Copy or download extracted text instantly.',
    icon: FileText,
    href: '/tools/media/image-to-text',
    gradient: 'from-green-500 to-emerald-500',
    features: ['OCR Technology', '12+ Languages', 'Copy Text', 'Download .txt'],
    category: 'media',
    new: true,
  },
  {
    title: 'SVG to PNG Converter',
    description:
      'Convert SVG files to high-quality PNG images with customizable dimensions, background colors, and quality settings. Preview, download, or copy to clipboard instantly.',
    icon: FileImage,
    href: '/tools/media/svg-to-png',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Custom Dimensions', 'Background Colors', 'Quality Control', 'Copy to Clipboard'],
    category: 'media',
    new: true,
  },
  {
    title: 'Background Remover',
    description:
      'Remove backgrounds from images instantly with AI. 100% free, works entirely in your browser for complete privacy. No upload to servers required.',
    icon: Wand2,
    href: '/tools/media/background-remover',
    gradient: 'from-purple-500 to-pink-500',
    features: ['AI-Powered', '100% Private', 'Instant Results', 'High Quality'],
    category: 'media',
    new: true,
    popular: true,
  },
  {
    title: 'AI Snippet Generator',
    description:
      'Generate code snippets instantly with AI. Create functions, classes, regex patterns, SQL queries, and more. Free tier includes basic snippets, unlimited generation with Pro subscription.',
    icon: Braces,
    href: '/tools/development/ai-snippet-generator',
    gradient: 'from-orange-500 to-amber-500',
    features: ['Multi-Language Support', 'Context-Aware', 'Instant Generation', 'Code Explanation'],
    category: 'development',
    premium: true,
  },
  {
    title: 'Readability Score Checker',
    description:
      'Analyze text readability with Flesch-Kincaid, Gunning Fog, and other scoring algorithms. Get grade level estimates, reading time, and suggestions to improve your writing clarity.',
    icon: Gauge,
    href: '/tools/productivity/readability-checker',
    gradient: 'from-emerald-500 to-teal-500',
    features: ['Flesch-Kincaid Score', 'Grade Level', 'Reading Time', 'Word Complexity'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Cooking Unit Converter',
    description:
      'Convert cooking measurements between cups, tablespoons, grams, ounces, and more. Scale recipes up or down with ingredient-specific conversions for accurate results.',
    icon: CookingPot,
    href: '/tools/productivity/cooking-converter',
    gradient: 'from-orange-500 to-red-500',
    features: ['Volume Conversion', 'Weight Conversion', 'Recipe Scaling', '100+ Ingredients'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Hashtag Generator',
    description:
      'Generate relevant hashtags for your social media posts. Get trending suggestions, niche-specific tags, and platform-optimized recommendations to boost your reach.',
    icon: Hash,
    href: '/tools/productivity/hashtag-generator',
    gradient: 'from-pink-500 to-rose-500',
    features: ['Trending Hashtags', 'Niche Suggestions', 'Copy to Clipboard', 'Platform Specific'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Citation Generator',
    description:
      'Generate properly formatted citations in APA, MLA, Chicago, Harvard, and IEEE styles. Support for books, journals, websites, and more. Copy or export your bibliography.',
    icon: BookOpen,
    href: '/tools/productivity/citation-generator',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['APA, MLA, Chicago', 'Auto-Format', 'Multiple Sources', 'Copy & Export'],
    category: 'productivity',
    new: true,
    popular: true,
  },
  {
    title: 'Social Media Image Resizer',
    description:
      'Resize images for all social media platforms. Get perfect dimensions for Instagram, Facebook, Twitter, LinkedIn, and more. Batch process multiple images at once.',
    icon: Smartphone,
    href: '/tools/design/social-media-resizer',
    gradient: 'from-cyan-500 to-blue-500',
    features: ['All Platforms', 'Batch Resize', 'Custom Dimensions', 'Preview & Download'],
    category: 'design',
    new: true,
  },
  {
    title: 'AI Content Detector',
    description:
      'Detect AI-generated content with advanced analysis. Get confidence scores and detailed breakdowns to identify text written by ChatGPT, Claude, and other AI models.',
    icon: Bot,
    href: '/tools/productivity/ai-content-detector',
    gradient: 'from-violet-500 to-purple-500',
    features: ['AI Detection', 'Confidence Score', 'Detailed Analysis', 'Multiple Models'],
    category: 'productivity',
    new: true,
    comingSoon: true,
    sidebarPriority: 'high',
  },
]
