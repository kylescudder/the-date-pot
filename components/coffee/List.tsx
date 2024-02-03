"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ICoffee } from "@/lib/models/coffee";
import AddCoffee from "./AddCoffee";
import Loading from "../shared/Loading";
import List from "../shared/List";
import { ICoffeeRating } from "@/lib/models/coffee-rating";
import { IUser } from "@/lib/models/user";
import { Rating } from "@mantine/core";
import { ICellRendererParams } from "ag-grid-community";

export default function CoffeeList(props: {
  coffees: ICoffee[],
  users: IUser[],
  longLat: number[]
}) {
  const [loading, setLoading] = React.useState(false);

  const ratings: ICoffeeRating[] = []

  const newCoffee = {
    _id: "",
    coffeeName: "",
    avgExperience: 0,
    avgTaste: 0,
    avgRating: 0,
    userGroupID: "",
    addedByID: "",
    archive: false,
    address: "",
  };
  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.coffees}
      potName="Coffee"
      rowFormatter={null}
      columns={[
        {
          headerName: "Name",
          field: "coffeeName",
          resizable: false,
          cellClass: "justify-center",
          minWidth: 200,
        },
        {
          headerName: "Rating",
          field: "avgRating",
          resizable: false,
          cellClass: "justify-center",
          cellRenderer: ((params: ICellRendererParams) => {
            return (
              <Rating
                name="average"
                fractions={2}
                size="lg"
                readOnly
                value={params.value}
              />
            )
          }),
          minWidth: 150,
        },
        {
          headerName: "Experience",
          field: "avgExperience",
          resizable: false,
          cellClass: "justify-center",
          cellRenderer: ((params: ICellRendererParams) => {
            return (
              <Rating
                name="experience"
                fractions={2}
                size="lg"
                readOnly
                value={params.value}
              />
            )
          }),
          minWidth: 150,
        },
        {
          headerName: "Taste",
          field: "avgTaste",
          resizable: false,
          cellClass: "justify-center",
          cellRenderer: ((params: ICellRendererParams) => {
            return (
              <Rating
                name="taste"
                fractions={2}
                size="lg"
                readOnly
                value={params.value}
              />
            )
          }),
          minWidth: 150,
        },
      ]}
      filterColumns={["coffeeName"]}
      addRecordComp={<AddCoffee coffee={newCoffee} ratings={ratings} users={props.users} longLat={props.longLat} />}
    />
  );
}
