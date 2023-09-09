"use client"

import CustomThemeProvider from "@/components/shared/CustomThemeProvider";
import LeftSidebar from "./LeftSidebar";
import { IPot } from "@/lib/models/pot";

export const MainContent = (props: {
	pots: IPot[]
	children: React.ReactNode;
}) => {
	return (
		<CustomThemeProvider>
			<main className="flex flex-row">
				<LeftSidebar pots={props.pots} />
				<section className="main-container">
					<div className="w-full max-w-4xl">{props.children}</div>
				</section>
			</main>
		</CustomThemeProvider>
	);
};