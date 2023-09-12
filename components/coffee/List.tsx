"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { RowComponent, CellComponent } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_midnight.min.css";
import { ICoffee } from "@/lib/models/coffee";
import AddCoffee from "./AddCoffee";
import Loading from "../shared/Loading";
import List from "../shared/List";

export default function CoffeeList(props: { coffees: ICoffee[] }) {
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();

  const newCoffee = {
    _id: "",
    coffeeName: "",
    avgExperience: 0,
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
      records={props.coffees}
      potName="coffee"
      rowFormatter={null}
      columns={[
        {
          title: "Name",
          field: "coffeeName",
          vertAlign: "middle",
          resizable: false,
          responsive: 0,
          cellClick: function (e: UIEvent, cell: CellComponent) {
            const row: RowComponent = cell.getRow();
            const data = row.getData();
            router.push(`coffee/${data._id}`);
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
          title: "Experience",
          field: "avgExperience",
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
      filterColumns={["coffeeName"]}
      addRecordComp={<AddCoffee coffee={newCoffee} ratings={null} />}
    />
  );
}
