import { Roboto, Roboto_Mono } from "next/font/google";
import { Providers } from "./providers";

import { Container } from "@/components/pages/container";
import { Footer } from "@/components/pages/footer";
import { Header } from "@/components/pages/header";
import "./globals.css";

const roboto = Roboto({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: "400",
});

const robotoMono = Roboto_Mono({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-roboto-mono",
});

export const metadata = {
  title: "Albion Raid Manager - Organize Raids with Ease",
  description:
    "Streamline your guild's raid organization in Albion Online with a clean interface and Discord integration for easy player signups.",
  keywords: "Albion Online, Raid Manager, Guild Tools, Discord Integration, Raid Organization",
  openGraph: {
    title: "Albion Raid Manager",
    description:
      "Streamline your guild's raid organization in Albion Online with a clean interface and Discord integration for easy player signups.",
    url: "https://albion-raid-manager.com",
    images: [
      {
        url: "https://albion-raid-manager.com/preview.jpg",
        width: 1200,
        height: 630,
        alt: "Albion Raid Manager Preview Image",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Albion Raid Manager",
    description:
      "Streamline your guild's raid organization in Albion Online with a clean interface and Discord integration for easy player signups.",
    images: ["https://albion-raid-manager.com/preview.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${roboto.variable} ${robotoMono.variable} antialiased flex flex-col h-screen items-center bg-gray-100 dark:bg-black text-black dark:text-gray-50`}
      >
        <Providers>
          <Header />
          <Container>{children}</Container>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
