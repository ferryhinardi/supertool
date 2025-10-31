# 🚀 SuperTool - Modern Developer Toolkit

Professional toolkit with 36+ implemented tools for developers, designers, and productivity enthusiasts. All tools work offline in your browser with no registration required.

## 📚 Documentation

### 🚀 Getting Started

- **[Full Documentation](./docs/README.md)** - Complete project documentation
- **[Testing Guide](./docs/TESTING.md)** - Testing setup and guidelines
- **[Quick Start](./docs/TESTING_QUICKSTART.md)** - Get started quickly
- **[Contributing](./CONTRIBUTING.md)** - How to contribute

### 🔧 Development Guides

- **[MCP Setup](./docs/MCP_SETUP.md)** - Model Context Protocol integration
- **[CI/CD Setup](./docs/CI_CD_SETUP.md)** - Continuous integration guide
- **[Panda CSS Guide](./docs/PANDA_CSS_GUIDE.md)** - Styling system documentation
- **[Recent Tools Tracking](./docs/RECENT_TOOLS_TRACKING.md)** - Usage tracking system

### 📖 Tool Documentation (30+ Guides)

- **[JSON Beautifier](./docs/01_JSON_BEAUTIFIER.md)** - JSON formatting and validation
- **[Code Diff Viewer](./docs/05_CODE_DIFF_VIEWER.md)** - Text and code comparison
- **[API Request Tester](./docs/26_API_REQUEST_TESTER.md)** - REST API testing tool
- **[Image Optimizer](./docs/09_IMAGE_OPTIMIZER.md)** - Image compression and conversion
- **[Video Converter](./docs/10_VIDEO_CONVERTER.md)** - Video format conversion
- **[Encryption Tool](./docs/21_ENCRYPTION_TOOL.md)** - AES-256 encryption
- **[Currency Converter](./docs/24_CURRENCY_CONVERTER.md)** - Real-time exchange rates
- **[Password Generator](./docs/04_PASSWORD_GENERATOR.md)** - Secure password creation
- **[... and 22+ more](./docs/)** - Complete tool documentation

## ✨ Features

### 🔥 Currently Active Tools (36+ Tools)

**Data Processing & Development:**

- 🎨 **JSON Beautifier** - Format, validate, and minify JSON with syntax highlighting
- 🔄 **Code Diff Viewer** - GitHub-style diff comparison for text, JSON, and code
- 📊 **JSON to CSV** - Convert JSON arrays to CSV with nested object support
- 🔗 **JSON Schema Generator** - Auto-generate schemas from sample JSON data
- 🌐 **API Request Tester** - Lightweight Postman alternative for testing REST APIs
- 📋 **JSON to Markdown Table** - Convert JSON to formatted Markdown tables

**Media & Design Tools:**

- 🖼️ **Image Optimizer** - Compress and convert images with WebP/AVIF support
- 🎬 **Video Converter** - Convert video formats using in-browser FFmpeg
- 🎨 **Gradient Generator** - Create CSS gradients with visual editor
- 🎯 **Color Contrast Checker** - WCAG 2.1 accessibility compliance checker
- 📸 **Screenshot Diff Tool** - Compare UI screenshots pixel-by-pixel

**Productivity & Utilities:**

- ✂️ **Text Transformer** - Case conversion, word count, duplicate removal
- 📝 **Markdown Editor** - Real-time GitHub-flavored markdown editor
- 🔗 **URL Shortener** - Create short links with analytics and QR codes
- ⏰ **Stopwatch & Timer** - Multi-timer with lap tracking and presets
- � **Tally Counter** - Simple counting tool with keyboard shortcuts
- 📅 **Daily Task Summary** - Organize and track daily productivity

**Security & Encryption:**

- 🔐 **Base64 Encoder** - Convert text/files to Base64 with image preview
- 🔒 **Encryption Tool** - AES-256 encryption with secure password protection
- #️⃣ **Hash Generator** - Generate MD5, SHA-256, SHA-512 hashes
- 🔑 **Password Generator** - Cryptographically secure password creation
- 🛡️ **Password Strength Analyzer** - Measure password entropy and security

**Finance & Calculators:**

- 💰 **Split Bill Calculator** - Divide expenses with tip and tax calculations
- 💱 **Currency Converter** - Real-time exchange rates for 150+ currencies
- 📊 **BMI Calculator** - Health metrics with personalized recommendations
- ⏱️ **Pomodoro Timer** - Focus sessions with task tracking

**Development Tools:**

- 🌐 **IP Address Lookup** - Get geolocation and ISP information
- 📱 **Website Screenshot** - Capture full-page screenshots of any site
- 🔍 **Browser Fingerprint Viewer** - Analyze device characteristics for privacy
- 📏 **Unit Converter** - Convert between 30+ measurement categories

**Additional Features:**

- 🤖 **MCP Integration** - AI-enhanced development with GitHub, Git, and more
- 🧪 **Fully Tested** - 109+ tests with Vitest + Browser Mode
- 🔄 **Real-time Processing** - All tools work offline in your browser
- 📱 **Mobile Optimized** - Responsive design for all screen sizes
- 🎯 **38+ More Coming** - Advanced AI tools, premium features, and more!

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Styling:** Panda CSS
- **UI Components:** Ark UI + Radix UI
- **Animations:** Framer Motion
- **Testing:** Vitest with Browser Mode
- **Code Quality:** ESLint, Prettier, Husky
- **MCP:** Model Context Protocol for AI integration
- **Package Manager:** pnpm

