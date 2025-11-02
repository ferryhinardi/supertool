import {
  Activity,
  BarChart3,
  Braces,
  Brain,
  Cake,
  Calendar,
  Camera,
  Clipboard,
  Clock,
  Code,
  Diff,
  DollarSign,
  Eye,
  EyeOff,
  FileCheck,
  FileDown,
  FileJson,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Fingerprint,
  FolderEdit,
  Gauge,
  GitCompare,
  Globe,
  Hash,
  Image,
  ImagePlus,
  Key,
  Layers,
  Lightbulb,
  Lock,
  MessageSquare,
  Minimize2,
  Network,
  Palette,
  Percent,
  QrCode,
  Repeat,
  Scissors,
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
}

export const tools: Tool[] = [
  // Popular tools first
  {
    title: 'JSON Beautifier & Formatter',
    description:
      'Professional JSON formatting tool with real-time syntax highlighting, validation, minification, and error detection. Perfect for debugging API responses and configuration files.',
    icon: Code,
    href: '/tools/json-beautify',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Syntax Highlighting', 'Validation', 'Minify', 'Copy & Download'],
    category: 'data',
    popular: true,
  },

  // New tools
  {
    title: 'Code Diff Viewer',
    description:
      'GitHub-style diff comparison tool for text, JSON, and code files. Compare changes side-by-side with split or unified view, perfect for code reviews and version control.',
    icon: GitCompare,
    href: '/tools/diff',
    gradient: 'from-orange-500 to-red-500',
    features: ['Split/Unified View', 'JSON Support', 'Syntax Highlighting', 'Line Numbers'],
    category: 'development',
    new: true,
  },
  {
    title: 'Markdown Editor & Preview',
    description:
      'GitHub-flavored markdown editor with live preview. Write README files, PR summaries, and documentation with support for tables, task lists, code highlighting, and more.',
    icon: FileText,
    href: '/tools/markdown-editor',
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
    href: '/tools/url-shortener',
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
    href: '/tools/text-transformer',
    gradient: 'from-yellow-500 to-orange-500',
    features: ['Case Conversion', 'Word Count', 'Remove Duplicates', 'Sort Lines'],
    category: 'productivity',
    new: true,
  },
  {
    title: 'Image Optimizer & Converter',
    description:
      'Professional image compression tool that reduces file size by up to 80% without visible quality loss. Supports JPG, PNG, WebP formats with bulk processing and dimension resizing.',
    icon: Image,
    href: '/tools/image-optimizer',
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
    href: '/tools/video-converter',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Multiple Formats', 'Fast Conversion', 'Compression', 'Web Optimized'],
    category: 'media',
    new: true,
  },

  // Active tools (not popular or new)
  {
    title: 'Cloud File Upload',
    description:
      'Secure cloud storage uploader with drag-and-drop interface. Upload any file type and get instant shareable public URLs with automatic cloud backup and CDN delivery.',
    icon: Upload,
    href: '/tools/upload',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['Drag & Drop', 'Cloud Storage', 'Public URLs', 'Instant Sharing'],
    category: 'productivity',
    premium: true, // Cloud storage and CDN delivery costs
  },

  // Coming soon tools
  {
    title: 'Base64 Encoder & Decoder',
    description:
      'Convert text, files, and images to Base64 encoding with instant decoding support. Preview encoded images directly in browser before downloading or copying.',
    icon: Lock,
    href: '/tools/base64',
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
    href: '/tools/split-bill',
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
    href: '/tools/qr-code',
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
    href: '/tools/password-generator',
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
    href: '/tools/unit-converter',
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
    href: '/tools/timezone-converter',
    gradient: 'from-indigo-500 to-blue-500',
    features: ['Multiple Zones', 'DST Aware', 'Meeting Planner', 'Time Slider'],
    category: 'productivity',
    new: true,
    comingSoon: true,
  },
  {
    title: 'Tip Calculator',
    description:
      'Calculate tips quickly with preset percentages (10%, 15%, 18%, 20%) or custom amounts. Split bills among multiple people and round totals up or down for convenience.',
    icon: DollarSign,
    href: '/tools/tip-calculator',
    gradient: 'from-green-500 to-teal-500',
    features: ['Quick Presets', 'Split Bill', 'Round Options', 'Total Summary'],
    category: 'finance',
    new: true,
    comingSoon: true,
  },
  {
    title: 'Currency Converter',
    description:
      'Convert between 150+ world currencies with real-time exchange rates. View historical rate charts, save favorite pairs, and get accurate conversion calculations.',
    icon: DollarSign,
    href: '/tools/currency-converter',
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
    href: '/tools/pomodoro',
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
    href: '/tools/percentage-calculator',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Multiple Modes', 'Discount Calculator', 'Tax Calculator', 'Reverse Calculate'],
    category: 'finance',
    new: true,
    comingSoon: true,
  },
  {
    title: 'Age Calculator',
    description:
      'Calculate exact age from birthdate with precision down to days, hours, and minutes. See days until next birthday, age in different units, and life event milestones.',
    icon: Cake,
    href: '/tools/age-calculator',
    gradient: 'from-pink-500 to-rose-500',
    features: ['Exact Age', 'Next Birthday', 'Multiple Units', 'Life Events'],
    category: 'productivity',
    new: true,
    comingSoon: true,
  },
  {
    title: 'Invoice Generator',
    description:
      'Create professional invoices with customizable templates. Add line items, taxes, discounts, payment terms, and company branding. Export as PDF or print directly.',
    icon: FileSpreadsheet,
    href: '/tools/invoice-generator',
    gradient: 'from-blue-500 to-indigo-500',
    features: ['Templates', 'Tax & Discount', 'PDF Export', 'Client Management'],
    category: 'productivity',
    comingSoon: true,
    premium: true,
  },
  {
    title: 'PDF Tools Suite',
    description:
      'Comprehensive PDF toolkit to merge, split, compress, and convert PDFs. Add watermarks, extract pages, convert to images, and more. All processing done in-browser.',
    icon: FileDown,
    href: '/tools/pdf-tools',
    gradient: 'from-red-500 to-orange-500',
    features: ['Merge/Split', 'Compress', 'Convert', 'Watermark'],
    category: 'productivity',
  },
  {
    title: 'Loan & Mortgage Calculator',
    description:
      'Calculate monthly payments, total interest, and amortization schedules for loans and mortgages. Compare different scenarios and visualize payment breakdowns over time.',
    icon: TrendingDown,
    href: '/tools/loan-calculator',
    gradient: 'from-emerald-500 to-teal-500',
    features: ['Amortization Table', 'Payment Schedule', 'Interest Breakdown', 'Compare Loans'],
    category: 'finance',
    comingSoon: true,
    premium: true,
  },
  {
    title: 'BMI & Health Calculator',
    description:
      'Calculate Body Mass Index (BMI), ideal weight range, and health categories. Support for both metric and imperial units with personalized health insights and recommendations.',
    icon: Activity,
    href: '/tools/bmi-calculator',
    gradient: 'from-green-500 to-emerald-500',
    features: ['BMI Chart', 'Health Tips', 'Imperial/Metric', 'Ideal Weight Range'],
    category: 'productivity',
  },
  {
    title: 'Stopwatch & Timer',
    description:
      'Professional stopwatch with lap tracking and multiple simultaneous countdown timers. Save timer presets, set custom alarms, and get desktop notifications when time is up.',
    icon: Clock,
    href: '/tools/stopwatch-timer',
    gradient: 'from-cyan-500 to-blue-500',
    features: ['Multiple Timers', 'Lap Times', 'Presets', 'Alarm Sounds'],
    category: 'productivity',
  },
  {
    title: 'Tally Counter',
    description:
      'Simple and effective tally counter for counting events, inventory, or attendance. Features increment, decrement, reset functions, and customizable step values.',
    icon: Star,
    href: '/tools/tally-counter',
    gradient: 'from-yellow-500 to-orange-500',
    features: ['Increment/Decrement', 'Reset', 'Custom Steps', 'Keyboard Support'],
    category: 'productivity',
  },
  {
    title: 'JSON to CSV Converter',
    description:
      'Convert JSON data to CSV format with support for nested objects and arrays. Flatten complex structures, customize delimiters, preview results, and download instantly.',
    icon: FileSpreadsheet,
    href: '/tools/json-to-csv',
    gradient: 'from-teal-500 to-green-500',
    features: ['Flatten Nested', 'Custom Delimiter', 'Download', 'Preview'],
    category: 'data',
    new: true,
  },
  {
    title: 'Encryption & Decryption Tool',
    description:
      'Encrypt and decrypt text using AES-256 encryption. Create password-protected notes, generate secure sharing links, with all processing done locally in your browser.',
    icon: Shield,
    href: '/tools/encryption-tool',
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
    href: '/tools/ip-lookup',
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
    href: '/tools/website-screenshot',
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
    href: '/tools/hash-generator',
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
    href: '/tools/ssl-checker',
    gradient: 'from-teal-500 to-cyan-500',
    features: ['Certificate Details', 'Expiry Alerts', 'Chain Verification', 'Security Score'],
    category: 'security',
    comingSoon: true,
    premium: true,
  },
  {
    title: 'Password Strength Analyzer',
    description:
      'Measure password entropy and security strength with visual feedback. Detect common patterns, dictionary words, and get actionable recommendations to improve password safety using zxcvbn library.',
    icon: ShieldAlert,
    href: '/tools/password-strength',
    gradient: 'from-yellow-500 to-red-500',
    features: ['Entropy Score', 'Pattern Detection', 'Dictionary Check', 'Improvement Tips'],
    category: 'security',
  },
  {
    title: 'Text Steganography Tool',
    description:
      'Hide secret messages within plain text using zero-width characters. Encode and decode hidden text that is invisible to the naked eye. Perfect for secure communication and digital watermarking.',
    icon: EyeOff,
    href: '/tools/steganography',
    gradient: 'from-gray-500 to-slate-700',
    features: ['Zero-Width Encoding', 'Invisible Text', 'Decode Messages', 'Copy & Share'],
    category: 'security',
    comingSoon: true,
  },
  {
    title: 'File Integrity Verifier',
    description:
      'Upload files and verify integrity by comparing MD5, SHA-1, SHA-256 hashes. Detect tampering, corruption, or unauthorized modifications. Uses WebCrypto API for secure client-side hashing.',
    icon: FileCheck,
    href: '/tools/file-verifier',
    gradient: 'from-emerald-500 to-green-500',
    features: ['Hash Comparison', 'Multiple Algorithms', 'Tamper Detection', 'No Upload to Server'],
    category: 'security',
    comingSoon: true,
  },

  // Developer Tools (Advanced)
  {
    title: 'API Request Tester',
    description:
      'Lightweight Postman-like tool to test REST APIs directly in your browser. Send GET, POST, PUT, DELETE requests with custom headers, body, and authentication. Save request presets and share with teams.',
    icon: Terminal,
    href: '/tools/api-tester',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['All HTTP Methods', 'Custom Headers', 'Save Presets', 'Share URLs'],
    category: 'development',
    new: true,
  },
  {
    title: 'JWT Decoder & Inspector',
    description:
      'Decode, verify, and validate JSON Web Tokens (JWT) securely in your browser. View header, payload, and signature. Validate token expiry and structure without server calls.',
    icon: Shield,
    href: '/tools/jwt-decoder',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['Decode JWT', 'Verify Signature', 'Expiry Check', 'Secure & Local'],
    category: 'development',
    new: true,
    comingSoon: true,
  },
  {
    title: 'YAML ↔ JSON Converter',
    description:
      'Convert YAML to JSON and vice versa with syntax highlighting and validation. Perfect for Kubernetes configs, Docker Compose files, and API specifications.',
    icon: FileJson,
    href: '/tools/yaml-json',
    gradient: 'from-green-500 to-emerald-500',
    features: ['YAML ⇄ JSON', 'Syntax Highlight', 'Validation', 'Copy & Download'],
    category: 'development',
    new: true,
    comingSoon: true,
  },
  {
    title: 'Dockerfile Formatter & Linter',
    description:
      'Beautify and lint Dockerfiles with best practices and security recommendations. Auto-format with proper indentation, detect common issues, and optimize build layers.',
    icon: FileText,
    href: '/tools/dockerfile-formatter',
    gradient: 'from-cyan-500 to-blue-500',
    features: ['Auto Format', 'Best Practices', 'Security Checks', 'Layer Optimization'],
    category: 'development',
    new: true,
    comingSoon: true,
  },
  {
    title: 'Cron Expression Builder',
    description:
      'Visual cron schedule builder with human-readable descriptions. Preview next 10 execution times, validate expressions, browse common patterns, and export for various platforms.',
    icon: Calendar,
    href: '/tools/cron-expression',
    gradient: 'from-teal-500 to-green-500',
    features: ['Visual Builder', 'Next 10 Runs', 'Pattern Library', 'Multi-Platform'],
    category: 'development',
    new: true,
  },
  {
    title: 'Regex Pattern Library & Tester',
    description:
      'Interactive regular expression tester with real-time matching and group capturing. Explore pre-built pattern templates for emails, URLs, phone numbers, and more. Includes detailed regex explanations.',
    icon: Terminal,
    href: '/tools/regex-tester',
    gradient: 'from-fuchsia-500 to-pink-500',
    features: ['Live Testing', 'Pattern Templates', 'Match Groups', 'Regex Explainer'],
    category: 'development',
    new: true,
    comingSoon: true,
  },

  // Data & Conversion Utilities (Coming Soon)
  {
    title: 'CSV ↔ Excel Converter',
    description:
      'Convert between CSV and Excel (XLSX) formats directly in your browser. No server upload needed - all processing happens locally with support for large files and multiple sheets.',
    icon: FileSpreadsheet,
    href: '/tools/csv-excel',
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
    href: '/tools/json-schema',
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
    href: '/tools/uuid-generator',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['UUID v1-v5', 'Bulk Generate', 'Validation', 'Format Check'],
    category: 'data',
    comingSoon: false,
  },
  {
    title: 'Date Formatter & Parser',
    description:
      'Convert timestamps between formats and timezones. Parse Unix timestamps, ISO 8601, custom date formats. Calculate date differences and format dates for any locale.',
    icon: Calendar,
    href: '/tools/date-formatter',
    gradient: 'from-orange-500 to-red-500',
    features: ['Multiple Formats', 'Timezone Convert', 'Date Difference', 'Locale Support'],
    category: 'data',
  },
  {
    title: 'CSV Merger & Splitter',
    description:
      'Merge multiple CSV files into one or split large CSVs by row count or filter conditions. Supports column mapping, deduplication, and custom merge rules.',
    icon: FileSpreadsheet,
    href: '/tools/csv-merger',
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
    href: '/tools/daily-task-summary',
    gradient: 'from-green-500 to-blue-500',
    features: ['Task Overview', 'Time Tracking', 'Productivity Insights', 'Download'],
    category: 'productivity',
  },
  {
    title: 'Prompt Formatter',
    description:
      'Format and optimize prompts for AI models. Enhance clarity and structure to get better responses from language models.',
    icon: Wand2,
    href: '/tools/prompt-formatter',
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
    title: 'Gradient Generator',
    description:
      'Create beautiful CSS gradients visually with an intuitive interface. Support for linear, radial, and conic gradients. Export as CSS, copy code, or save presets.',
    icon: Wand2,
    href: '/tools/gradient-generator',
    gradient: 'from-purple-500 via-pink-500 to-orange-500',
    features: ['Multiple Types', 'Color Picker', 'CSS Export', 'Presets'],
    category: 'design',
  },
  {
    title: 'Color Picker & Palette Generator',
    description:
      'Advanced color tool for designers and developers. Pick colors, generate harmonious palettes, create gradients, and convert between HEX, RGB, HSL, and HSV formats instantly.',
    icon: Palette,
    href: '/tools/color-picker',
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
    href: '/tools/favicon-generator',
    gradient: 'from-violet-500 to-purple-500',
    features: ['Multiple Sizes', 'ICO/PNG/SVG', 'Emoji Support', 'Preview & Download'],
    category: 'design',
  },
  {
    title: 'Screenshot Diff Tool',
    description:
      'Compare UI screenshots pixel-by-pixel to detect visual changes. Perfect for QA testing, design reviews, and tracking UI regressions. Highlights differences with customizable sensitivity.',
    icon: Diff,
    href: '/tools/screenshot-diff',
    gradient: 'from-orange-500 to-red-500',
    features: ['Pixel Comparison', 'Diff Highlight', 'Sensitivity Control', 'Side-by-Side View'],
    category: 'design',
  },
  {
    title: 'SVG Optimizer & Editor',
    description:
      'Minify and optimize SVG files with live preview. Remove unnecessary metadata, compress paths, and reduce file size by up to 70%. Edit colors, viewBox, and attributes visually.',
    icon: Layers,
    href: '/tools/svg-optimizer',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Minify SVG', 'Live Preview', 'Color Editor', 'Size Reduction'],
    category: 'design',
    comingSoon: true,
  },
  {
    title: 'Image Metadata Viewer',
    description:
      'Extract and view EXIF, GPS, camera settings, and technical metadata from photos. See location, date taken, camera model, exposure settings, and more. Perfect for photographers.',
    icon: Camera,
    href: '/tools/image-metadata',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['EXIF Data', 'GPS Location', 'Camera Settings', 'Date & Time'],
    category: 'design',
  },
  {
    title: 'Color Contrast Checker',
    description:
      'WCAG 2.1 compliant color contrast analyzer for accessibility. Test foreground and background color combinations, get AA/AAA ratings, and ensure your designs are readable for everyone.',
    icon: Eye,
    href: '/tools/color-contrast',
    gradient: 'from-pink-500 to-rose-500',
    features: ['WCAG 2.1', 'AA/AAA Rating', 'Live Preview', 'Accessibility Score'],
    category: 'design',
  },

  // Productivity & Workflow Tools
  {
    title: 'Task Timer with Sessions',
    description:
      'Track multiple task timers concurrently with session management. Monitor time spent on different projects, pause and resume timers, and sync across devices with Pro subscription.',
    icon: Timer,
    href: '/tools/task-timer',
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
    href: '/tools/clipboard-history',
    gradient: 'from-cyan-500 to-teal-500',
    features: ['Local Storage', 'Search History', 'Pin Favorites', 'Quick Restore'],
    category: 'productivity',
  },
  {
    title: 'Daily Note Generator',
    description:
      'Generate timestamped daily notes automatically with customizable templates. Organize thoughts, tasks, and ideas with date-based structure and quick access to recent notes.',
    icon: FileText,
    href: '/tools/daily-note',
    gradient: 'from-green-500 to-emerald-500',
    features: ['Auto Timestamps', 'Custom Templates', 'Date Navigation', 'Export Markdown'],
    category: 'productivity',
  },
  {
    title: 'Batch File Renamer',
    description:
      'Rename multiple files by pattern or custom rules using the browser File API. Apply prefix/suffix, find-replace, sequential numbering, and preview changes before applying.',
    icon: FolderEdit,
    href: '/tools/batch-rename',
    gradient: 'from-orange-500 to-red-500',
    features: ['Pattern Rules', 'Find & Replace', 'Sequential Numbers', 'Preview Changes'],
    category: 'productivity',
    comingSoon: false,
  },
  {
    title: 'JSON to Markdown Table',
    description:
      'Convert JSON arrays to beautifully formatted Markdown tables instantly. Customize column headers, alignment, and formatting. Perfect for documentation and README files.',
    icon: Table,
    href: '/tools/json-markdown-table',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Auto Format', 'Custom Headers', 'Column Alignment', 'Copy & Download'],
    category: 'productivity',
  },

  // System & Utility Tools
  {
    title: 'Browser Fingerprint Viewer',
    description:
      'Discover your unique browser fingerprint and device characteristics. View user agent, canvas fingerprint, WebGL renderer, screen resolution, installed fonts, and more for privacy awareness.',
    icon: Fingerprint,
    href: '/tools/browser-fingerprint',
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
    href: '/tools/speed-test',
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
    href: '/tools/clipboard-formatter',
    gradient: 'from-green-500 to-teal-500',
    features: ['Auto Format', 'Smart Detection', 'Case Transform', 'Whitespace Cleanup'],
    category: 'productivity',
  },
  {
    title: 'File Metadata Inspector',
    description:
      'Inspect file metadata without uploading. View MIME type, file size, hash (MD5/SHA-256), creation date, and technical properties. Perfect for debugging and file verification.',
    icon: FileSearch,
    href: '/tools/file-inspector',
    gradient: 'from-orange-500 to-red-500',
    features: ['MIME Type', 'File Hash', 'Size Analysis', 'No Upload Required'],
    category: 'development',
    comingSoon: false,
    premium: true,
  },

  // Text, Content & AI Tools
  {
    title: 'Grammar & Spell Checker',
    description:
      'Detect and fix grammar, spelling, and syntax errors with AI-powered suggestions. Support for multiple languages with style recommendations and contextual corrections. Powered by LanguageTool API.',
    icon: FileCheck,
    href: '/tools/grammar-checker',
    gradient: 'from-green-500 to-teal-500',
    features: ['Grammar Check', 'Spell Check', 'Style Tips', 'Multi-language'],
    category: 'productivity',
    comingSoon: true,
    premium: true,
  },
  {
    title: 'AI Prompt Explainer',
    description:
      'Analyze and optimize AI prompts for better results. Get suggestions to improve clarity, structure, and effectiveness. Learn prompt engineering techniques with AI-powered insights.',
    icon: Lightbulb,
    href: '/tools/prompt-explainer',
    gradient: 'from-purple-500 to-pink-500',
    features: ['Prompt Analysis', 'Optimization Tips', 'Best Practices', 'AI Insights'],
    category: 'development',
    comingSoon: false,
    premium: true,
  },
  {
    title: 'Text Summarizer',
    description:
      'Summarize long articles, documents, and text with AI. Generate concise bullet points or paragraph summaries. Adjustable summary length and tone for different use cases.',
    icon: Minimize2,
    href: '/tools/text-summarizer',
    gradient: 'from-blue-500 to-cyan-500',
    features: ['AI Summaries', 'Bullet Points', 'Adjustable Length', 'Key Highlights'],
    category: 'productivity',
    comingSoon: false,
    premium: true,
  },
  {
    title: 'Keyword Density Analyzer',
    description:
      'Analyze keyword usage and density in your content for SEO optimization. Track keyword frequency, identify overuse, and get suggestions for better keyword distribution and content balance.',
    icon: BarChart3,
    href: '/tools/keyword-density',
    gradient: 'from-orange-500 to-red-500',
    features: ['Keyword Tracking', 'Density Analysis', 'SEO Score', 'Distribution Chart'],
    category: 'productivity',
    comingSoon: true,
    premium: true,
  },
  {
    title: 'Text Similarity Checker',
    description:
      'Compare text blocks and measure similarity percentage using NLP algorithms. Detect duplicate content, plagiarism, and text variations. Batch comparison available in Pro version.',
    icon: GitCompare,
    href: '/tools/text-similarity',
    gradient: 'from-indigo-500 to-purple-500',
    features: ['Similarity Score', 'NLP Analysis', 'Batch Compare', 'Highlight Matches'],
    category: 'productivity',
    comingSoon: false,
    premium: false,
  },

  // AI-Powered Tools
  {
    title: 'AI Text Rewriter',
    description:
      'Rewrite content with AI-powered tone and style control. Transform text for different audiences, adjust formality, simplify complex writing, or make content more engaging using OpenAI GPT models.',
    icon: Sparkles,
    href: '/tools/ai-text-rewriter',
    gradient: 'from-violet-500 to-fuchsia-500',
    features: ['Tone Control', 'Style Adjustment', 'Multiple Variants', 'Preserve Meaning'],
    category: 'productivity',
    comingSoon: false,
    premium: false,
  },
  {
    title: 'AI JSON Analyzer',
    description:
      'Understand complex JSON structures with AI-powered analysis. Get natural language summaries, detect patterns, explain data relationships, and debug JSON with GPT function calling.',
    icon: Brain,
    href: '/tools/ai-json-analyzer',
    gradient: 'from-blue-500 to-indigo-500',
    features: ['Structure Summary', 'Pattern Detection', 'Relationship Mapping', 'Debug Insights'],
    category: 'development',
    comingSoon: false,
    premium: true,
  },
  {
    title: 'AI Command Explainer',
    description:
      'Explain complex CLI commands in plain English with AI assistance. Understand bash, git, docker, kubectl commands with detailed breakdowns. Free for basic explanations, unlimited with Pro.',
    icon: MessageSquare,
    href: '/tools/ai-command-explainer',
    gradient: 'from-green-500 to-teal-500',
    features: [
      'Command Breakdown',
      'Parameter Explanation',
      'Safety Warnings',
      'Alternative Suggestions',
    ],
    category: 'development',
    comingSoon: true,
    premium: true,
  },
  {
    title: 'AI Image Caption Generator',
    description:
      'Generate descriptive alt text and captions for images automatically using Vision API. Improve accessibility, SEO, and content discoverability with AI-powered image descriptions.',
    icon: ImagePlus,
    href: '/tools/ai-image-caption',
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
    title: 'AI Snippet Generator',
    description:
      'Generate code snippets instantly with AI. Create functions, classes, regex patterns, SQL queries, and more. Free tier includes basic snippets, unlimited generation with Pro subscription.',
    icon: Braces,
    href: '/tools/ai-snippet-generator',
    gradient: 'from-orange-500 to-amber-500',
    features: ['Multi-Language Support', 'Context-Aware', 'Instant Generation', 'Code Explanation'],
    category: 'development',
    comingSoon: false,
    premium: true,
  },
]
