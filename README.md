# 🚀 SuperTool - Modern Developer Toolkit

Beautiful, fast, and powerful developer tools built with modern web technologies.

## 📚 Documentation

- **[Full Documentation](./docs/README.md)** - Complete project documentation
- **[Testing Guide](./docs/TESTING.md)** - Testing setup and guidelines
- **[MCP Setup](./docs/MCP_SETUP.md)** - Model Context Protocol integration
- **[CI/CD Setup](./docs/CI_CD_SETUP.md)** - Continuous integration guide
- **[Quick Start](./docs/TESTING_QUICKSTART.md)** - Get started quickly
- **[Contributing](./CONTRIBUTING.md)** - How to contribute

## ✨ Features

- 🎨 **JSON Beautifier** - Format, validate, and minify JSON with syntax highlighting
- 🔄 **Diff Viewer** - Compare text/JSON side-by-side like GitHub PR reviews
- 📁 **File Upload** - Upload files to cloud storage with drag-and-drop support
- 🤖 **MCP Integration** - AI-enhanced development with GitHub, Git, and more
- 🧪 **Fully Tested** - 109 tests with Vitest + Browser Mode
- 🎯 **More Coming Soon** - Image optimization, API testing, and more!

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Styling:** Tailwind CSS v4
- **UI Components:** Radix UI + shadcn/ui
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
│   ├── tools/             # Tool pages
│   │   ├── json-beautify/ # JSON beautifier
│   │   └── upload/        # File upload
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── features/         # Feature components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                  # Utilities and helpers
├── docs/                 # Documentation
└── public/              # Static assets
```

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components. To add new components:

```bash
pnpm ui:add button
pnpm ui:add dialog
# etc.
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
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Vitest](https://vitest.dev/)

## 📧 Contact

Ferry Hinardi - [@ferryhinardi](https://github.com/ferryhinardi)

Project Link: [https://github.com/ferryhinardi/supertool](https://github.com/ferryhinardi/supertool)
