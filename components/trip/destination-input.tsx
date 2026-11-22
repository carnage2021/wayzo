"use client";

import { useEffect, useId, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DestinationValue = {
  place_id: string | null;
  name: string;
  lat: number | null;
  lng: number | null;
};
type Suggestion = { place_id: string; name: string; secondary: string | null };

/**
 * Multi-destination picker. Uses Geoapify city search (via our server route) when
 * configured; otherwise Enter adds a free-text destination.
 */
export function DestinationInput({
  value,
  onChange,
  invalid,
}: {
  value: DestinationValue[];
  onChange: (v: DestinationValue[]) => void;
  invalid?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const [placesEnabled, setPlacesEnabled] = useState(true);
  const listId = useId();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2 || !placesEnabled) {
      setSuggestions([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/places/autocomplete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: q }),
          signal: ctrl.signal,
        });
        const data = (await res.json()) as { configured?: boolean; suggestions?: Suggestion[] };
        if (data.configured === false) setPlacesEnabled(false);
        setSuggestions(data.suggestions ?? []);
        setActive(0);
        setOpen(true);
      } catch {
        /* aborted or offline: keep free text */
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, placesEnabled]);

  function add(d: DestinationValue) {
    if (!d.name.trim()) return;
    const exists = value.some((v) =>
      d.place_id ? v.place_id === d.place_id : v.name.toLowerCase() === d.name.toLowerCase(),
    );
    if (!exists && value.length < 10) onChange([...value, d]);
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && suggestions.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % suggestions.length);
    } else if (e.key === "ArrowUp" && suggestions.length) {
      e.preventDefault();
      setActive((a) => (a - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const s = open ? suggestions[active] : undefined;
      if (s) add({ place_id: s.place_id, name: s.name, lat: null, lng: null });
      else if (query.trim()) add({ place_id: null, name: query.trim(), lat: null, lng: null });
    } else if (e.key === "Escape") {
      setOpen(false);
    } else if (e.key === "Backspace" && !query && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  const showList = open && suggestions.length > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Input
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList ? `${listId}-${active}` : undefined}
          id="trip-destinations"
          placeholder={value.length ? "Add another city" : "Lisbon, Kyoto, Bali…"}
          icon={<Search />}
          invalid={invalid}
          value={query}
          autoComplete="off"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          trailing={
            loading ? <Loader2 className="text-placeholder size-[18px] animate-spin" aria-hidden /> : null
          }
        />
        {showList && (
          <ul
            id={listId}
            role="listbox"
            className="border-soft-line shadow-card absolute inset-x-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[20px] border bg-white p-1.5"
          >
            {suggestions.map((s, i) => (
              <li
                key={s.place_id}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  add({ place_id: s.place_id, name: s.name, lat: null, lng: null });
                }}
                onMouseEnter={() => setActive(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5",
                  i === active && "bg-mist",
                )}
              >
                <span className="text-blue inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF1FF]">
                  <MapPin className="size-[18px]" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{s.name}</span>
                  {s.secondary && (
                    <span className="text-subtle block truncate text-[13px]">{s.secondary}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {!placesEnabled && (
        <span className="text-subtle text-[13px]">Press Enter to add each destination.</span>
      )}
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Selected destinations">
          {value.map((d) => (
            <li
              key={d.place_id ?? d.name}
              className="bg-ink inline-flex min-h-10 items-center gap-2 rounded-full py-1 pr-1.5 pl-4 text-sm font-semibold text-white"
            >
              <MapPin className="text-lime size-4" aria-hidden />
              {d.name}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== d))}
                className="inline-flex size-7 items-center justify-center rounded-full transition-colors hover:bg-white/15"
                aria-label={`Remove ${d.name}`}
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
