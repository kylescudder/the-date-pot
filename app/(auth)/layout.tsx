// app/layout.tsx
import "../globals.css";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import { dark } from "@clerk/themes";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Date Pot",
  description:
    "A collection of films to watch, places to eat, things to do, coffee shops to rate and vinyls to buy with your loved one. This project is subject to change on a whim if I (and my loved ones) decide we want to change it.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en">
        <body className={`${inter.className} main-container`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
