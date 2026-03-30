"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Payout } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

export function PayoutTracker({ payouts }: { payouts: Payout[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function togglePayout(id: number, paid: boolean) {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/payouts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paid })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Unable to update payout.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <section>
      <div className="mb-10 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center md:gap-0">
        <h2 className="heading-serif text-2xl text-white">Fee Distribution Ledger</h2>
        {error ? <p className="text-sm text-serene-ochre">{error}</p> : null}
      </div>
      <div className="space-y-2">
        {payouts.length === 0 ? (
          <div className="editorial-panel px-8 py-12 text-sm text-serene-muted">No payout records yet.</div>
        ) : (
          payouts.map((payout, index) => (
            <div key={payout.id} className={`list-row flex flex-col gap-6 md:flex-row md:items-center ${index === payouts.length - 1 ? "border-none" : ""}`}>
              <div className="w-full md:w-1/4">
                <h3 className="text-lg font-medium text-white">{payout.recipientName}</h3>
                <p className="mt-1 text-xs italic text-serene-muted">
                  {payout.clientName}, {formatDate(payout.dateAdded)}
                </p>
              </div>
              <div className="w-full md:w-1/6">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Tier</span>
                <span>L{payout.level}</span>
              </div>
              <div className="w-full md:w-1/6">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Amount</span>
                <span>{formatCurrency(payout.amountCents)}</span>
              </div>
              <div className="w-full md:w-1/5">
                <StatusBadge status={payout.status} />
              </div>
              <div className="w-full md:ml-auto md:w-auto">
                <button
                  className="rounded-full border border-serene-border px-4 py-2 text-[10px] uppercase tracking-widest text-serene-text transition-colors hover:border-serene-ochre hover:text-serene-ochre disabled:opacity-50"
                  disabled={isPending || payout.status !== "Completed"}
                  onClick={() => togglePayout(payout.id, !payout.paidAt)}
                  type="button"
                >
                  {payout.paidAt ? "Mark Unpaid" : "Mark Paid"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
