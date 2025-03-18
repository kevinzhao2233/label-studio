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
// import {
//   Select as SelectComponent,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectLabel,
//   SelectItem,
//   SelectGroup,
// } from "@humansignal/shad/components/ui/select";
import type { SelectOption, SelectProps } from "./types.ts";
import { Checkbox, Label } from "@humansignal/ui";
import { IconChevronDown, IconCheck } from "@humansignal/icons";
// import { Button } from "@humansignal/shad/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@humansignal/shad/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@humansignal/shad/components/ui/command";
import clsx from "clsx";

export const Select = forwardRef(function <T, A extends SelectOption<T>[]>(
  { label, description, options = [], validate, required, skip, labelProps, defaultValue, searchable, searchPlaceholder, value: externalValue, disabled = false, multiple = false, ...props }: SelectProps<T, A>,
  ref: ForwardedRef<HTMLSelectElement>,
) {
  const [query, setQuery] = useState<string>("");
  let initialValue = defaultValue?.value ?? defaultValue ?? externalValue?.value ?? externalValue;
  if(multiple) {
    initialValue = initialValue ?? [];
  } else if (Array.isArray(initialValue)) {
    initialValue = initialValue[0];
  }
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(initialValue ?? "");
  useEffect(() => {
    let val = externalValue?.value ?? externalValue;
    if (multiple && !Array.isArray(val)) {
      val = [val];
    } else if (!multiple && Array.isArray(val)) {
      val = val[0];
    }
    setValue(val);
  }, [externalValue, multiple]);
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
  
  if (multiple) {
    console.log("multiple not supported yet");
  }
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[200px] justify-between"
        >
          {value
            ? options.find((option) => (option.value ?? option) === value)?.label
            : (props?.placeholder ?? "")}
          <IconChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          {searchable && <CommandInput placeholder={searchPlaceholder ?? "Search"} />}
          <CommandList>
            <CommandEmpty>{searchable ? "No results found." : ""}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const optionValue = option?.value ?? option;
                const label = option?.label ?? optionValue;
                return (
                  <CommandItem
                    key={optionValue}
                    value={optionValue}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue)
                      setIsOpen(false)
                    }}
                  >
                    {multiple ? (
                      <Checkbox
                        className={clsx(
                          "mr-2 h-4 w-4",
                          value === optionValue ? "opacity-100" : "opacity-0"
                        )}
                        checked={value === optionValue}
                      />
                    ) : (value === optionValue ? <IconCheck className="mr-2 h-4 w-4" /> : null)}
                    {label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
  // return (
  //   <SelectComponent value={value} onValueChange={_onChange} disabled={disabled} {...props}>
  //     {label && <Label {...labelProps}>{label}</Label>}
  //     <SelectTrigger disabled={disabled} {...(props?.triggerProps ?? {})}>
  //       <SelectValue placeholder={props?.placeholder} />
  //     </SelectTrigger>
  //     <SelectContent>
  //       {searchable && (
  //         <div className="search">
  //           <input
  //             className="border border-gray-300 text-gray-900 text-md rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full px-3 py-2"
  //             type="text"
  //             placeholder={searchPlaceholder ?? "Search"}
  //             value={query}
  //             onChange={(e) => setQuery(e.target.value)}
  //           />
  //         </div>
  //       )}
  //       {_options.map((option, index) => {
  //         const value = option?.value ?? option;
  //         const label = option?.label ?? value;
  //         const children = option?.children;

  //         if (children) {
  //           return (
  //             <SelectGroup key={index}>
  //               <SelectLabel>{label}</SelectLabel>
  //               {children.map((item, i) => {
  //                 const val = item?.value ?? item;
  //                 const lab = item?.label ?? val;
  //                 return (
  //                   <SelectItem key={`${lab}_${i}`} value={val} {...(item?.disabled ? { 'data-disabled': true } : {})} {...(item?.style ? { style: item.style } : {})}>
  //                     {lab}
  //                   </SelectItem>
  //                 );
  //               })}
  //             </SelectGroup>
  //           );
  //         }

  //         return (
  //           <SelectItem key={index} value={value} {...(option?.disabled ? { 'data-disabled': true } : {})} {...(option?.style ? { style: option.style } : {})}>
  //             {label}
  //           </SelectItem>
  //         );
  //       })}
  //     </SelectContent>
  //   </SelectComponent>
  // );
});

Select.displayName = "Select";
