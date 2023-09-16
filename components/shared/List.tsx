"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Tabulator, {
  TabulatorFull,
  RowComponent,
  ColumnDefinition,
} from "tabulator-tables";
import "tabulator-tables/dist/css/tabulator_midnight.min.css";
import { IconFilePlus, IconSearch } from "@tabler/icons-react";
import FullScreenModal from "../shared/FullScreenModal";
import { Button } from "@mantine/core";

export default function List(props: {
  records: any[];
  potName: string;
  columns: ColumnDefinition[];
  filterColumns: string[];
  addRecordComp: React.ReactElement;
  rowFormatter: any;
}) {
  const [searchValue, setSearchValue] = useState("");
  const [filteredRecords, setFilteredRecords] = useState(props.records);
  const [open, setOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

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
      const filtered = props.records.filter((record) =>
        props.filterColumns.some((element) =>
          record[element].toLowerCase().includes(lowercaseSearchValue)
        )
      );
      setFilteredRecords(filtered);
    } else {
      setFilteredRecords(props.records);
    }
  }, [searchValue, props.records, props.filterColumns]);

  useEffect(() => {
    const tabulatorOptions: Tabulator.Options = {
      responsiveLayout: "hide",
      placeholder: `No ${props.potName}s...`,
      rowHeight: 40,
      columns: props.columns,
      rowFormatter: props.rowFormatter,
      data: filteredRecords,
      layout: "fitColumns",
      dataLoaderLoading: "Loading",
    };
    const tabulatorInstance = new TabulatorFull(
      "#tabulator-placeholder",
      tabulatorOptions
    );
    tabulatorInstance.on("rowClick", function (e: UIEvent, row: RowComponent) {
      setLoading(true);
      const data = row.getData();
      router.push(`${props.potName.toLowerCase()}/${data._id}`);
    });
  }, [filteredRecords]);

  const pullData = (data: boolean) => {
    setOpen(data);
  };

  const focusRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div className="flex mb-4">
        <div
          className={`relative ${
            searchOpen ? "w-4/5" : "w-0 overflow-hidden"
          } ml-auto transition-all duration-300 ease-in-out`}
        >
          {/*
           */}
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
          radius="md"
          className={`${
            searchOpen ? "hidden" : "absolute right-6"
          } bg-primary-500 text-light-1`}
          onClick={handleSearchClickOpen}
        >
          <IconSearch width={24} height={24} strokeLinejoin="miter" />
        </Button>
        <Button
          radius="md"
          className="bg-primary-500 text-light-1 absolute left-6"
          onClick={handleClickOpen}
        >
          <IconFilePlus width={24} height={24} strokeLinejoin="miter" />
        </Button>
      </div>
      <FullScreenModal
        open={open}
        func={pullData}
        form={props.addRecordComp}
        title={`Add ${props.potName}`}
      />
      <div id="tabulator-placeholder"></div>
    </div>
  );
}
