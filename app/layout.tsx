import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import UserSync from "./component/UserSync";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-Commerce Admin Dashboard",
  description: "Next.js E-commerce application with Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
    appearance={{
    elements: {
      devBrowser: { display: "none" }
    }
    
  }}
>
      <html lang="en">
        <body className="antialiased">
          <UserSync />
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
