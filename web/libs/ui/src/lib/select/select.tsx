import {
  createRef,
  type ForwardedRef,
  forwardRef,
  type MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Select as SelectComponent,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectGroup,
} from "@humansignal/shad/components/ui/select";
import type { SelectOption, SelectProps } from "./types.ts";
import { Label } from "@humansignal/ui";

export const Select = forwardRef(function <T, A extends SelectOption<T>[]>(
  { label, description, options = [], validate, required, skip, labelProps, defaultValue, searchable, searchPlaceholder, value: externalValue, disabled = false, ...props }: SelectProps<T, A>,
  ref: ForwardedRef<HTMLSelectElement>,
) {
  const internalRef = createRef<HTMLSelectElement>();
  const [query, setQuery] = useState<string>("");
  const [value, setValue] = useState<string>(defaultValue?.value ?? defaultValue ?? externalValue?.value ?? externalValue);
  const _onChange= useCallback((val: string) => {
    if (disabled) return;
    setValue(val);
    props?.onChange?.(val);
  }, [props?.onChange, disabled]);
  const _options = useMemo(() => {
    
    if (!searchable || !query.trim()) return options;

    return options.filter((option: any) => {;

      const label = option?.label ?? option?.value ?? option;

      return label?.toString()?.toLowerCase().includes(query.toLowerCase());
    });
  }, [options, searchable, query]);
  return (
    <SelectComponent value={value} onValueChange={_onChange} {...props}>
      {label && <Label {...labelProps}>{label}</Label>}
      <SelectTrigger disabled={disabled} {...(props?.triggerProps ?? {})}>
        <SelectValue placeholder={props?.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {searchable && (
          <div className="search">
            <input
              className="border border-gray-300 text-gray-900 text-md rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2"
              type="text"
              placeholder={searchPlaceholder ?? "Search"}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}
        {_options.map((option, index) => {
          const value = option?.value ?? option;
          const label = option?.label ?? value;
          if (option?.children) {
            return (
              <SelectGroup key={index}>
                <SelectLabel>{label}</SelectLabel>
                {option.children.map((item, i) => (
                  <SelectItem key={i} value={item?.value ?? item}>
                    {item?.label ?? item?.value ?? item}
                  </SelectItem>
                ))}
              </SelectGroup>
            );
          }

          return (
            <SelectItem key={index} value={value} {...(option?.disabled ? { 'data-disabled': true } : {})}>
              {label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </SelectComponent>
  );
});

Select.displayName = "Select";
