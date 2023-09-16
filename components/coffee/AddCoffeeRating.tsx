"use client";

import { ICoffee } from "@/lib/models/coffee";
import { ICoffeeRating } from "@/lib/models/coffee-rating";
import { getNewCoffeeID, updateCoffeeRating } from "@/lib/actions/coffee.action";
import { IUser } from "@/lib/models/user";
import { Button, Rating, Select } from "@mantine/core";
import { useForm } from "@mantine/form";

export default function AddCoffeeRating(props: {
  coffee: ICoffee;
  coffeeRating: ICoffeeRating;
  users: IUser[];
  addRating: (data: ICoffeeRating) => void;
  func: (data: boolean) => void;
}) {
  type userOption = {
    value: string;
    label: string;
  };
  const options: userOption[] = props.users.map((user: IUser) => ({
    value: user._id,
    label: user.name,
  }));

  interface formRating {
    _id: string;
    coffeeID: string;
    experience: number;
    taste: number;
    userID: string;
    username: string;
  }

  const form = useForm({
    initialValues: {
      _id: props.coffeeRating._id ? props.coffeeRating._id : "",
      coffeeID: props.coffee._id ? props.coffee._id : "",
      experience: props.coffeeRating.experience
        ? props.coffeeRating.experience
        : 0,
      taste: props.coffeeRating.taste ? props.coffeeRating.taste : 0,
      userID: props.coffeeRating.userID ? props.coffeeRating.userID : "",
      username: props.coffeeRating.username ? props.coffeeRating.username : "",
    },
  });

  const onSubmit = async (values: formRating) => {
    const username = props.users.filter((user) => user._id === values.userID)[0].name;
    const payload: ICoffeeRating = {
      _id: values._id,
      coffeeID: props.coffee._id,
      experience: values.experience,
      taste: values.taste,
      userID: values.userID,
      username: username
    };
    if (payload.coffeeID !== '') {
      const rating = await updateCoffeeRating(payload);
      const ratingWithUsername: ICoffeeRating = {
        ...rating,
        username: username
      };
      props.addRating(ratingWithUsername);
    } else {
      props.addRating(payload);
    }
    props.func(false);
  };

  return (
    <form
      onSubmit={form.onSubmit((values) => onSubmit(values))}
      className={`flex flex-col justify-start gap-10 pt-4 ${
        props.coffee._id === "" ? "px-6" : ""
      }`}
    >
      <Select
        radius="md"
        size="lg"
        clearable
        transitionProps={{ transition: "pop-bottom-left", duration: 200 }}
        label="Your favorite framework/library"
        placeholder="Pick one"
        data={options}
        {...form.getInputProps("userID")}
      />
      <div className="text-base flex items-center pt-5">
        <span className="w-32 text-center inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
          Experience
        </span>
        <Rating
          name="experience"
          fractions={2}
          size="xl"
          {...form.getInputProps("experience")}
        />
      </div>
      <div className="text-base flex items-center pt-2">
        <span className="w-32 text-center inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">
          Taste
        </span>
        <Rating
          name="taste"
          fractions={2}
          size="xl"
          {...form.getInputProps("taste")}
        />
      </div>
      <Button radius="md" className="bg-primary-500 text-light-1" type="submit">
        {props.coffeeRating._id === "" ? "Add" : "Update"} Rating
      </Button>
    </form>
  );
}
