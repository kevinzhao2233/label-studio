import { observer } from "mobx-react";
import { FaCaretDown } from "react-icons/fa";
import { Icon } from "../Common/Icon/Icon";
import { Select } from "@humansignal/ui";
import { Tag } from "../Common/Tag/Tag";
import { useMemo } from "react";

export const FilterDropdown = observer(
  ({
    placeholder,
    defaultValue,
    items,
    style,
    disabled,
    onChange,
    multiple,
    value,
    optionRender,
    dropdownClassName,
    outputFormat,
  }) => {
    const parseItems = (item) => {
      return ({
        ...(item?.options ? {children: item?.options.map(parseItems)} : {}), 
        ...(item?.title ? {label: item?.title} : {}),
        ...item
      });
    };
    const options = useMemo(() => items.map(parseItems), [items, optionRender]);
    
    return (
      <Select
        multiple={multiple}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={(value) => onChange(outputFormat?.(value) ?? value)}
        disabled={disabled}
        options={options}
      />
    );
  },
);
