"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { usePathname, useRouter } from "next/navigation";
import { ChangeEvent } from "react";
import Image from "next/image";
import { IUser } from "@/lib/models/user";
import { updateUser } from "@/lib/actions/user.actions";
import { Button } from "@mantine/core";

interface Props {
  user: IUser;
  btnTitle: string;
}
const AccountProfile = ({ user, btnTitle }: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    defaultValues: {
      image: user?.image ? user.image : "",
      username: user?.username ? user.username : "",
      name: user?.name ? user.name : "",
      bio: user?.bio ? user.bio : "",
    },
  });
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

  const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault();

    const fileReader = new FileReader();

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (!file.type.includes("image")) return;

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      };

      fileReader.readAsDataURL(file);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-start gap-10"
      >
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel className="account-form_image-label">
                {field.value ? (
                  <Image
                    src={field.value}
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
              </FormLabel>
              <FormControl className="flex-1 text-base-semibold text-gray-200">
                <Input
                  type="file"
                  accept="image/*"
                  placeholder="Add profile photo"
                  className="account-form_image-input"
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w=full">
              <FormLabel className="text-base-semibold text-dark-2 dark:text-light-2">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
      <FileInput
        label="Profile Picture"
        radius="md"
        placeholder="Show us your pretty face"
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
      <Button radius="md" size="md" className="bg-primary-500" type="submit">
        {btnTitle}
      </Button>
    </form>
  );
};

export default AccountProfile;
