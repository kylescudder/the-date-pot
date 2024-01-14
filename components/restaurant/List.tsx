"use client";

import { IRestaurant } from "@/lib/models/restaurant";
import React from "react";
import AddRestaurant from "./AddRestaurant";
import Loading from "../shared/Loading";
import List from "../shared/List";
import { ICuisine } from "@/lib/models/cuisine";
import { IWhen } from "@/lib/models/when";

export default function RestaurantList(props: {
  restaurants: IRestaurant[];
  cuisineList: ICuisine[];
  whenList: IWhen[];
  longLat: number[];

}) {
  const [loading, setLoading] = React.useState(false);

  const newRestaurant: IRestaurant = {
    _id: "",
    restaurantName: "",
    address: "",
    archive: false,
    userGroupID: "",
    cuisines: [],
    whens: [],
    notes: []
  };

  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.restaurants}
      potName="Restaurant"
      rowFormatter={null}
      columns={[
        {
          headerName: "Name",
          field: "restaurantName",
          resizable: false,
          minWidth: 200,
        },
        {
          headerName: "Address",
          field: "address",
          resizable: false,
          minWidth: 200,
        },
      ]}
      filterColumns={["restaurantName", "address"]}
      addRecordComp={
        <AddRestaurant
          restaurant={newRestaurant}
          longLat={props.longLat}
          cuisineList={props.cuisineList}
          whenList={props.whenList}
        />
      }
    />
  );
}
