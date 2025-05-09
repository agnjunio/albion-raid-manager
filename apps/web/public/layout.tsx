import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { DM_Mono, DM_Sans, Lora, Pirata_One } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: "400",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: "400",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: "400",
});

const pirataOne = Pirata_One({
  subsets: ["latin"],
  variable: "--font-pirata-one",
  weight: "400",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          `bg-background text-foreground flex h-screen flex-col items-center font-sans antialiased`,
          dmMono.variable,
          dmSans.variable,
          lora.variable,
          pirataOne.variable,
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
