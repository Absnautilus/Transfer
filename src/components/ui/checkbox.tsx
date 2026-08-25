"use client";

import { useId, useState } from "react";

export function Checkbox({
  name,
  value = "true",
  defaultChecked,
  checked,
  onChange,
  disabled,
  label,
}: {
  name?: string;
  value?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label: React.ReactNode;
}) {
  const id = useId();
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const isControlled = checked !== undefined;
  const isChecked = isControlled ? checked : internal;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    if (!isControlled) setInternal(next);
    onChange?.(next);
  }

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-2 text-sm text-slate-900 select-none ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
    >
      <input
        id={id}
        type="checkbox"
        name={name}
        value={value}
        checked={isChecked}
        onChange={handleChange}
        disabled={disabled}
        className="sr-only"
      />
      <span
        className={`flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-md border-[1.5px] transition-colors ${
          isChecked ? "border-purple-600 bg-purple-600" : "border-slate-300 bg-white"
        }`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-3 w-3 text-white transition-all ${isChecked ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      {label}
    </label>
  );
}
