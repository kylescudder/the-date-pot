"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import Image from "next/image";
import { IUser } from "@/lib/models/user";
import { updateUser } from "@/lib/actions/user.actions";
import { Button, FileInput, TextInput, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";

interface Props {
  user: IUser;
  btnTitle: string;
}
const AccountProfile = ({ user, btnTitle }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const form = useForm({
    initialValues: {
      image: user?.image ? user.image : "",
      username: user?.username ? user.username : "",
      name: user?.name ? user.name : "",
      bio: user?.bio ? user.bio : "",
    },
  });
  const [imageString, setImageString] = useState<string>(form.values.image);

  interface formUser {
    image: string;
    username: string;
    name: string;
    bio: string;
  }
  const onSubmit = async (values: formUser) => {
    const payload: IUser = {
      _id: "",
      username: values.username,
      name: values.name,
      bio: values.bio,
      clerkId: user.clerkId,
      image: values.image,
      onboarded: true,
    };
    await updateUser(payload, pathname);
    if (pathname === "/profile/edit") {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleImage = (e: File) => {
    const fileReader = new FileReader();
    if (!e.type.includes("image")) return;

    fileReader.onload = () => {
      const base64String = fileReader.result;
      setImageString(base64String?.toString() || "");
      form.values.image = base64String?.toString() || "";
    };

    fileReader.readAsDataURL(e);
  };

  return (
    <form
      onSubmit={form.onSubmit((values) => onSubmit(values))}
      className="flex flex-col justify-start gap-10"
    >
      {form.values.image ? (
        <Image
          src={imageString}
          alt="profile_icon"
          width={96}
          height={96}
          priority
          className="rounded-full object-contain"
        />
      ) : (
        <Image
          src="/assets/profile.svg"
          alt="profile_icon"
          width={24}
          height={24}
          className="object-contain"
        />
      )}
      <FileInput
        label="Profile Picture"
        radius="md"
        className="text-dark-2 dark:text-light-2"
        size="md"
        {...form.getInputProps("image")}
        onChange={(e) => handleImage(e!)}
      />
      <TextInput
        label="Name"
        radius="md"
        placeholder="What's your name girl, what's you sign?"
        className="text-dark-2 dark:text-light-2"
        size="md"
        {...form.getInputProps("name")}
      />
      <TextInput
        label="Username"
        radius="md"
        placeholder="your email address plz"
        className="text-dark-2 dark:text-light-2"
        size="md"
        {...form.getInputProps("username")}
      />
      <Textarea
        label="Bio"
        radius="md"
        placeholder="Tell me a little bit about yourself..."
        className="text-lg leading-6 font-semibold text-dark-2 dark:text-light-2"
        size="md"
        minRows={8}
        {...form.getInputProps("bio")}
      />
      <Button
        radius="md"
        size="md"
        className="bg-primary-500 hover:bg-primary-hover"
        type="submit"
      >
        {btnTitle}
      </Button>
    </form>
  );
};

export default AccountProfile;
