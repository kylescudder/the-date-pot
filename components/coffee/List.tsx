"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Tabulator, { TabulatorFull , RowComponent, CellComponent } from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_midnight.min.css";
import { Button } from "../ui/button";
import { IconFilePlus, IconSearch } from "@tabler/icons-react";
import FullScreenModal from "../shared/FullScreenModal";
import { ICoffee } from "@/lib/models/coffee";
import AddCoffee from "./AddCoffee";

export default function CoffeeList(props: { coffees: ICoffee[] }) {
  const [searchValue, setSearchValue] = useState("");
  const [filteredCoffees, setFilteredCoffees] = useState(props.coffees);
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
      const filtered = props.coffees.filter(
        (coffee) =>
          coffee.coffeeName.toLowerCase().includes(lowercaseSearchValue)
      );
      setFilteredCoffees(filtered);
    } else {
      setFilteredCoffees(props.coffees);
    }
  }, [searchValue, props.coffees]);

  useEffect(() => {
    const tabulatorOptions: Tabulator.Options = {
      responsiveLayout: "hide",
      placeholder: "No coffees...",
      rowHeight: 40,
      columns: [
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
        },
        {
          title: "Rating",
          field: "avgRating",
          //vertAlign: "middle",
          //resizable: false,
          //responsive: 0,
          formatter: "star",
          //cellClick: function (e: UIEvent, cell: CellComponent) {
          //  const row: RowComponent = cell.getRow();
          //  const data = row.getData();
          //  router.push(`coffee/${data._id}`);
          //},
        }
      ],
      rowFormatter: function (row: RowComponent) {
        var data = row.getData();
        //row.getElement().style.backgroundColor = "#FDFD96";
        //row.getElement().style.color = "white";
      },
      data: filteredCoffees,
      layout: "fitColumns",
    };
    const tabulatorInstance = new TabulatorFull(
      "#tabulator-placeholder",
      tabulatorOptions
    );
  }, [filteredCoffees]);

  const pullData = (data: boolean) => {
    setOpen(data);
  };

  const focusRef = useRef<HTMLInputElement>(null);
  const newCoffee = {
    _id: "",
    coffeeName: "",
    avgExperience: 0,
    avgTaste: 0,
    avgRating: 0,
    userGroupID: "",
    addedByID: "",
    archive: false,
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
            placeholder="Search by name or experience"
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
      <FullScreenModal open={open} func={pullData} form={<AddCoffee coffee={newCoffee} />} title="Add Coffee" />
      <div id="tabulator-placeholder"></div>
    </div>
  );
}
