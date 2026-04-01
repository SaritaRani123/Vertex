import type { Metadata } from "next";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Program Scheduling System",
    template: "%s | Program Scheduling System",
  },
  description:
    "Manage departments, programs, courses, semesters, and term assignments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${figtree.className} antialiased min-h-screen bg-background text-foreground`}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
