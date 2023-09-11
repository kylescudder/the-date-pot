"use client";

import { IVinyl } from "@/lib/models/vinyl";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Tabulator, {
  TabulatorFull,
  RowComponent,
  CellComponent,
} from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_midnight.min.css";
import AddVinyl from "./AddVinyl";
import { Button } from "../ui/button";
import { IconFilePlus, IconSearch } from "@tabler/icons-react";
import FullScreenModal from "../shared/FullScreenModal";

export default function VinylList(props: { vinyls: IVinyl[] }) {
  const [searchValue, setSearchValue] = useState("");
  const [filteredVinyls, setFilteredVinyls] = useState(props.vinyls);
  const [open, setOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleSearchClickOpen = () => {
    setSearchOpen(true);
    focusRef.current?.focus();
  };

  const router = useRouter();

  useEffect(() => {
    if (searchValue !== "") {
      const lowercaseSearchValue = searchValue.toLowerCase();
      const filtered = props.vinyls.filter(
        (vinyl) =>
          vinyl.artistName.toLowerCase().includes(lowercaseSearchValue) ||
          vinyl.name.toLowerCase().includes(lowercaseSearchValue)
      );
      setFilteredVinyls(filtered);
    } else {
      setFilteredVinyls(props.vinyls);
    }
  }, [searchValue, props.vinyls]);

  useEffect(() => {
    const tabulatorOptions: Tabulator.Options = {
      responsiveLayout: "hide",
      placeholder: "No vinyls...",
      rowHeight: 40,
      columns: [
        {
          title: "Name",
          field: "name",
          vertAlign: "middle",
          resizable: false,
          responsive: 0,
        },
        {
          title: "Artist",
          field: "artistName",
          hozAlign: "left",
          vertAlign: "middle",
          resizable: false,
          responsive: 1,
        },
      ],
      rowFormatter: function (row: RowComponent) {
        var data = row.getData();
        row.getElement().style.backgroundColor =
          data.purchased == true ? "#5865F2" : "#FDFD96";
        row.getElement().style.color =
          data.purchased == true ? "white" : "black";
      },
      data: filteredVinyls,
      layout: "fitColumns",
    };
    const tabulatorInstance = new TabulatorFull(
      "#tabulator-placeholder",
      tabulatorOptions
    );
    tabulatorInstance.on("rowClick", function (e: UIEvent, row: RowComponent) {
      setLoading(true);
      const data = row.getData();
      router.push(`vinyl/${data._id}`);
    });
  }, [filteredVinyls]);

  const pullData = (data: boolean) => {
    setOpen(data);
  };

  const focusRef = useRef<HTMLInputElement>(null);
  const newVinyl = {
    _id: "",
    name: "",
    artistName: "",
    purchased: false,
    archive: false,
    addedByID: "",
    userGroupID: "",
  } 
  return (
    <div>
      <div className="flex mb-4">
        <div
          className={`relative ${
            searchOpen ? "w-4/5" : "w-0 overflow-hidden"
          } ml-auto transition-all duration-300 ease-in-out`}
        >
          <input
            ref={focusRef}
            type="text"
            placeholder="Search by artist or name"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className={`${
              searchOpen ? "w-full" : "w-0"
            } px-4 py-2 rounded-full border outline-none focus:ring focus:ring-primary-500
            dark:text-light-2 text-dark-2`}
          />
        </div>
        <Button
          className={`${
            searchOpen ? "hidden" : "absolute right-6"
          } bg-primary-500 text-light-1`}
          onClick={handleSearchClickOpen}
        >
          <IconSearch width={24} height={24} strokeLinejoin="miter" />
        </Button>
        <Button
          className="bg-primary-500 text-light-1 absolute left-6"
          onClick={handleClickOpen}
        >
          <IconFilePlus width={24} height={24} strokeLinejoin="miter" />
        </Button>
      </div>
      <FullScreenModal open={open} func={pullData} form={<AddVinyl vinyl={newVinyl} />} title="Add Vinyl" />
      <div id="tabulator-placeholder"></div>
    </div>
  );
}
