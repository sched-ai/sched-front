import * as React from "react";
import { Check, ChevronsUpDown, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

export interface Option {
  id: string;
  nickname: string;
}

interface WorkplaceMultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function WorkplaceMultiSelect({
  options = [],
  selected = [],
  onChange,
  placeholder = "Selecionar local...",
  disabled = false,
}: WorkplaceMultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = () => {
    if (disabled) return;
    onChange([]);
  };

  const toggleOption = (id: string) => {
    if (disabled) return;
    onChange([id]);
    setOpen(false);
  };

  const selectedObjects = options.filter((o) => selected.includes(o.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between min-h-[42px] h-auto px-3 py-2 border-slate-300 hover:border-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg bg-white transition-all",
            disabled && "opacity-50 cursor-not-allowed bg-slate-50"
          )}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selectedObjects.length > 0 ? (
              selectedObjects.map((item) => (
                <Badge
                  variant="secondary"
                  key={item.id}
                  className="bg-blue-50 text-blue-700 border-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnselect();
                  }}
                >
                  {item.nickname}
                  {!disabled && (
                    <X className="h-3 w-3 text-blue-400 group-hover:text-blue-600 transition-colors" />
                  )}
                </Badge>
              ))
            ) : (
              <span className="text-slate-400 font-normal">{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="max-h-64 overflow-y-auto p-2 space-y-1">
          {options.length > 0 ? (
            options.map((option) => (
              <div
                key={option.id}
                className={cn(
                  "flex items-center space-x-2 px-2 py-2 rounded-md transition-colors cursor-pointer hover:bg-slate-50",
                  selected.includes(option.id) && "bg-blue-50/50"
                )}
                onClick={() => toggleOption(option.id)}
              >
                <Checkbox
                  id={`option-${option.id}`}
                  checked={selected.includes(option.id)}
                  onCheckedChange={() => toggleOption(option.id)}
                />
                <div className="flex items-center gap-2 flex-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">
                    {option.nickname}
                  </span>
                </div>
                {selected.includes(option.id) && (
                  <Check className="h-4 w-4 text-blue-600" />
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-sm text-slate-500 italic">
              Nenhum local encontrado.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
