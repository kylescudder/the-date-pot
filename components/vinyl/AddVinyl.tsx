"use client";

import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { usePathname, useRouter } from "next/navigation";
import { IVinyl } from "@/lib/models/vinyl";
import { archiveVinyl, updateVinyl } from "@/lib/actions/vinyl.action";
import { archiveToast, successToast } from "@/lib/actions/toast.actions";
import { IconTrash } from "@tabler/icons-react";
import BackButton from "../shared/BackButton";
import { Button, Checkbox, TextInput } from "@mantine/core";

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
    initialValues: {
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
      successToast(vinyl.name);
      setChangesMade(true);
    } else {
      router.push(`/vinyl/${vinyl._id}`);
    }
  };

  const handleArchive = async () => {
    await archiveVinyl(props.vinyl._id);
    archiveToast(props.vinyl.name);
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`;
      window.location.href = `${url}/vinyls`;
    }, 1000);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <BackButton
          record={props.vinyl}
          changesMade={changesMade}
          page="vinyls"
        />
        <Button
          className={`bg-danger text-light-1 ${
            props.vinyl._id === "" ? "hidden" : ""
          }`}
          onClick={handleArchive}
          aria-label="archive"
        >
          <IconTrash className="dark:text-light-1 text-dark-1" />
        </Button>
      </div>
      <form
        onSubmit={form.onSubmit((values) => onSubmit(values))}
        className={`flex flex-col justify-start gap-10 pt-4 ${
          props.vinyl._id === "" ? "px-6" : ""
        }`}
      >
        <TextInput
          label="Name"
          radius="md"
          placeholder="The next AOTY"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Artist Name"
          radius="md"
          placeholder="GOATs only plz"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps("artistName")}
        />
        <Checkbox
          mt="md"
          radius="md"
          label={<p className="text-dark-1 dark:text-light-1">Purchased</p>}
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps("purchased", { type: "checkbox" })}
        />
        <Button
          radius="md"
          className="bg-primary-500 hover:bg-primary-hover text-light-1"
          type="submit"
        >
          {props.vinyl._id === "" ? "Add" : "Update"} Vinyl
        </Button>
      </form>
    </div>
  );
}
