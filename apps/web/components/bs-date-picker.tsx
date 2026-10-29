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
  /** Classes for the bordered field that holds the input and buttons. */
  fieldClassName?: string;
  /**
   * Show a ✕ button and report an emptied field as onChange(""). Without
   * it, the field can still be emptied to retype a date, but leaving it
   * empty restores the value.
   */
  clearable?: boolean;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
};

/**
 * BS date picker with a "YYYY-MM-DD" string value, the shape our forms and
 * the API use. The calendar opens from the button at the start of the
 * field, where our other inputs keep their icons; ✕ sits at the end.
 */
export function BsDatePicker({
  value,
  onChange,
  fieldClassName,
  clearable = false,
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
  // Bumped to remount the picker, which resets its text to `value`.
  const [resetKey, setResetKey] = useState(0);

  return (
    <div
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) return;
        // Focus left the whole picker (input and calendar). Whatever text
        // is left must be what the form will submit: an emptied or
        // incomplete/invalid date never reached onChange, so show the
        // form's date again.
        const text = e.currentTarget.querySelector("input")?.value ?? "";
        const shown = selected ? formatBsDate(selected) : "";
        if (cleared) setCleared(false);
        else if (text !== shown) setResetKey((k) => k + 1);
      }}
    >
      <NepaliDatePicker
        key={resetKey}
        id={id}
        className="bs-date-picker"
        classNames={{
          // Callers' input classes target :focus, which a div never gets,
          // and typed invalid text should show like any other field error.
          // pl-2 goes last so a caller's px-*/pl-* doesn't merge it away; it
          // lines the calendar glyph up with our other inputs' icons.
          field: cn(
            "focus-within:border-(--brand-green) has-[[aria-invalid=true]]:border-[#9a3412]",
            fieldClassName,
            "pl-2",
          ),
        }}
        value={cleared ? undefined : selected}
        onChange={(date) => {
          if (date) {
            setCleared(false);
            onChange(formatBsDate(date));
          } else if (clearable) {
            onChange("");
          } else {
            setCleared(true);
          }
        }}
        today={today}
        iconPosition="start"
        clearable={clearable}
        placeholder={placeholder}
        disabled={disabled}
        dayShape="square"
      />
    </div>
  );
}
