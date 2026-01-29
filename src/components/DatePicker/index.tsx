"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePicker({ initialValue, onChange }: { initialValue?: string; onChange?: (val?: string) => void }) {
  const [open, setOpen] = React.useState(false)
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!initialValue) return undefined;

    const [d, m, y] = initialValue.split("/").map(Number);
    if (!d || !m || !y) return undefined;
    return new Date(y, m - 1, d);
  });

  return (
    <div className="flex flex-col gap-3">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id="date"
            className="max-w-48 justify-between font-normal bg-transparent border-white text-white hover:bg-white/15 hover:text-white"
          >
            {date ? date.toLocaleDateString() : "Selecione"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            captionLayout="dropdown"
            onSelect={(date) => {
              setDate(date)
              setOpen(false)
              if (onChange && date) {
                const dd = String(date.getDate()).padStart(2, "0")
                const mm = String(date.getMonth() + 1).padStart(2, "0")
                const yyyy = date.getFullYear()
                onChange(`${dd}/${mm}/${yyyy}`)
              }
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
