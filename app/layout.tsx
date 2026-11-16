import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Find Your Way | Housing and support across BC",
    template: "%s | Find Your Way",
  },
  description:
    "Find shelters, housing programs, and support services across British Columbia.",
  icons: {
    icon: "/favicon.svg?v=compass",
    shortcut: "/favicon.svg?v=compass",
  },
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
