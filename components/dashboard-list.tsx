import Link from "next/link";
import { Client } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

function getCommissions(setupFeeCents: number, hasL1: boolean, hasL2: boolean) {
  const l1 = hasL1 ? Math.round(setupFeeCents * 0.2) : 0;
  const l2 = hasL2 ? Math.round(setupFeeCents * 0.1) : 0;
  return `${formatCurrency(l1)} / ${formatCurrency(l2)}`;
}

export function DashboardList({ clients }: { clients: Client[] }) {
  const previewClients = clients.slice(0, 5);

  return (
    <section>
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-0">
        <h2 className="heading-serif text-2xl text-white">Client Ledger</h2>
        <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-serene-muted">
          <Link href="/clients" className="hover:text-serene-ochre">
            Manage Clients
          </Link>
          <Link href="/payouts" className="hover:text-serene-ochre">
            View Payouts
          </Link>
        </div>
      </div>
      <div className="space-y-2">
        {previewClients.length === 0 ? (
          <div className="editorial-panel px-8 py-12 text-sm text-serene-muted">No clients yet.</div>
        ) : (
          previewClients.map((client, index) => (
            <div key={client.id} className={`list-row flex flex-col gap-6 md:flex-row md:items-center ${index === previewClients.length - 1 ? "border-none" : ""}`}>
              <div className="w-full md:w-1/4">
                <h3 className="text-lg font-medium text-white">{client.name}</h3>
                <p className="mt-1 text-xs italic text-serene-muted">
                  {client.referredByName ?? "Direct intake"}, {formatDate(client.dateAdded)}
                </p>
              </div>
              <div className="w-full md:w-1/6">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Setup Fee</span>
                <span className="text-serene-text">{formatCurrency(client.setupFeeCents)}</span>
              </div>
              <div className="w-full md:w-1/6">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Referral Fees</span>
                <span className="text-serene-text">
                  {getCommissions(
                    client.setupFeeCents,
                    Boolean(client.referredByPersonId),
                    Boolean(client.secondaryReferrerName)
                  )}
                </span>
              </div>
              <div className="w-full md:w-1/4 md:px-4">
                <StatusBadge status={client.status} />
              </div>
              <div className="w-full text-left md:w-1/12 md:text-right">
                <span className="material-symbols-outlined text-serene-sage">
                  {client.status === "Completed"
                    ? "check_circle"
                    : client.status === "In Progress"
                      ? "hourglass_bottom"
                      : "schedule"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
