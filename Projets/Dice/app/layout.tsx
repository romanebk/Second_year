import type { Metadata, Viewport } from "next";
import { Fraunces, Bagel_Fat_One, Outfit, Unbounded, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  weight: ["400", "700", "800", "900"],
  display: "swap",
});

const bagel = Bagel_Fat_One({
  subsets: ["latin"],
  variable: "--font-bagel",
  weight: "400",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600", "700", "900"],
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  weight: ["300", "400", "700", "900"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dice Désir",
  description: "Le jeu de dés pour couples qui assument. 100% privé, 100% offline.",
  manifest: "/manifest.json",
  applicationName: "Dice Désir",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Dice Désir",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icons/icon-192.png", sizes: "192x192" },
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fdf3e7" },
    { media: "(prefers-color-scheme: dark)", color: "#050507" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${bagel.variable} ${outfit.variable} ${unbounded.variable} ${jetbrains.variable} antialiased font-body`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
