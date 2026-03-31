"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";
import { Prospect, ProspectStatus } from "@/lib/types";

const statuses: ProspectStatus[] = ["New", "Contacted", "Converted", "Declined"];

export function ProspectManager({ prospects }: { prospects: Prospect[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function updateStatus(prospectId: number, status: ProspectStatus) {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/prospects/${prospectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Unable to update prospect.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <section>
      <div className="mb-10 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center md:gap-0">
        <h2 className="heading-serif text-2xl text-white">Prospect Pipeline</h2>
        <p className="text-[10px] uppercase tracking-widest text-serene-muted">Admin View</p>
      </div>
      {error ? <p className="mb-6 text-sm text-serene-ochre">{error}</p> : null}
      <div className="space-y-2">
        {prospects.length === 0 ? (
          <div className="editorial-panel px-8 py-12 text-sm text-serene-muted">No prospects have been submitted yet.</div>
        ) : (
          prospects.map((prospect, index) => (
            <div
              key={prospect.id}
              className={`list-row flex flex-col gap-6 md:flex-row md:items-center ${
                index === prospects.length - 1 ? "border-none" : ""
              }`}
            >
              <div className="w-full md:w-[18%]">
                <h3 className="text-lg font-medium text-white">{prospect.name}</h3>
                <p className="mt-1 text-xs italic text-serene-muted">{formatDate(prospect.createdAt)}</p>
              </div>
              <div className="w-full md:w-[16%]">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Submitted By</span>
                <span className="text-serene-text">{prospect.submittedByName}</span>
              </div>
              <div className="w-full md:w-[18%]">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Email</span>
                <span className="text-sm text-serene-text">{prospect.email ?? "Not provided."}</span>
              </div>
              <div className="w-full md:w-[16%]">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Phone</span>
                <span className="text-sm text-serene-text">{prospect.phone ?? "Not provided."}</span>
              </div>
              <div className="w-full md:w-[20%]">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Notes</span>
                <span className="text-sm leading-6 text-serene-muted">{prospect.notes ?? "No notes."}</span>
              </div>
              <div className="w-full md:ml-auto md:w-[12%]">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Status</span>
                <select
                  className="editorial-select"
                  disabled={isPending}
                  value={prospect.status}
                  onChange={(event) => updateStatus(prospect.id, event.target.value as ProspectStatus)}
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
