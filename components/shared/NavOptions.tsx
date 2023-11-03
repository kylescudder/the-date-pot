"use client";

import React from "react";
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
        ${pathname === "/" && "bg-primary-500 hover:bg-primary-hover"}`}
      >
        <Icon name={"IconHome"} stroke="2" strokeLinejoin="miter" isActive={false} />
        <p className="text-dark-1 dark:text-light-1 flex relative font-black">
          Home
        </p>
      </a>
      {props.pots.map((pot) => {
        const potNameDepluralised = pot.potName.endsWith("s")
          ? pot.potName.substring(0, pot.potName.length - 1).toLowerCase()
          : pot.potName.toLowerCase();

        let potNamePluralised = "";
        if (pot.potName.endsWith("y")) {
          // Pluralisation of names that end in y
          potNamePluralised = `${pot.potName.substring(
            0,
            pot.potName.length - 1
          )}ies`.toLowerCase();
        } else if (!pot.potName.endsWith("s")) {
          // Pluralisation of names that don't end in s
          potNamePluralised = `${pot.potName}s`.toLowerCase();
        } else {
          potNamePluralised = pot.potName.toLowerCase();
        }

        const isActive =
          (pathname.includes(potNameDepluralised) &&
            potNameDepluralised.length > 1) ||
          pathname === potNameDepluralised;

        return (
          <a
            href={`/${potNamePluralised}`}
            key={pot._id}
            className={`${props.position}_link 
					${isActive && "bg-primary-500 hover:bg-primary-hover"}`}
          >
            <Icon name={pot.icon} stroke="2" strokeLinejoin="miter" isActive={isActive} />
            <p className={`${isActive && "text-light-1"} text-dark-1 dark:text-light-1 flex relative font-black`}>
              {pot.potName}
            </p>
          </a>
        );
      })}
    </div>
  );
}
