"use client";

import { IActivity } from "@/lib/models/activity";
import React from "react";
import {
  RowComponent,
} from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_midnight.min.css";
import AddActivity from "./AddActivity";
import Loading from "../shared/Loading";
import List from "../shared/List";
import { ICuisine } from "@/lib/models/cuisine";
import { IWhen } from "@/lib/models/when";
import { IExpense } from "@/lib/models/expense";

export default function ActivityList(props: {
  activities: IActivity[];
  expenseList: IExpense[];
  longLat: number[];

}) {
  const [loading, setLoading] = React.useState(false);

  const newActivity: IActivity = {
    _id: "",
    activityName: "",
    address: "",
    archive: false,
    userGroupID: "",
    expense: ""
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
      records={props.activities}
      potName="Activity"
      rowFormatter={formatter}
      columns={[
        {
          title: "Name",
          field: "activityName",
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
      filterColumns={["activityName", "address"]}
      addRecordComp={
        <AddActivity
          activity={newActivity}
          longLat={props.longLat}
          expenseList={props.expenseList}
        />
      }
    />
  );
}
