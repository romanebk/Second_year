import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  ),
  title: "Trendza — Trouvez le produit phare à vendre",
  description:
    "Trendza aide les vendeurs e-commerce francophones à identifier le produit tendance du moment selon leur pays et la saison, puis à préparer leur lancement en quelques minutes.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${body.variable} ${sora.variable}`}>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        {children}
        <Toaster theme="light" position="top-center" richColors />
      </body>
    </html>
  );
}
