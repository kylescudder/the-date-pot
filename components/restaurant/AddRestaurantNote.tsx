"use client";

import { Button, Textarea } from "@mantine/core";
import { IRestaurant } from "@/lib/models/restaurant";
import { ChangeEvent, useState } from "react";
import { addRestaurantNote } from "@/lib/actions/restaurant.action";

export default function AddRestaurantNote(props: {
  restaurant: IRestaurant;
  restaurantNote: string;
  func: (data: boolean) => void;
  addNote: (data: string) => void;
}) {
  const [note, setNote] = useState<string>('')
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNote(e.target.value)
  }
  const handleSubmit = async () => {
    await addRestaurantNote(note, props.restaurant._id)
    props.func(false);
    props.addNote(note)
  }
  return (
    <div>
      <Textarea
        minRows={8}
        radius="md"
        size="md"
        label="Note"
        placeholder="Penny for your thoughts?"
        onChange={handleChange}
      />
      <Button radius="md" className="bg-primary-500 text-light-1 mt-3" type="button" onClick={handleSubmit}>
        {props.restaurant._id === "" ? "Add" : "Update"} Note
      </Button>
    </div>
  );
}
