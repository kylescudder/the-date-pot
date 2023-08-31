"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

export default function NavOptions(props: { position: string; pots: Pot[] }) {
  const pathname = usePathname();
  props.pots.forEach((element) => {
    element.componentName = `Icon${
      element.icon.charAt(0).toUpperCase() + element.icon.slice(1)
    }`;
  });
  return (
    <div className="contents w-full">
      <Link
        href="/"
        className={`${props.position}_link 
        ${pathname === "/" && "bg-primary-500"}`}
      >
        <Icon name={"IconHome"} stroke="1" strokeLinejoin="miter" />
        {props.position === "leftsidebar" ? (
          <p className="text-light-1 max-lg:hidden flex relative">Home</p>
        ) : (
          <p className="text-subtle-medium text-light-1 max-sm:hidden">
            {"Home".split(/\s+/)[0]}
          </p>
        )}
      </Link>
      {props.pots.map((pot) => {
        const isActive =
          (pathname.includes(pot.potName.toLowerCase()) &&
            pot.potName.toLowerCase().length > 1) ||
          pathname === pot.potName.toLowerCase();

        return (
          <Link
            href={`/${pot.potName.toLowerCase()}`}
            key={pot._id}
            className={`${props.position}_link 
					${isActive && "bg-primary-500"}`}
          >
            {/*<i className={`ti ti-${pot.icon}`}></i>*/}
            <Icon name={pot.componentName} stroke="1" strokeLinejoin="miter" />
            {props.position === "leftsidebar" ? (
              <p className="text-light-1 max-lg:hidden flex relative">
                {pot.potName}
              </p>
            ) : (
              <p className="text-subtle-medium text-light-1 max-sm:hidden">
                {pot.potName.split(/\s+/)[0]}
              </p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
