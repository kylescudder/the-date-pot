"use client";

import { IRestaurant } from "@/lib/models/restaurant";
import React from "react";
import { useRouter } from "next/navigation";
import {
  RowComponent,
} from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_midnight.min.css";
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

  const formatter = (row: RowComponent) => {
    //var data = row.getData();
    //row.getElement().style.backgroundColor =
    //  data.purchased == true ? "#5865F2" : "#FDFD96";
    //row.getElement().style.color = data.purchased == true ? "white" : "black";
  };

  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.restaurants}
      potName="Restaurant"
      rowFormatter={formatter}
      columns={[
        {
          title: "Name",
          field: "restaurantName",
          vertAlign: "middle",
          resizable: false,
          responsive: 0,
          minWidth: 200,
        },
        {
          title: "Address",
          field: "address",
          vertAlign: "middle",
          resizable: false,
          responsive: 1,
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
