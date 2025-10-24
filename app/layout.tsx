import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SuperTool - Modern Developer Toolkit",
  description: "Beautiful developer tools for JSON formatting, file uploads, and more",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="flex min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white overflow-x-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <main className="flex-1 p-8 md:p-10 lg:p-12 relative overflow-hidden">
          {/* Background gradient orbs */}
          <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-pink-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
          
          {/* Content wrapper */}
          <div className="relative z-10">
            {children}
          </div>
        </main>

        {/* Toast notifications */}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'rgba(17, 24, 39, 0.95)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              color: 'white',
              backdropFilter: 'blur(10px)',
            },
          }}
        />
      </body>
    </html>
  );
}
