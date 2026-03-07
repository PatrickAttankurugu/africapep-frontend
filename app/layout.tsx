import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AfricaPEP — African PEP Screening",
  description:
    "Open-source Politically Exposed Persons database covering all 54 African countries. Screen names for KYC/AML compliance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <a href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AP</span>
                </div>
                <span className="font-bold text-xl text-gray-900">
                  Africa<span className="text-emerald-600">PEP</span>
                </span>
              </a>
              <div className="flex gap-1">
                <a href="/" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition">
                  Screen
                </a>
                <a href="/search" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition">
                  Search
                </a>
                <a href="/stats" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition">
                  Dashboard
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
            <p>AfricaPEP — Open-source PEP database for Africa. Covering all 54 AU member states.</p>
            <p className="mt-1">
              Built for KYC/AML compliance.{" "}
              <a href="https://github.com/PatrickAttankurugu/AfricaPEP" className="text-emerald-600 hover:underline" target="_blank" rel="noopener">
                View on GitHub
              </a>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
