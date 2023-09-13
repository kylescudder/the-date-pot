"use client";

import React, { useState } from "react";
import { Input } from "../ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { useForm } from "react-hook-form";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { archiveToast, successToast } from "@/lib/actions/toast.actions";
import { IconArrowNarrowLeft } from "@tabler/icons-react";
import { IconArchive } from "@tabler/icons-react";
import { ICoffee } from "@/lib/models/coffee";
import { archiveCoffee, updateCoffee } from "@/lib/actions/coffee.action";
import { ICoffeeRating } from "@/lib/models/coffee-rating";
import Rating from "@mui/material/Rating";
import BackButton from "../shared/BackButton";

export default function AddCoffee(props: {
  coffee: ICoffee;
  ratings: ICoffeeRating[] | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [changesMade, setChangesMade] = useState<boolean>(false);

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

  const form = useForm({
    defaultValues: {
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

  const onSubmit = async (values: formCoffee) => {
    const payload: ICoffee = {
      ...props.coffee,
      coffeeName: values.coffeeName,
    };

    const coffee = await updateCoffee(payload);
    if (pathname.includes("/coffee/")) {
      successToast(coffee.coffeeName);
      setChangesMade(true);
    } else {
      router.push(`/coffee/${coffee._id}`);
    }
  };

  const handleArchive = async () => {
    await archiveCoffee(props.coffee._id);
    archiveToast(props.coffee.coffeeName);
    setTimeout(() => {
      const url = `${window.location.protocol}//${window.location.host}`;
      window.location.href = `${url}/coffees`;
    }, 1000);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <BackButton record={props.coffee} changesMade={changesMade} />
        <Button
          className="bg-red-600 text-light-1"
          onClick={handleArchive}
          aria-label="archive"
        >
          <IconArchive
            className={`dark:text-light-1 text-dark-1 ${
              props.coffee._id === "" ? "hidden" : ""
            }`}
          />
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={`flex flex-col justify-start gap-10 pt-4 ${
            props.coffee._id === "" ? "px-6" : ""
          }`}
        >
          <FormField
            control={form.control}
            name="coffeeName"
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
          {
            props.ratings !== null ? (
              props.ratings.map((rating: ICoffeeRating) => {
                const [experience, setExperience] = useState<number>(
                  rating.experience
                );
                const [taste, setTaste] = useState<number>(rating.taste);
                return (
                  <div className="rounded-md overflow-hidden shadow-lg bg-dark-4 w-full">
                    <div className="px-6 py-4">
                      <div className="font-bold text-xl mb-2 text-dark-1 dark:text-light-1">
                        {rating.username}
                      </div>
                      <p className="text-base flex items-center">
                        {" "}
                        {/* Use flex to align vertically */}
                        <span className="w-32 text-center inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                          Experience
                        </span>
                        <Rating
                          name="experience"
                          value={experience}
                          precision={0.5}
                          size="large"
                          onChange={(
                            _event: React.ChangeEvent<{}>,
                            newValue: number | null
                          ) => {
                            console.log(newValue);
                            if (newValue !== null) {
                              setExperience(newValue!);
                            }
                          }}
                        />
                      </p>
                      <p className="text-base flex items-center pt-2">
                        {" "}
                        {/* Use flex to align vertically */}
                        <span className="w-32 text-center inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
                          Taste
                        </span>
                        <Rating
                          name="taste"
                          value={rating.taste}
                          precision={0.5}
                          size="large"
                          onChange={(
                            _event: React.ChangeEvent<{}>,
                            newValue: number | null
                          ) => {
                            if (newValue !== null) {
                              setTaste(newValue!);
                            }
                          }}
                        />
                      </p>
                    </div>
                    <div className="px-6 pt-4 pb-2"></div>
                  </div>
                );
              })
            ) : (
                <></>
            )
          }
          {/*<FormField
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
          />*/}
          <Button className="bg-primary-500 text-light-1" type="submit">
            {props.coffee._id === "" ? "Add" : "Update"} Coffee
          </Button>
        </form>
      </Form>
    </div>
  );
}
