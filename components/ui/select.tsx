import Select, {
  ActionMeta,
  SingleValue,
  OptionProps,
  MultiValue,
} from "react-select";
import Icon from "../shared/Icon";
import IOption from "@/lib/models/options";
import { ICategory } from "@/lib/models/category";
import { useTheme } from "next-themes";

export const SelectElem = (props: {
  options: IOption[];
  func: (selectedOption: ICategory) => void;
}) => {
  const handleSelectChange = (
    selectedOption: SingleValue<IOption> | MultiValue<IOption>,
    _actionMeta: ActionMeta<IOption>
  ) => {
    if (selectedOption != null) {
      let newCat: ICategory | undefined;
      if (Array.isArray(selectedOption)) {
        // Handle multiple selected options if necessary
        // For now, I'll assume you're only interested in the first selected option
        const firstOption = selectedOption[0];

        if ("_id" in firstOption) {
          newCat = {
            _id: firstOption._id,
            text: firstOption.text,
            icon: firstOption.icon,
            todoCount: 0,
            userId: "",
          };
        }
      } else {
        if ("_id" in selectedOption) {
          newCat = {
            _id: selectedOption._id,
            text: selectedOption.text,
            icon: selectedOption.icon,
            todoCount: 0,
            userId: "",
          };
        }
      }

      if (newCat) {
        props.func(newCat);
      }
    }
  };

  const { theme, setTheme } = useTheme();
  const darkMode = theme === "light" ? false : true;

  const CustomOption = (props: OptionProps<IOption>) => (
    <div
      className={`text-dark-2 dark:text-white py-2 cursor-pointer ${
        darkMode ? "border-gray-600" : "border-gray-300"
      }`}
      style={{ display: "flex", alignItems: "center" }}
      {...props.innerProps}
    >
      <Icon
        name={props.data.icon}
        stroke="1"
        strokeLinejoin="miter"
        isActive={false}
      />
      <span style={{ marginLeft: 5 }}>{props.data.text}</span>
    </div>
  );

  return (
    <Select
      required={true}
      className={`text-dark-2 dark:text-white ${
        darkMode ? "border-gray-600" : "border-gray-300"
      }`}
      classNamePrefix="react-select"
      theme={(theme) => ({
        ...theme,
        borderRadius: 6,
        colors: {
          ...theme.colors,
          primary25: darkMode ? "#505966" : "border-gray-300",
          primary: darkMode ? "#877EFF" : "border-gray-300",
          neutral0: darkMode ? "#121417" : "border-gray-300",
        },
      })}
      placeholder="Select Option"
      options={props.options}
      components={{ Option: CustomOption }}
      onChange={handleSelectChange}
      isSearchable={false}
    />
  );
};

export default SelectElem;
