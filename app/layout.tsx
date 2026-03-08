import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "AfricaPEP — African PEP Screening",
  description:
    "Open-source Politically Exposed Persons database covering all 54 African countries. Screen names for KYC/AML compliance.",
  keywords: ["PEP", "KYC", "AML", "Africa", "compliance", "screening", "politically exposed persons"],
  openGraph: {
    title: "AfricaPEP — African PEP Screening",
    description: "Open-source PEP database covering all 54 African countries for KYC/AML compliance.",
    url: "https://pep.patrickaiafrica.com",
    siteName: "AfricaPEP",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <NavBar />
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
