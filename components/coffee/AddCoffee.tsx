"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  archiveToast,
  deleteToast,
  successToast,
} from "@/lib/actions/toast.actions";
import {
  IconArchive,
  IconCircleXFilled,
  IconCirclePlus,
} from "@tabler/icons-react";
import { ICoffee } from "@/lib/models/coffee";
import {
  archiveCoffee,
  deleteCoffeeRating,
  updateCoffee,
  updateCoffeeRating,
} from "@/lib/actions/coffee.action";
import { ICoffeeRating } from "@/lib/models/coffee-rating";
import { useForm } from "@mantine/form";
import { Button, Rating, TextInput } from "@mantine/core";
import BackButton from "../shared/BackButton";
import { IUser } from "@/lib/models/user";
import FormModal from "../shared/FormModal";
import AddCoffeeRating from "./AddCoffeeRating";
import FullScreenModal from "../shared/FullScreenModal";

export default function AddCoffee(props: {
  coffee: ICoffee;
  ratings: ICoffeeRating[];
  users: IUser[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [changesMade, setChangesMade] = useState<boolean>(false);
  const [coffeeRatings, setCoffeeRatings] = useState<ICoffeeRating[]>(
    props.ratings
  );
  const [itemVisibility, setItemVisibility] = useState<boolean[]>(
    props.ratings.map(() => true)
  );
  const [open, setOpen] = useState<boolean>(false);

  interface formCoffee {
    _id: string;
    archive: boolean;
    coffeeName: string;
    addedByID: string;
    userGroupID: string;
    avgExperience: number;
    avgTaste: number;
    avgRating: number;
  }

  const coffeeRating: ICoffeeRating = {
    _id: "",
    coffeeID: "",
    experience: 0,
    taste: 0,
    userID: "",
    username: "",
  };

  const form = useForm({
    initialValues: {
      _id: props.coffee._id ? props.coffee._id : "",
      archive: props.coffee.archive ? props.coffee.archive : false,
      coffeeName: props.coffee.coffeeName ? props.coffee.coffeeName : "",
      addedByID: props.coffee.addedByID ? props.coffee.addedByID : "",
      userGroupID: props.coffee.userGroupID ? props.coffee.userGroupID : "",
      avgExperience: 0,
      avgTaste: 0,
      avgRating: 0,
    },
  });

  const handleRemoveRecord = async (id: string, index: number) => {
    const updatedArray = await coffeeRatings.filter(
      (item, i) => item.userID !== id
    );
    setCoffeeRatings(updatedArray);
    if (id !== "") {
      await deleteCoffeeRating(id);
    }
    const rating = await coffeeRatings.filter((item) => item.userID === id);
    deleteToast(`${rating[0].username}'s rating`);
  };

  const onSubmit = async (values: formCoffee) => {
    const payload: ICoffee = {
      ...props.coffee,
      coffeeName: values.coffeeName,
    };

    const coffee = await updateCoffee(payload);
    coffeeRatings.map(async (rating: ICoffeeRating) => {
      const updatedRating = {
        ...rating,
        coffeeID: coffee._id,
      };
      await updateCoffeeRating(updatedRating);
    });
    if (pathname.includes("/coffee/")) {
      successToast(coffee.coffeeName);
      setChangesMade(true);
    } else {
      router.push(`/coffee/${coffee._id}`);
    }
  };

  const pullData = (data: boolean) => {
    setOpen(data);
  };

  const pullRating = async (data: ICoffeeRating) => {
    const newCatList = [...coffeeRatings, data];
    setCoffeeRatings(newCatList);
  };

  const handleArchive = async () => {
    await archiveCoffee(props.coffee._id);
    archiveToast(props.coffee.coffeeName);
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`;
      window.location.href = `${url}/coffees`;
    }, 1000);
  };

  const handleExperienceChange = (experience: number, i: number) => {
    // Make a copy of the current coffeeRatings array
    const updatedCoffeeRatings = [...coffeeRatings];

    // Update the experience property of the rating at index i
    updatedCoffeeRatings[i].experience = experience;

    // Set the updated coffeeRatings array back to state
    setCoffeeRatings(updatedCoffeeRatings);
  };

  const handleTasteChange = (taste: number, i: number) => {
    // Make a copy of the current coffeeRatings array
    const updatedCoffeeRatings = [...coffeeRatings];

    // Update the taste property of the rating at index i
    updatedCoffeeRatings[i].taste = taste;

    // Set the updated coffeeRatings array back to state
    setCoffeeRatings(updatedCoffeeRatings);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <BackButton
          record={props.coffee}
          changesMade={changesMade}
          page="coffees"
        />
        <Button
          radius="md"
          className={`bg-red-600 text-light-1 ${
            props.coffee._id === "" ? "hidden" : ""
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
          props.coffee._id === "" ? "px-6" : ""
        }`}
      >
        <TextInput
          label="Name"
          radius="md"
          placeholder="The best coffee shop in the world"
          className="text-dark-2 dark:text-light-2"
          size="md"
          {...form.getInputProps("coffeeName")}
        />
        <div className="flex justify-between">
          <div className="flex-grow pr-2">
            <p className="text-dark-1 dark:text-light-1 pt-3 text-3xl font-black">
              Ratings
            </p>
          </div>
          <div className="mt-auto">
            <Button
              radius="md"
              className="bg-green-600 text-light-1 r-0"
              onClick={() => setOpen(true)}
              aria-label="add"
              size="md"
            >
              <IconCirclePlus className="dark:text-light-1 text-dark-1" />
            </Button>
          </div>
        </div>
        {coffeeRatings.length !== 0 ? (
          coffeeRatings.map((rating: ICoffeeRating, i: number) => {
            console.log("rating: ", rating);
            return (
              <div
                key={rating.userID}
                className="rounded-md overflow-hidden shadow-lg bg-gray-400 dark:bg-dark-4 w-full"
              >
                <div className="px-6 py-4">
                  <div className="font-black w-1/2 contents text-xl mb-2 text-dark-1 dark:text-light-1">
                    {rating.username}
                  </div>
                  <div className="w-1/2 contents">
                    <IconCircleXFilled
                      onClick={() => handleRemoveRecord(rating.userID, i)}
                      className="text-red-600 float-right"
                    />
                  </div>
                  <div className="text-base flex items-center pt-2">
                    <span className="w-32 text-center inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-black text-gray-700 mr-2">
                      Taste
                    </span>
                    <Rating
                      name="taste"
                      value={rating.taste}
                      onChange={(value) => handleTasteChange(value, i)}
                      fractions={2}
                      size="xl"
                    />
                  </div>
                  <div className="text-base flex items-center pt-5">
                    <span className="w-32 text-center inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-black text-gray-700 mr-2">
                      Experience
                    </span>
                    <Rating
                      name="experience"
                      value={rating.experience}
                      onChange={(value) => handleExperienceChange(value, i)}
                      fractions={2}
                      size="xl"
                    />
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-md overflow-hidden shadow-lg bg-gray-400 dark:bg-dark-4 w-full">
            <div className="px-6 py-4">
              <div className="font-bold w-1/2 contents text-xl mb-2 text-dark-1 dark:text-light-1">
                Please add a rating!
              </div>
            </div>
          </div>
        )}
        <Button
          radius="md"
          className="bg-primary-500 text-light-1"
          type="submit"
        >
          {props.coffee._id === "" ? "Add" : "Update"} Coffee
        </Button>
      </form>
      <FullScreenModal
        open={open}
        func={pullData}
        form={
          <AddCoffeeRating
            coffee={props.coffee}
            coffeeRating={coffeeRating}
            func={pullData}
            addRating={pullRating}
            users={props.users}
          />
        }
        title="Add Rating"
      />
    </div>
  );
}
