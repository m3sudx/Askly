"use client";

import { useEffect, useId, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
};

export function Select({ id, value, onChange, options, className = "" }: Props) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );

  // Close when the user clicks anywhere outside
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the highlighted option visible when scrolling with the keyboard
  useEffect(() => {
    if (open) {
      document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
    }
  }, [open, active, listId]);

  function openList() {
    setActive(selectedIndex);
    setOpen(true);
  }

  function choose(index: number) {
    onChange(options[index].value);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (open) setActive((i) => Math.min(i + 1, options.length - 1));
        else openList();
        break;
      case "ArrowUp":
        e.preventDefault();
        if (open) setActive((i) => Math.max(i - 1, 0));
        else openList();
        break;
      case "Home":
        if (open) {
          e.preventDefault();
          setActive(0);
        }
        break;
      case "End":
        if (open) {
          e.preventDefault();
          setActive(options.length - 1);
        }
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (open) choose(active);
        else openList();
        break;
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={(e) => {
          if (e.detail === 0) return; // keyboard presses are handled in onKeyDown
          if (open) setOpen(false);
          else openList();
        }}
        onKeyDown={onKeyDown}
        className={`flex w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2.5 text-left text-stone-900 outline-none hover:border-stone-400 focus-visible:border-teal-700 focus-visible:ring-2 focus-visible:ring-teal-700/20 ${
          open ? "border-teal-700 ring-2 ring-teal-700/20" : "border-stone-300"
        }`}
      >
        <span>{options[selectedIndex]?.label}</span>
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-5 shrink-0 text-stone-500 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-stone-200 bg-white py-1 shadow-lg"
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            return (
              <li
                key={o.value}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={selected}
                onMouseDown={(e) => e.preventDefault()} // keep keyboard focus on the button
                onClick={() => choose(i)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-3 py-2.5 text-[15px] ${
                  i === active ? "bg-teal-50 text-teal-900" : "text-stone-800"
                } ${selected ? "font-semibold" : ""}`}
              >
                <span>{o.label}</span>
                {selected && (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4 text-teal-700"
                  >
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}