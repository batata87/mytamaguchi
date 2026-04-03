import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Quicksand } from "next/font/google";
import "./globals.css";

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["400", "500", "700"]
});

const merchantSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-merchant"
});

export const metadata: Metadata = {
  title: "Bia",
  description: "A mobile-first creature care game built with Next.js",
  appleWebApp: {
    capable: true,
    title: "Bia",
    statusBarStyle: "black-translucent"
  },
  formatDetection: {
    telephone: false
  }
};

/** Lets the page extend into notches / home indicator; pairs with safe-area padding in the UI. */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ddd6fe"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${quicksand.className} ${merchantSerif.variable} app-native-shell`}>{children}</body>
    </html>
  );
}
