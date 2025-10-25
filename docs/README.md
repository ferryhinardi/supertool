# 🚀 SuperTool - Modern Developer Toolkit

Beautiful, fast, and powerful developer tools built with modern web technologies.

## ✨ Features

- 🎨 **JSON Beautifier** - Format, validate, and minify JSON with syntax highlighting
- 📁 **File Upload** - Upload files to cloud storage with drag-and-drop support
- 🎯 **More Coming Soon** - Image optimization, API testing, and more!

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI + shadcn/ui
- **Animations:** Framer Motion
- **Testing:** Vitest with Browser Mode
- **Code Quality:** ESLint, Prettier, Husky
- **Package Manager:** pnpm

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/ferryhinardi/supertool.git
cd supertool

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 📝 Available Scripts

| Command             | Description               |
| ------------------- | ------------------------- |
| `pnpm dev`          | Start development server  |
| `pnpm build`        | Build for production      |
| `pnpm start`        | Start production server   |
| `pnpm lint`         | Run ESLint                |
| `pnpm lint:fix`     | Fix ESLint errors         |
| `pnpm format`       | Format code with Prettier |
| `pnpm test`         | Run tests in watch mode   |
| `pnpm test:ui`      | Open Vitest UI            |
| `pnpm test:browser` | Run browser tests         |

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

## � CI/CD

This project uses GitHub Actions for continuous integration and deployment:

- ✅ **Automated Testing** - Runs all 83 tests on every push
- 🔍 **Code Quality** - ESLint and TypeScript checks
- 📦 **Build Verification** - Ensures production builds succeed
- 📊 **Coverage Reports** - Automatic coverage tracking

### CI Workflow

```
Lint & Type Check ──┬──→ Unit Tests (parallel)
                    └──→ Build (parallel)
```

See [CI_CD_SETUP.md](./docs/CI_CD_SETUP.md) for detailed setup instructions.

## 🎨 Styling with Panda CSS

This project uses **Panda CSS** for styling with **Ark UI** components:

- ✅ **Zero-runtime** - CSS-in-JS with zero runtime overhead
- 🎯 **Type-safe** - Full TypeScript support with autocomplete
- 📦 **Optimized** - Only generates CSS for styles you use
- ♿ **Accessible** - Built on Ark UI's accessible components

For styling guidelines and best practices, see:

- [PANDA_CSS_GUIDE.md](./docs/PANDA_CSS_GUIDE.md) - Complete Panda CSS guide
- [Panda CSS Documentation](https://panda-css.com)
- [Ark UI Documentation](https://ark-ui.com)

## 📁 Project Structure

```
supertool/
├── app/                    # Next.js app directory
│   ├── tools/             # Tool pages
│   │   ├── json-beautify/ # JSON beautifier
│   │   └── upload/        # File upload
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── features/         # Feature components
│   └── ui/               # UI components (Ark UI)
├── lib/                  # Utilities and helpers
├── styled-system/        # Panda CSS generated files
├── docs/                 # Documentation
└── public/              # Static assets
```

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
