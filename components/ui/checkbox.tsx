import React from "react";

function Checkbox(props: {
	value: boolean;
	text: string;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="inline-flex items-center space-x-2">
      <input
        type="checkbox"
        checked={props.value}
        onChange={(e) => props.onChange(e.target.checked)}
        className="h-5 w-5 text-indigo-600 focus:ring-indigo-400 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
      />
      <span className="text-base-semibold text-dark-2 dark:text-light-2">
        {props.text}
      </span>
    </label>
  );
}

export default Checkbox;
