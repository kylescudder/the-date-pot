"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";
import { IPot } from "@/lib/models/pot";

export default function NavOptions(props: { position: string; pots: IPot[] }) {
  const pathname = usePathname();
  return (
    <div className="contents w-full">
      <a
        href="/"
        className={`${props.position}_link 
        ${pathname === "/" && "bg-primary-500"}`}
      >
        <Icon name={"IconHome"} stroke="1" strokeLinejoin="miter" />
        <p className="text-dark-1 dark:text-light-1 flex relative">
          Home
        </p>
      </a>
      {props.pots.map((pot) => {
        const isActive =
          (pathname.includes(pot.potName.toLowerCase()) &&
            pot.potName.toLowerCase().length > 1) ||
          pathname === pot.potName.toLowerCase();

        return (
          <a
            href={`/${pot.potName.toLowerCase()}`}
            key={pot._id}
            className={`${props.position}_link 
					${isActive && "bg-primary-500"}`}
          >
            {/*<i className={`ti ti-${pot.icon}`}></i>*/}
            <Icon name={pot.icon} stroke="1" strokeLinejoin="miter" />
            <p className="text-dark-1 dark:text-light-1 flex relative">
              {pot.potName}
            </p>
          </a>
        );
      })}
    </div>
  );
}
