"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { RowComponent, CellComponent } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_midnight.min.css";
import { IBeer } from "@/lib/models/beer";
import AddBeer from "./AddBeer";
import Loading from "../shared/Loading";
import List from "../shared/List";
import { IBeerRating } from "@/lib/models/beer-rating";
import { IUser } from "@/lib/models/user";

export default function BeerList(props: {
  beers: IBeer[],
  users: IUser[]
}) {
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();
  const ratings: IBeerRating[] = []

  const newBeer = {
    _id: "",
    beerName: "",
    avgWankyness: 0,
    avgTaste: 0,
    avgRating: 0,
    userGroupID: "",
    addedByID: "",
    archive: false,
  };
  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.beers}
      potName="Beer"
      rowFormatter={null}
      columns={[
        {
          title: "Name",
          field: "beerName",
          vertAlign: "middle",
          resizable: false,
          responsive: 0,
          cellClick: function (e: UIEvent, cell: CellComponent) {
            const row: RowComponent = cell.getRow();
            const data = row.getData();
            router.push(`beer/${data._id}`);
          },
          minWidth: 250,
        },
        {
          title: "Rating",
          field: "avgRating",
          vertAlign: "middle",
          hozAlign: "center",
          resizable: false,
          responsive: 1,
          formatter: "star",
          minWidth: 100,
        },
        {
          title: "Wankyness",
          field: "avgWankyness",
          vertAlign: "middle",
          hozAlign: "center",
          resizable: false,
          responsive: 2,
          formatter: "star",
          minWidth: 100,
        },
        {
          title: "Taste",
          field: "avgTaste",
          vertAlign: "middle",
          hozAlign: "center",
          resizable: false,
          responsive: 3,
          formatter: "star",
          minWidth: 100,
        },
      ]}
      filterColumns={["beerName"]}
      addRecordComp={<AddBeer beer={newBeer} ratings={ratings} users={props.users} />}
    />
  );
}
