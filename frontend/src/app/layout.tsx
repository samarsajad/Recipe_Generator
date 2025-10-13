import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext"; 
import { Geist, Geist_Mono } from "next/font/google";
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Recipe Generator",
  description: "Generate recipes from ingredients you have at home.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        {/* Wrap the entire application in the AuthProvider */}
        <AuthProvider>
          {/* Main content grows to fill available space */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer at the bottom */}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}








