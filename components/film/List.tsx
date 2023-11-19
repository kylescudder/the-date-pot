"use client";

import { IFilm } from "@/lib/models/film";
import React from "react";
import { useRouter } from "next/navigation";
import {
  RowComponent,
} from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_midnight.min.css";
import AddFilm from "./AddFilm";
import Loading from "../shared/Loading";
import List from "../shared/List";
import { IDirector } from "@/lib/models/director";
import { IPlatform } from "@/lib/models/platform";
import { IGenre } from "@/lib/models/genre";

export default function FilmList(props: {
  films: IFilm[];
  directorList: IDirector[];
  genreList: IGenre[];
  platformList: IPlatform[];

}) {
  const [loading, setLoading] = React.useState(false);

  const newFilm: IFilm = {
    _id: "",
    addedByID: "",
    addedDate: new Date,
    archive: false,
    filmName: "",
    releaseDate: new Date,
    runTime: 0,
    userGroupID: "",
    watched: false,
    directors: [],
    genres: [],
    platforms: []
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
      records={props.films}
      potName="Film"
      rowFormatter={formatter}
      columns={[
        {
          title: "Name",
          field: "filmName",
          vertAlign: "middle",
          resizable: false,
          responsive: 0,
          minWidth: 200,
        },
        {
          title: "Run time",
          field: "runTime",
          vertAlign: "middle",
          resizable: false,
          responsive: 1,
          minWidth: 200,
        },
        {
          title: "Directors",
          field: "directors",
          vertAlign: "middle",
          resizable: false,
          responsive: 2,
          minWidth: 200,
        },
        {
          title: "Genre",
          field: "genres",
          vertAlign: "middle",
          resizable: false,
          responsive: 3,
          minWidth: 200,
        },
        {
          title: "Platforms",
          field: "platforms",
          vertAlign: "middle",
          resizable: false,
          responsive: 4,
          minWidth: 200,
        },
      ]}
      filterColumns={["filmName", "directors"]}
      addRecordComp={
        <AddFilm
          film={newFilm}
          directorList={props.directorList}
          genreList={props.genreList}
          platformList={props.platformList}
        />
      }
    />
  );
}
