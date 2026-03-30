import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StatusChip } from "./StatusChip";

const LINK_STATUS_OPTIONS = ["Draft", "Live", "Closed"];
const DATA_STATUS_OPTIONS = ["Pending", "WIP", "Completed"];
const QUOTA_STATUS_OPTIONS = ["Not Received", "Pending", "Completed"];

const STATUS_FIELDS = ["linkStatus", "dataStatus", "quotaRedirectStatus"];
const DATE_FIELDS = ["receivedDate", "projectLaunchDate", "dataDelivery"];

function getStatusOptions(fieldName: string): string[] {
  if (fieldName === "linkStatus") return LINK_STATUS_OPTIONS;
  if (fieldName === "dataStatus") return DATA_STATUS_OPTIONS;
  if (fieldName === "quotaRedirectStatus") return QUOTA_STATUS_OPTIONS;
  return [];
}

interface InlineCellProps {
  value: string;
  fieldName: string;
  onSave: (newValue: string) => void;
  customOptions?: string[];
}

// Pure dropdown for Link Status (no free text)
function LinkStatusDropdown({
  value,
  options,
  onCommit,
  onCancel,
}: {
  value: string;
  options: string[];
  onCommit: (val: string) => void;
  onCancel: () => void;
}) {
  const selectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    selectRef.current?.focus();
  }, []);

  return (
    <select
      ref={selectRef}
      defaultValue={value}
      onChange={(e) => onCommit(e.target.value)}
      onBlur={() => onCancel()}
      onKeyDown={(e) => {
        if (e.key === "Escape") onCancel();
      }}
      className="border border-primary rounded px-1.5 py-0.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}

function StatusCombobox({
  value,
  options,
  onCommit,
  onCancel,
}: {
  value: string;
  options: string[];
  onCommit: (val: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(draft.toLowerCase()),
  );

  const commit = (val?: string) => {
    onCommit(val ?? draft);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          closeTimerRef.current = setTimeout(() => {
            setOpen(false);
            commit();
          }, 150);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            commit();
          }
          if (e.key === "Escape") {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            onCancel();
          }
        }}
        placeholder="Type or pick..."
        className="border border-primary rounded px-1.5 py-0.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary w-36"
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 top-full left-0 mt-0.5 bg-white border border-border rounded shadow-md min-w-full text-xs">
          {filtered.map((opt) => (
            <li
              key={opt}
              onMouseDown={(e) => {
                e.preventDefault();
                if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
                setDraft(opt);
                setOpen(false);
                commit(opt);
              }}
              className="px-2 py-1 cursor-pointer hover:bg-primary/10 hover:text-primary"
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function InlineCell({
  value,
  fieldName,
  onSave,
  customOptions,
}: InlineCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value);
  }, [value]);
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const commit = (val?: string) => {
    const finalVal = val ?? draft;
    setEditing(false);
    if (finalVal !== value) onSave(finalVal);
  };

  const isStatus = STATUS_FIELDS.includes(fieldName);
  const isDate = DATE_FIELDS.includes(fieldName);
  const isLinkStatus = fieldName === "linkStatus";
  const comboOptions =
    customOptions && customOptions.length > 0
      ? customOptions
      : isStatus
        ? getStatusOptions(fieldName)
        : null;

  if (editing) {
    if (isLinkStatus) {
      return (
        <LinkStatusDropdown
          value={draft}
          options={LINK_STATUS_OPTIONS}
          onCommit={(val) => {
            setDraft(val);
            commit(val);
          }}
          onCancel={() => {
            setDraft(value);
            setEditing(false);
          }}
        />
      );
    }
    if (comboOptions) {
      return (
        <StatusCombobox
          value={draft}
          options={comboOptions}
          onCommit={(val) => {
            setDraft(val);
            commit(val);
          }}
          onCancel={() => {
            setDraft(value);
            setEditing(false);
          }}
        />
      );
    }
    return (
      <input
        ref={inputRef}
        type={isDate ? "date" : "text"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => commit()}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
        }}
        className="border border-primary rounded px-1.5 py-0.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary min-w-0 w-full"
      />
    );
  }

  return (
    <div
      className="flex items-center gap-1 group/cell cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {isStatus ? (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="cursor-pointer border-none bg-transparent p-0"
        >
          <StatusChip value={value} field={fieldName} />
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs text-foreground cursor-pointer truncate max-w-[120px] border-none bg-transparent p-0 text-left"
          title={value}
        >
          {value || <span className="text-muted-foreground">—</span>}
        </button>
      )}
      {hovered && (
        <div className="flex items-center gap-0.5 ml-1">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="p-0.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
