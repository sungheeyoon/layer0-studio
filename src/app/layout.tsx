import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth/current-user";
import ConditionalLayoutWrapper from "@/components/ConditionalLayoutWrapper";
import { SITE_URL } from "@/lib/seo/base-url";
import { subdomainFor } from "@/lib/subdomain";
import "./globals.css";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";

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
  // A Subdomain (`<slug>.<root>`) is a sessionless, read-only public origin
  // (ADR-0009): it serves only the published Site — no platform Navbar (its
  // /login·/signup·/templates links 404 here) and no auth lookup, keeping
  // getUser calls at 0. The middleware already skips updateSession for these;
  // gating getCurrentUser here keeps the whole request session-free.
  const host = (await headers()).get("host") ?? "";
  const isPublicSiteOrigin = subdomainFor(host, ROOT_DOMAIN).kind === "site";
  const user = isPublicSiteOrigin ? null : await getCurrentUser();

  return (
    <html lang="en" className="light">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
      </head>
      <body className={`${inter.variable} bg-surface font-body text-on-surface antialiased`}>
        {!isPublicSiteOrigin && (
          <ConditionalLayoutWrapper>
            <Navbar user={user} />
          </ConditionalLayoutWrapper>
        )}
        {children}
      </body>
    </html>
  );
}
