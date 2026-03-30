import clsx from "clsx";
import { ClientStatus } from "@/lib/types";

const statusStyles: Record<ClientStatus, string> = {
  Pending: "text-serene-muted border-serene-border",
  "In Progress": "text-serene-ochre border-serene-ochre/30",
  Completed: "text-serene-sage border-serene-sage/30"
};

const dotStyles: Record<ClientStatus, string> = {
  Pending: "bg-serene-muted",
  "In Progress": "bg-serene-ochre",
  Completed: "bg-serene-sage"
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest",
        statusStyles[status]
      )}
    >
      <span className={clsx("h-1 w-1 rounded-full", dotStyles[status])} />
      {status}
    </span>
  );
}
