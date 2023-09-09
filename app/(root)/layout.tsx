import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider, currentUser } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import "../globals.css";
import Topbar from "@/components/shared/Topbar";
import { MainContent } from "@/components/shared/MainContent";
import { getUserGroupPots, getUserInfo } from "@/lib/actions/user.actions";
import { IUser } from "@/lib/models/user";
import { redirect } from "next/navigation";
import { IPot } from "@/lib/models/pot";
import ThemeRegistry from "../ThemeRegistry";
import { Toast } from "@/components/shared/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Date Pot",
  description:
    "A collection of films to watch, places to eat, things to do, coffee shops to rate and vinyls to buy with your loved one. This project is subject to change on a whim if I (and my loved ones) decide we want to change it.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo: IUser = await getUserInfo(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const pots: IPot[] = await getUserGroupPots(userInfo._id);
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en">
        <body className={inter.className}>
          <ThemeRegistry options={{ key: "mui" }}>
            <Topbar pots={pots} />
            <MainContent pots={pots} children={children} />
            <Toast />
          </ThemeRegistry>
        </body>
      </html>
    </ClerkProvider>
  );
}
