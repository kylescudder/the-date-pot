import React from "react";
import { IconRefresh } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

const ReloadMapPlaceholder = () => {
	const router = useRouter();

	const handleClick = () => {
		router.refresh();
	}
  return (
    <div className="flex flex-col items-center justify-center w-full h-400 bg-gray-300 rounded-md border border-gray-400 cursor-pointer">
      <IconRefresh className="text-gray-600 text-2xl" />
      <p onClick={handleClick} className="mt-2">To view the map, click here</p>
    </div>
  );
};

export default ReloadMapPlaceholder;
