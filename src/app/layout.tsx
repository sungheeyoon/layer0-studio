import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import { createClient } from "@/utils/supabase/server";
import ConditionalLayoutWrapper from "@/components/ConditionalLayoutWrapper";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100", "300", "500", "700"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Layer0 Studio",
  description: "Build and manage your website without developers.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <html lang="en" className="light">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
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
