"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { ContentField, contentInputClassName } from "@/components/admin/content-field";

export type ArrayFieldDef<T> = {
  /** Key on the item object. */
  key: keyof T & string;
  /** Label shown to the editor. */
  label: string;
  /** Optional plain-English hint. */
  hint?: string;
  /** Input kind. Defaults to single-line text. */
  kind?: "text" | "textarea" | "url";
  /** Placeholder shown in the input. */
  placeholder?: string;
  /** If true, shown smaller (inline inside a row). Not currently used visually but reserved. */
  required?: boolean;
};

type ArrayEditorProps<T extends Record<string, string>> = {
  /** Form field name the JSON payload is submitted under. The server action
   *  reads this single field and JSON.parse()s the result. */
  name: string;
  /** Label for the whole array block. */
  label: string;
  /** Plain-English description of what the list controls. */
  description?: string;
  /** Current entries. */
  initialItems: T[];
  /** Field schema used to render each item's inputs. */
  fields: ArrayFieldDef<T>[];
  /** Blank template used when the editor adds a new row. */
  emptyItem: T;
  /** Minimum number of rows required. */
  minItems?: number;
  /** Maximum number of rows allowed. */
  maxItems?: number;
  /** Label shown in the "add" button. */
  addLabel?: string;
  /**
   * Keys whose non-empty values are joined to form the row summary shown in
   * the collapsed header (e.g. ["label", "value"] → "Distance · 200 km").
   * Data-only instead of a function so this component can receive its props
   * from server components. Defaults to the first field.
   */
  summaryKeys?: (keyof T & string)[];
  /** Separator between summary parts. Defaults to " · ". */
  summarySeparator?: string;
};

/**
 * Generic repeater for arrays of flat string records. Server action receives
 * a single hidden input named `{name}` containing the current array serialised
 * as JSON — no indexed-bracket FormData parsing required.
 */
export function ArrayEditor<T extends Record<string, string>>({
  name,
  label,
  description,
  initialItems,
  fields,
  emptyItem,
  minItems = 0,
  maxItems,
  addLabel,
  summaryKeys,
  summarySeparator = " · ",
}: ArrayEditorProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems.length ? initialItems : [{ ...emptyItem }]);

  const serialized = useMemo(() => JSON.stringify(items), [items]);

  const canRemove = items.length > minItems;
  const canAdd = maxItems === undefined || items.length < maxItems;

  const update = (index: number, patch: Partial<T>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const move = (index: number, direction: -1 | 1) => {
    setItems((prev) => {
      const next = prev.slice();
      const swap = index + direction;
      if (swap < 0 || swap >= next.length) return prev;
      [next[index], next[swap]] = [next[swap], next[index]];
      return next;
    });
  };

  const remove = (index: number) => {
    setItems((prev) => (prev.length > minItems ? prev.filter((_, i) => i !== index) : prev));
  };

  const add = () => {
    setItems((prev) => (maxItems !== undefined && prev.length >= maxItems ? prev : [...prev, { ...emptyItem }]));
  };

  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-secondary/15 p-5">
      <header>
        <h2 className="text-base font-semibold">{label}</h2>
        {description ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p> : null}
      </header>

      {/* Hidden field — the only thing the server action reads. */}
      <input type="hidden" name={name} value={serialized} readOnly />

      <ul className="space-y-3">
        {items.map((item, index) => {
          const keys = summaryKeys && summaryKeys.length ? summaryKeys : ([fields[0].key] as (keyof T & string)[]);
          const summary =
            keys
              .map((key) => String(item[key] ?? "").trim())
              .filter(Boolean)
              .join(summarySeparator) || `Item ${index + 1}`;
          return (
            <li key={index} className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-start justify-between gap-3 pb-3">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  #{index + 1} · {summary || "(untitled)"}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    aria-label="Move up"
                    className="rounded-full border border-border bg-secondary/40 p-1.5 text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1}
                    aria-label="Move down"
                    className="rounded-full border border-border bg-secondary/40 p-1.5 text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    disabled={!canRemove}
                    aria-label="Remove"
                    className="rounded-full border border-destructive/20 bg-destructive/5 p-1.5 text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => {
                  const value = String(item[field.key] ?? "");
                  const isFullWidth = field.kind === "textarea";
                  return (
                    <div key={String(field.key)} className={isFullWidth ? "md:col-span-2" : undefined}>
                      <ContentField label={field.label} hint={field.hint}>
                        {field.kind === "textarea" ? (
                          <textarea
                            value={value}
                            onChange={(event) => update(index, { [field.key]: event.target.value } as Partial<T>)}
                            placeholder={field.placeholder}
                            rows={3}
                            className={`${contentInputClassName} min-h-24`}
                          />
                        ) : (
                          <input
                            type={field.kind === "url" ? "url" : "text"}
                            value={value}
                            onChange={(event) => update(index, { [field.key]: event.target.value } as Partial<T>)}
                            placeholder={field.placeholder}
                            className={contentInputClassName}
                          />
                        )}
                      </ContentField>
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={add}
        disabled={!canAdd}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:border-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus size={14} />
        {addLabel ?? "Add row"}
      </button>
    </section>
  );
}
