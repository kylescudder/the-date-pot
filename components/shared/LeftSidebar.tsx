"use client"

import NavOptions from "./NavOptions";
import Logout from "./Logout";
import { IPot } from "@/lib/models/pot";

export default function LeftSidebar(props: { pots: IPot[] }) {
  return (
    <section
      className="custom-scrollbar 
		leftsidebar"
    >
      <div
        className="flex 
			w-full flex-1
			flex-col gap-6 px-6"
      >
        <NavOptions position="leftsidebar" pots={props.pots} />
      </div>
      <div className="mt-10 px-6">
        <Logout placement="" />
      </div>
    </section>
  );
}
