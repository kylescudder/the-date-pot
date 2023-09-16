"use client";

import { IVinyl } from "@/lib/models/vinyl";
import React from "react";
import { useRouter } from "next/navigation";
import {
  CellComponent,
  FormatterParams,
  EmptyCallback,
  RowComponent,
} from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_midnight.min.css";
import AddVinyl from "./AddVinyl";
import Loading from "../shared/Loading";
import List from "../shared/List";

export default function VinylList(props: { vinyls: IVinyl[] }) {
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();

  const newVinyl = {
    _id: "",
    name: "",
    artistName: "",
    purchased: false,
    archive: false,
    addedByID: "",
    userGroupID: "",
  };

  const formatter = (row: RowComponent) => {
    var data = row.getData();
    row.getElement().style.backgroundColor =
      data.purchased == true ? "#5865F2" : "#FDFD96";
    row.getElement().style.color = data.purchased == true ? "white" : "black";
  };

  return loading ? (
    <Loading />
  ) : (
    <List
      records={props.vinyls}
      potName="Vinyl"
      rowFormatter={formatter}
      columns={[
        {
          title: "Name",
          field: "name",
          vertAlign: "middle",
          resizable: false,
          responsive: 0,
          minWidth: 200,
        },
        {
          title: "Artist",
          field: "artistName",
          hozAlign: "left",
          vertAlign: "middle",
          resizable: false,
          responsive: 1,
          minWidth: 200,
        },
        {
          title: "Purchased",
          field: "purchased",
          hozAlign: "left",
          vertAlign: "middle",
          resizable: false,
          responsive: 2,
          minWidth: 200,
          formatter: function (
            cell: CellComponent,
            _formatterParams: FormatterParams,
            _onRendered: EmptyCallback
          ) {
            return cell.getValue() === true ? "Yes" : "No";
          },
        },
      ]}
      filterColumns={["name", "artistName"]}
      addRecordComp={<AddVinyl vinyl={newVinyl} />}
    />
  );
}
