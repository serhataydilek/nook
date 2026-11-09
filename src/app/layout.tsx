import type { Metadata, Viewport } from "next";
import { Patrick_Hand, DM_Sans } from "next/font/google";
import "./globals.css";

const patrickHand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-patrick-hand",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "nook — your little corner of the internet",
  description:
    "Nook is a personal sketchbook for the web: save links, images, and notes, and find them again whenever you like.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FCF7F1",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${patrickHand.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
