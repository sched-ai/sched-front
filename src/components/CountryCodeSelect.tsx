import { useState } from "react";
import { ChevronDown } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import type { CountryCode } from "libphonenumber-js";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { COUNTRIES, getCountryByIso, type Country } from "@/util/countries";

type FlagComponent = (props: { className?: string; title?: string }) => React.JSX.Element;

const FlagIcon = ({ iso, className }: { iso: CountryCode; className?: string }) => {
  const Component = (Flags as Record<string, FlagComponent | undefined>)[iso];
  if (!Component) {
    return <span className={cn("inline-block", className)} aria-hidden="true" />;
  }
  return <Component className={className} title={iso} />;
};

type Props = {
  value: CountryCode;
  onChange: (iso: CountryCode) => void;
  disabled?: boolean;
};

export const CountryCodeSelect = ({ value, onChange, disabled }: Props) => {
  const [open, setOpen] = useState(false);
  const selected: Country | undefined = getCountryByIso(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex items-center gap-1.5 border-r border-slate-200 text-slate-700 pr-2 pl-0.5 py-1.5 select-none",
            "hover:bg-slate-50 transition-colors rounded-l-md",
            "focus:outline-none focus-visible:ring-1 focus-visible:ring-blue-500",
            disabled && "opacity-50 cursor-not-allowed",
          )}
          aria-label="Selecionar país"
        >
          <FlagIcon iso={value} className="h-4 w-6 rounded-sm shrink-0" />
          <span className="font-medium leading-none text-[14px]">
            +{selected?.callingCode ?? ""}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[320px]"
        align="start"
        sideOffset={6}
      >
        <Command
          filter={(itemValue, search) => {
            const term = search.toLowerCase().trim().replace(/^\+/, "");
            if (!term) return 1;
            return itemValue.toLowerCase().includes(term) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Buscar país ou código..." />
          <CommandList>
            <CommandEmpty>Nenhum país encontrado.</CommandEmpty>
            <CommandGroup>
              {COUNTRIES.map((country) => (
                <CommandItem
                  key={country.iso}
                  value={`${country.name} ${country.iso} +${country.callingCode}`}
                  onSelect={() => {
                    onChange(country.iso);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2.5"
                >
                  <FlagIcon iso={country.iso} className="h-4 w-6 rounded-sm shrink-0" />
                  <span className="flex-1 truncate text-sm">{country.name}</span>
                  <span className="text-xs text-slate-500 shrink-0">+{country.callingCode}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default CountryCodeSelect;
