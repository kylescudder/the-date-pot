"use client";

import React from "react";
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { IVinyl } from "@/lib/models/vinyl";
import { updateVinyl } from "@/lib/actions/vinyl.action";
import Checkbox from "../ui/checkbox";
import { Button } from "../ui/button";
import { successToast } from "@/lib/actions/toast.actions";

export default function AddVinyl(props: { vinyl: IVinyl }) {
  const router = useRouter();
  const pathname = usePathname();

  interface formUser {
    _id: string;
    name: string;
    artistName: string;
    purchased: boolean;
    archive: boolean;
    addedByID: string;
    userGroupID: string;
  }

  const form = useForm({
    defaultValues: {
      // _id: props.vinyl._id ? props.vinyl._id : "",
      name: props.vinyl.name ? props.vinyl.name : "",
      artistName: props.vinyl.artistName ? props.vinyl.artistName : "",
      purchased: props.vinyl.purchased ? props.vinyl.purchased : false,
      archive: props.vinyl.archive ? props.vinyl.archive : false,
      addedByID: props.vinyl.addedByID ? props.vinyl.addedByID : "",
      userGroupID: props.vinyl.userGroupID ? props.vinyl.userGroupID : "",
    },
  });

  const onSubmit = async (values: formUser) => {
    const payload: IVinyl = {
      _id: "",
      name: values.name,
      artistName: values.artistName,
      purchased: values.purchased,
      archive: false,
      addedByID: "",
      userGroupID: "",
    };
    const vinyl = await updateVinyl(payload);
    if (pathname.includes('/vinyl/')) {
      successToast(vinyl);
    } else {
      router.push(`/vinyl/${vinyl._id}`);
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
          name="name"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w=full">
              <FormLabel className="text-base-semibold text-dark-2 dark:text-light-2">
                Name
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus text-dark-2 dark:text-light-2"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="artistName"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w=full">
              <FormLabel className="text-base-semibold text-dark-2 dark:text-light-2">
                Artist
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="account-form_input no-focus text-dark-2 dark:text-light-2"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="purchased"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-3 w=full">
              <FormControl>
                <Checkbox text="Purchased" {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button className="bg-primary-500 text-light-1" type="submit">
          Add Vinyl
        </Button>
      </form>
    </Form>
  );
}
