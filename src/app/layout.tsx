import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth/current-user";
import ConditionalLayoutWrapper from "@/components/ConditionalLayoutWrapper";
import { SITE_URL } from "@/lib/seo/base-url";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "300", "500", "700"],
  variable: "--font-inter",
});

const SITE_NAME = "Layer0 Studio";
const SITE_DESCRIPTION = "Build and manage your website without developers.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  return (
    <html lang="en" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${inter.variable} bg-surface font-body text-on-surface antialiased`}>
        <ConditionalLayoutWrapper>
          <Navbar user={user} />
        </ConditionalLayoutWrapper>
        {children}
      </body>
    </html>
  );
}
