import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import UserHydration from "@/components/providers/UserHydration";
import CartHydration from "@/components/providers/CartHydration";
import TokenRefresher from "@/utils/tokenRefresher";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Veracious - Find Your Perfect Style",
  description:
    "Discover eyewear that complements your unique style and face shape",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <UserHydration />
          <CartHydration />
          <TokenRefresher />
          <ConditionalNavbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
