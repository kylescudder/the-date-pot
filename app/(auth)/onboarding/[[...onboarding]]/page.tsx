import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs";
import React from "react";
import { redirect } from "next/navigation";
import Logout from "@/components/shared/Logout";
import { IUser } from "@/lib/models/user";
import { getUserInfo } from "@/lib/actions/user.actions";

export default async function page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo: IUser = await getUserInfo(user.id);
  if (userInfo?.onboarded) redirect("/");

  const userData: IUser = {
    clerkId: user.id,
    _id: userInfo?._id,
    username: userInfo ? userInfo?.username : user.emailAddresses[0].emailAddress,
    name: userInfo?.name ? userInfo?.name : user.firstName ?? "",
    bio: userInfo?.bio ? userInfo?.bio : "",
    image: userInfo ? userInfo.image : user?.imageUrl,
    onboarded: userInfo ? userInfo?.onboarded : false,
  };
  return (
    <main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
      <div className="flex justify-between">
        <h1 className="head-text">Onboarding</h1>
        <Logout placement="logout" />
      </div>
      <p className="mt-3 text-base-regular text-dark-2 dark:text-light-2">
        Complete your profile now to use the Date Pot
      </p>
      <section className="mt-9 bg-light-2 dark:bg-dark-2 p-10">
      </section>
    </main>
  );
}