## � Quick Start

```bash
# Clone the repository
git clone https://github.com/ferryhinardi/supertool.git
cd supertool

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run tests
pnpm test
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🤖 MCP Integration

SuperTool includes Model Context Protocol (MCP) integration for enhanced AI-assisted development:

```bash
# Validate MCP setup
pnpm mcp:validate

# Set up environment (first time)
cp .env.example .env
# Edit .env and add your GITHUB_TOKEN
```

**MCP Features:**

- 🔗 GitHub integration (issues, PRs, actions)
- 📁 Filesystem and Git operations
- 🧠 Memory and context persistence
- 🤔 Sequential thinking capabilities

See [docs/MCP_SETUP.md](./docs/MCP_SETUP.md) for complete setup instructions.

## 📝 Available Scripts

| Command             | Description                |
| ------------------- | -------------------------- |
| `pnpm dev`          | Start development server   |
| `pnpm build`        | Build for production       |
| `pnpm start`        | Start production server    |
| `pnpm lint`         | Run ESLint                 |
| `pnpm lint:fix`     | Fix ESLint errors          |
| `pnpm format`       | Format code with Prettier  |
| `pnpm test`         | Run tests in watch mode    |
| `pnpm test:ui`      | Open Vitest UI             |
| `pnpm test:browser` | Run browser tests          |
| `pnpm mcp:validate` | Validate MCP configuration |
| `pnpm mcp:setup`    | Set up MCP integration     |

## 🧪 Testing

This project uses Vitest with Browser Mode powered by Playwright.

### Quick Start

```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install chromium

# Run tests
pnpm test

# Run tests in browser mode
pnpm test:browser

# Open Vitest UI
pnpm test:ui
```

See [TESTING_QUICKSTART.md](./docs/TESTING_QUICKSTART.md) for more details.

## 📁 Project Structure

```
supertool/
├── app/                    # Next.js app directory
│   ├── tools/             # Tool pages (36+ implemented tools)
│   │   ├── json-beautify/ # JSON beautifier & formatter
│   │   ├── diff/          # Code diff viewer
│   │   ├── upload/        # Cloud file upload
│   │   ├── api-tester/    # API request tester
│   │   ├── base64/        # Base64 encoder/decoder
│   │   ├── encryption-tool/ # AES encryption tool
│   │   ├── hash-generator/ # Cryptographic hash tool
│   │   ├── image-optimizer/ # Image compression
│   │   ├── video-converter/ # Video format converter
│   │   ├── password-generator/ # Secure password creation
│   │   ├── qr-code/       # QR code generator
│   │   ├── url-shortener/ # URL shortening service
│   │   ├── markdown-editor/ # Markdown editor with preview
│   │   ├── text-transformer/ # Text manipulation tools
│   │   ├── unit-converter/ # Unit conversion utility
│   │   ├── currency-converter/ # Currency exchange rates
│   │   ├── split-bill/    # Bill splitting calculator
│   │   ├── gradient-generator/ # CSS gradient creator
│   │   ├── color-contrast/ # WCAG accessibility checker
│   │   ├── stopwatch-timer/ # Multi-timer with presets
│   │   ├── pomodoro/      # Pomodoro focus timer
│   │   ├── json-to-csv/   # JSON to CSV converter
│   │   ├── json-schema/   # JSON schema generator
│   │   └── ... (20+ more) # Additional implemented tools
│   ├── layout.tsx         # Root layout with sidebar
│   ├── page.tsx           # Homepage with tool showcase
│   └── globals.css        # Global styles and themes
├── components/            # React components
│   ├── layout/           # Sidebar, navigation components
│   ├── features/         # Tool-specific features (DragDrop, etc.)
│   └── ui/               # Base UI components (Ark UI + Panda CSS)
├── lib/                  # Utilities and helpers
│   ├── tools.ts          # Tool definitions and metadata
│   ├── analytics.ts      # Google Analytics integration
│   ├── utils.ts          # Common utilities
│   └── supabaseClient.ts # Database client
├── styled-system/        # Panda CSS generated files
├── docs/                 # Comprehensive documentation (30+ guides)
├── hooks/               # Custom React hooks
├── __tests__/           # Test files (Vitest + Browser Mode)
└── public/              # Static assets and icons
```

## 🎨 Styling & UI

This project uses **Panda CSS** for styling with **Ark UI** components:

- **[Panda CSS](https://panda-css.com/)** - Modern CSS-in-JS with zero runtime
- **[Ark UI](https://ark-ui.com/)** - Headless UI components with accessibility

For styling guidelines, see [docs/PANDA_CSS_GUIDE.md](./docs/PANDA_CSS_GUIDE.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [Panda CSS](https://panda-css.com/)
- [Ark UI](https://ark-ui.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vitest](https://vitest.dev/)

## 📧 Contact

Ferry Hinardi - [@ferryhinardi](https://github.com/ferryhinardi)

Project Link: [https://github.com/ferryhinardi/supertool](https://github.com/ferryhinardi/supertool)
# CI Test
