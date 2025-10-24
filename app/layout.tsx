import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import { Home, Code, Upload } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white flex flex-col p-4">
          <h1 className="text-xl font-semibold mb-6 flex items-center gap-2">
            ⚡ SuperTool
          </h1>

          <nav className="space-y-2">
            <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
              <Home size={18} /> Home
            </Link>
            <Link href="/json" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
              <Code size={18} /> JSON Beautifier
            </Link>
            <Link href="/upload" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition">
              <Upload size={18} /> File Upload
            </Link>
          </nav>

          <div className="mt-auto text-sm text-gray-400 pt-4 border-t border-gray-800">
            Built with ❤️ by Ferry
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-10 flex flex-col items-center justify-center text-center">
          {children}
        </main>
      </body>
    </html>
  );
}
