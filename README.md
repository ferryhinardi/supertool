# 🚀 SuperTool

A modern web-based developer toolkit built with Next.js 16, featuring beautiful UI components and cloud storage integration.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ferryhinardi/supertool)

## ✨ Features

### 🛠️ Available Tools

#### 1. **JSON Beautifier** (`/tools/json-beautify`)
- ✅ Format & beautify JSON with syntax highlighting
- ✅ Minify JSON for production use
- ✅ Copy to clipboard with one click
- ✅ Real-time validation with error feedback
- ✅ Built-in CodeMirror editor with dark theme

#### 2. **File Upload** (`/tools/upload`)
- ✅ Upload files to Supabase Storage
- ✅ Generate public URLs instantly
- ✅ Drag-and-drop support (coming soon)
- ✅ Cloud-based storage with CDN delivery

## 🏗️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org) (App Router)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com) + [Radix UI](https://radix-ui.com)
- **Code Editor:** [@uiw/react-codemirror](https://uiwjs.github.io/react-codemirror/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)
- **Backend:** [Supabase](https://supabase.com) (Storage)

## 📦 Installation

### Prerequisites

- Node.js ≥ 20
- yarn (recommended) / pnpm / npm

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ferryhinardi/supertool.git
   cd supertool
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   pnpm install
   # or
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   > **Note:** Get your Supabase credentials from [app.supabase.com](https://app.supabase.com) → Your Project → Settings → API

4. **Run the development server**
   ```bash
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com/new)
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

**Auto-deployments:** Every push to `main` triggers a production deployment. Feature branches create preview deployments.

### Deploy to Other Platforms

```bash
# Build for production
yarn build

# Start production server
yarn start
```

## 📁 Project Structure

```
supertool/
├── app/
│   ├── layout.tsx          # Root layout with header/sidebar
│   ├── page.tsx            # Home page
│   ├── globals.css         # Global styles
│   └── tools/
│       ├── json-beautify/  # JSON formatter tool
│       └── upload/         # File upload tool
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # Top navigation
│   │   └── Sidebar.tsx     # Tool navigation sidebar
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── supabaseClient.ts   # Supabase configuration
│   └── utils.ts            # Utility functions
├── public/                 # Static assets
└── package.json
```

## 🧪 Development

### Adding a New Tool

1. Create a new page in `app/tools/[tool-name]/page.tsx`
2. Add navigation link in `components/layout/Sidebar.tsx`
3. Implement your tool logic

**Example:**
```tsx
// app/tools/my-tool/page.tsx
'use client'

export default function MyToolPage() {
  return (
    <main className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">My Tool</h1>
      {/* Your tool UI */}
    </main>
  )
}
```

### Code Quality

```bash
# Run linter
yarn lint

# Run type check
tsc --noEmit
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🔗 Links

- **Live Demo:** [supertool.vercel.app](https://supertool.vercel.app) _(replace with your actual URL)_
- **Repository:** [github.com/ferryhinardi/supertool](https://github.com/ferryhinardi/supertool)
- **Issues:** [Report a bug](https://github.com/ferryhinardi/supertool/issues)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) - The React Framework
- [Vercel](https://vercel.com) - Deployment platform
- [Supabase](https://supabase.com) - Backend as a Service
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components

---

Built with ❤️ by [Ferry Hinardi](https://github.com/ferryhinardi)
