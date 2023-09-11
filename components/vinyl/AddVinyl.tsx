"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { IVinyl } from "@/lib/models/vinyl";
import { updateVinyl } from "@/lib/actions/vinyl.action";
import Checkbox from "../ui/checkbox";
import { Button } from "../ui/button";
import { successToast } from "@/lib/actions/toast.actions";
import { IconArrowNarrowLeft } from "@tabler/icons-react";

export default function AddVinyl(props: { vinyl: IVinyl }) {
  const router = useRouter();
  const pathname = usePathname();
  const [changesMade, setChangesMade] = useState<boolean>(false);

  interface formVinyl {
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
      _id: props.vinyl._id ? props.vinyl._id : "",
      name: props.vinyl.name ? props.vinyl.name : "",
      artistName: props.vinyl.artistName ? props.vinyl.artistName : "",
      purchased: props.vinyl.purchased ? props.vinyl.purchased : false,
      archive: props.vinyl.archive ? props.vinyl.archive : false,
      addedByID: props.vinyl.addedByID ? props.vinyl.addedByID : "",
      userGroupID: props.vinyl.userGroupID ? props.vinyl.userGroupID : "",
    },
  });
  
  const onSubmit = async (values: formVinyl) => {
    const payload: IVinyl = {
      ...props.vinyl,
      name: values.name,
      artistName: values.artistName,
      purchased: values.purchased,
    };

    const vinyl = await updateVinyl(payload);
    if (pathname.includes("/vinyl/")) {
      successToast(vinyl);
      setChangesMade(true);
    } else {
      router.push(`/vinyl/${vinyl._id}`);
    }
  };

  const handleBack = () => {
    if (changesMade) {
      const url = `${window.location.protocol}//${window.location.host}`;
      window.location.href = `${url}/vinyls`;
    } else {
      router.back();
    }
  };

  return (
    <div>
      <IconArrowNarrowLeft
        onClick={handleBack}
        aria-label="back"
        className={`dark:text-light-1 text-dark-1 ${
          props.vinyl._id === "" ? "hidden" : ""
        }`}
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`flex flex-col justify-start gap-10 pt-4 ${
            props.vinyl._id === "" ? "px-6" : ""
          }`}
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
    </div>
  );
}
