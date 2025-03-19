import { observer } from "mobx-react";
import { useCallback, useMemo } from "react";
// import { Select } from "../../../common/Select/Select";
import { Select } from "@humansignal/ui";
import ColorScheme from "pleasejs";
import Utils from "../../../utils";
import styles from "./Paragraphs.module.scss";

const AuthorTag = ({ name, selected }) => {
  const itemStyle = { border: `2px solid ${Utils.Colors.convertToRGBA(ColorScheme.make_color({ seed: name })[0])}` };

  return (
    <span
      className={[styles.authorFilter__select__item, selected && styles.authorFilter__select__item_selected].join(" ")}
      style={itemStyle}
    >
      {name}
    </span>
  );
};

const renderMultipleSelected = (selected) => {
  if (selected.length === 0) return null;

  return (
    <div className={styles.authorFilter__select}>
      {selected.map((name) => (
        <AuthorTag key={name} name={name} />
      ))}
    </div>
  );
};

export const AuthorFilter = observer(({ item, onChange }) => {
  const placeholder = useMemo(() => <span className={styles.authorFilter__placeholder}>Show all authors</span>, []);
  const value = null;
  const options = useMemo(
    () => {
      const authorOptions = item._value.reduce((all, v) => (all.includes(v[item.namekey]) ? all : [...all, v[item.namekey]]), []).sort();
      authorOptions.unshift({value: false, label: "Show all authors"});
      return authorOptions;
    },
    [item._value, item.namekey],
  );
  console.log("options", options);
  const filteredOptions = item.searchAuthor
    ? options.filter((o) => o.toLowerCase().includes(item.searchAuthor.toLowerCase()))
    : options;
  const onFilterChange = useCallback(
    (next) => {
      const nextVal = next?.value ?? next;
      // ensure this is cleared if any action promoting an empty value change is made
      if (!nextVal || nextVal?.includes(null)) {
        item.setAuthorFilter([]);
      } else if (nextVal) {
        item.setAuthorFilter(nextVal);
      } 

      onChange?.();
    },
    [item.setAuthorFilter],
  );

  return (
    <div className={styles.authorFilter}>
      <Select
        placeholder={"Show all authors"}
        value={value}
        options={options}
        onChange={onFilterChange}
        // renderMultipleSelected={renderMultipleSelected}
        size="compact"
        // variant="rounded"
        // surface="emphasis"
        multiple={true}
        searchable={true}
      />
    </div>
  );
});
