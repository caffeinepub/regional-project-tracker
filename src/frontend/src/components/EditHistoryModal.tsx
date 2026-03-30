import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { EditEntry } from "../backend";
import {
  useGetFieldEditHistory,
  useGetProjectEditHistory,
} from "../hooks/useQueries";

interface EditHistoryModalProps {
  open: boolean;
  onClose: () => void;
  projectId: bigint | null;
  projectName: string;
  fieldName?: string | null;
}

function formatTs(ts: bigint): string {
  return new Date(Number(ts / 1_000_000n)).toLocaleString();
}

// QNR history: show as a chronological progression (oldest first, latest highlighted)
function QnrHistoryList({ entries }: { entries: EditEntry[] }) {
  const sorted = [...entries].sort((a, b) => Number(a.timestamp - b.timestamp));

  // Build a progression list: initial value, then each newValue
  type Version = { name: string; timestamp: bigint; isLatest: boolean };
  const versions: Version[] = [];

  if (sorted.length > 0) {
    // First version is the oldValue of the first edit
    if (sorted[0].oldValue) {
      versions.push({
        name: sorted[0].oldValue,
        timestamp: sorted[0].timestamp,
        isLatest: false,
      });
    }
    sorted.forEach((entry, idx) => {
      versions.push({
        name: entry.newValue,
        timestamp: entry.timestamp,
        isLatest: idx === sorted.length - 1,
      });
    });
  }

  if (versions.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        No QNR name history available.
      </div>
    );
  }

  return (
    <div className="space-y-1 py-2">
      {versions.map((v, vIdx) => (
        <div
          key={`${v.name}-${v.timestamp}`}
          className={`flex items-start gap-3 px-3 py-2.5 rounded-lg ${
            v.isLatest
              ? "bg-emerald-50 border border-emerald-200"
              : "bg-muted/40 border border-transparent"
          }`}
        >
          <div
            className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              v.isLatest
                ? "bg-emerald-600 text-white"
                : "bg-muted-foreground/20 text-muted-foreground"
            }`}
          >
            {vIdx + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`text-sm font-medium break-words ${
                v.isLatest ? "text-emerald-700" : "text-foreground/70"
              }`}
            >
              {v.name || "(empty)"}
              {v.isLatest && (
                <span className="ml-2 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full font-semibold">
                  Latest
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {formatTs(v.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function HistoryRow({ entry, index }: { entry: EditEntry; index: number }) {
  return (
    <div
      data-ocid={`history.item.${index + 1}`}
      className="flex flex-col gap-1 py-3 border-b border-border last:border-0"
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline" className="text-[11px] font-medium px-2">
          {entry.fieldName}
        </Badge>
        <span className="text-[11px] text-muted-foreground">
          {formatTs(entry.timestamp)}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1 text-xs">
        <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-mono line-through">
          {entry.oldValue || "(empty)"}
        </span>
        <span className="text-muted-foreground">→</span>
        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono">
          {entry.newValue || "(empty)"}
        </span>
      </div>
    </div>
  );
}

export function EditHistoryModal({
  open,
  onClose,
  projectId,
  projectName,
  fieldName,
}: EditHistoryModalProps) {
  const projectHistory = useGetProjectEditHistory(fieldName ? null : projectId);
  const fieldHistory = useGetFieldEditHistory(
    fieldName ? projectId : null,
    fieldName ?? null,
  );

  const { data, isLoading } = fieldName ? fieldHistory : projectHistory;

  const entries = data ?? [];
  const isQnr = fieldName === "qnrName";

  // For non-QNR, sort newest first
  const sorted = [...entries].sort((a, b) => Number(b.timestamp - a.timestamp));

  const title = fieldName
    ? `Edit History – ${projectName} / ${fieldName}`
    : `Edit History – ${projectName}`;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        data-ocid="history.dialog"
        className="max-w-[560px] max-h-[80vh] flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-foreground leading-snug">
            {title}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea
          className="flex-1 -mx-6 px-6 overflow-auto"
          style={{ maxHeight: "60vh" }}
        >
          {isLoading ? (
            <div data-ocid="history.loading_state" className="space-y-3 py-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded" />
              ))}
            </div>
          ) : isQnr ? (
            <QnrHistoryList entries={entries} />
          ) : sorted.length === 0 ? (
            <div
              data-ocid="history.empty_state"
              className="py-10 text-center text-sm text-muted-foreground"
            >
              No edit history available.
            </div>
          ) : (
            <div>
              {sorted.map((entry, i) => (
                <HistoryRow key={entry.id.toString()} entry={entry} index={i} />
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="pt-2 flex justify-end border-t border-border">
          <button
            type="button"
            data-ocid="history.close_button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
