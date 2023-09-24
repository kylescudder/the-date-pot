"use client";

import React, { useState } from "react";
import { useForm } from "@mantine/form";
import { usePathname, useRouter } from "next/navigation";
import { IRestaurant } from "@/lib/models/restaurant";
import {
  archiveRestaurant,
  updateRestaurant,
} from "@/lib/actions/restaurant.action";
import { archiveToast, successToast } from "@/lib/actions/toast.actions";
import { IconArchive } from "@tabler/icons-react";
import BackButton from "../shared/BackButton";
import {
  Button,
  MultiSelect,
  TextInput,
} from "@mantine/core";
import Map from "../shared/Map";
import { ICuisine } from "@/lib/models/cuisine";
import { option } from "@/lib/models/select-options";
import { IWhen } from "@/lib/models/when";

export default function AddRestaurant(props: {
  restaurant: IRestaurant;
  longLat: number[];
  cuisineList: ICuisine[];
  whenList: IWhen[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [changesMade, setChangesMade] = useState<boolean>(false);

  const cuisineOptions: option[] = props.cuisineList.map((user: ICuisine) => ({
    value: user.cuisine,
    label: user.cuisine,
  }));
  const whenOptions: option[] = props.whenList.map((user: IWhen) => ({
    value: user.when,
    label: user.when,
  }));


  interface formRestaurant {
    _id: string;
    restaurantName: string;
    address: string;
    archive: boolean;
    userGroupID: string;
    cuisines: string[];
    whens: string[];
  }

  const form = useForm({
    initialValues: {
      _id: props.restaurant._id ? props.restaurant._id : "",
      restaurantName: props.restaurant.restaurantName
        ? props.restaurant.restaurantName
        : "",
      address: props.restaurant.address ? props.restaurant.address : "",
      archive: props.restaurant.archive ? props.restaurant.archive : false,
      userGroupID: props.restaurant.userGroupID
        ? props.restaurant.userGroupID
        : "",
      cuisines: props.restaurant.cuisines ? props.restaurant.cuisines : [""],
      whens: props.restaurant.whens ? props.restaurant.whens : [""],
    },
  });

  const onSubmit = async (values: formRestaurant) => {
    const payload: IRestaurant = {
      ...props.restaurant,
      restaurantName: values.restaurantName,
      address: values.address,
      cuisines: values.cuisines,
      whens: values.whens,
    };

    const restaurant = await updateRestaurant(payload);
    if (pathname.includes("/vinyl/")) {
      successToast(restaurant.restaurantName);
      setChangesMade(true);
    } else {
      router.push(`/restaurant/${restaurant._id}`);
    }
  };

  const handleArchive = async () => {
    await archiveRestaurant(props.restaurant._id);
    archiveToast(props.restaurant.restaurantName);
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`;
      window.location.href = `${url}/restaurants`;
    }, 1000);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <BackButton
          record={props.restaurant}
          changesMade={changesMade}
          page="restaurants"
        />
        <Button
          className={`bg-red-600 text-light-1 ${
            props.restaurant._id === "" ? "hidden" : ""
          }`}
          onClick={handleArchive}
          aria-label="archive"
        >
          <IconArchive className="dark:text-light-1 text-dark-1" />
        </Button>
      </div>
      <form
        onSubmit={form.onSubmit((values) => onSubmit(values))}
        className={`flex flex-col justify-start gap-10 pt-4 ${
          props.restaurant._id === "" ? "px-6" : ""
        }`}
      >
        <TextInput
          label="Name"
          radius="md"
          placeholder="The good yum yum place"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps("restaurantName")}
        />
        <MultiSelect
          multiple={true}
          radius="md"
          size="md"
          clearable
          transitionProps={{ transition: "pop-bottom-left", duration: 200 }}
          label="Cuisine"
          placeholder="Pick some"
          data={cuisineOptions}
          {...form.getInputProps("cuisines")}
        />
        <MultiSelect
          multiple={true}
          radius="md"
          size="md"
          clearable
          transitionProps={{ transition: "pop-bottom-left", duration: 200 }}
          label="When"
          placeholder="Pick some"
          data={whenOptions}
          {...form.getInputProps("whens")}
        />
        <TextInput
          label="Address"
          radius="md"
          placeholder="Where it at?"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps("address")}
        />
        <Map longLat={props.longLat} title={props.restaurant.restaurantName} />
        <Button
          radius="md"
          className="bg-primary-500 text-light-1"
          type="submit"
        >
          {props.restaurant._id === "" ? "Add" : "Update"} Restaurant
        </Button>
      </form>
    </div>
  );
}
