import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Birtha Feedback",
  description: "A simple feedback and roadmap board for Birtha.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
