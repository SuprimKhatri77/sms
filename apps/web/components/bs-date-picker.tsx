"use client";

import { useMemo, useState } from "react";
import { NepaliDatePicker } from "bikram-sambat-react";
import { formatBsDate, todayBs } from "bikram-sambat-ts";
import { cn } from "@/lib/utils";
import { parseBsDateSafe } from "@/lib/bs-date";

type BsDatePickerProps = {
  /** BS date as "YYYY-MM-DD", or "" for no date. */
  value: string;
  onChange: (value: string) => void;
  inputClassName?: string;
  className?: string;
  /**
   * Report an emptied field as onChange(""). Without it, the field can still
   * be emptied to retype a date, but leaving it empty restores the value.
   */
  allowEmpty?: boolean;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
};

/**
 * BS date picker with a "YYYY-MM-DD" string value, the shape our forms and
 * the API use. Callers overlay their own calendar icon, so the input itself
 * opens the calendar.
 */
export function BsDatePicker({
  value,
  onChange,
  inputClassName,
  className,
  allowEmpty = false,
  placeholder,
  disabled,
  id,
}: BsDatePickerProps) {
  // Nepal's today, fixed for the picker's lifetime so it doesn't change
  // identity on every render.
  const [today] = useState(todayBs);
  // Keyed on the string, so the controlled value keeps its identity across
  // unrelated parent renders.
  const selected = useMemo(() => parseBsDateSafe(value), [value]);

  // The user emptied the field but the form still holds `value`. Without
  // this, the controlled picker would snap the old date straight back.
  const [cleared, setCleared] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setCleared(false);
  }

  return (
    <div
      onBlur={(e) => {
        // Focus left the whole picker (input and calendar) while empty:
        // show the form's date again rather than a blank it won't submit.
        if (cleared && !e.currentTarget.contains(e.relatedTarget)) {
          setCleared(false);
        }
      }}
    >
      <NepaliDatePicker
        id={id}
        className={cn("bs-date-picker", className)}
        classNames={{ input: inputClassName }}
        value={cleared ? undefined : selected}
        onChange={(date) => {
          if (date) {
            setCleared(false);
            onChange(formatBsDate(date));
          } else if (allowEmpty) {
            onChange("");
          } else {
            setCleared(true);
          }
        }}
        today={today}
        iconPosition="none"
        placeholder={placeholder}
        disabled={disabled}
        dayShape="square"
      />
    </div>
  );
}
