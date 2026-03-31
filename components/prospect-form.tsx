"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Prospect, ProspectStatus } from "@/lib/types";
import { formatDate } from "@/lib/format";

type FormState = {
  name: string;
  email: string;
  phone: string;
  notes: string;
};

const defaultForm: FormState = {
  name: "",
  email: "",
  phone: "",
  notes: ""
};

const statusStyles: Record<ProspectStatus, string> = {
  New: "border-serene-border text-serene-muted",
  Contacted: "border-serene-ochre/30 text-serene-ochre",
  Converted: "border-serene-sage/30 text-serene-sage",
  Declined: "border-serene-border text-serene-muted"
};

const statusDots: Record<ProspectStatus, string> = {
  New: "bg-serene-muted",
  Contacted: "bg-serene-ochre",
  Converted: "bg-serene-sage",
  Declined: "bg-serene-muted"
};

export function ProspectForm({ prospects }: { prospects: Prospect[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<FormState>(defaultForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      const response = await fetch("/api/prospects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Unable to submit prospect.");
        return;
      }

      setForm(defaultForm);
      setSuccess("Prospect submitted.");
      router.refresh();
    });
  }

  return (
    <section className="mt-24">
      <div className="mb-10">
        <h2 className="heading-serif text-2xl italic text-white">Submit a Prospect</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-serene-muted">
          Share a qualified lead with Aaron, include any context that will help the first conversation.
        </p>
      </div>

      <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="editorial-panel p-8">
          <form className="space-y-6" onSubmit={submitForm}>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="editorial-label">Prospect Name</span>
                <input
                  className="editorial-input"
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
              </label>
              <label className="block space-y-2">
                <span className="editorial-label">Email</span>
                <input
                  className="editorial-input"
                  inputMode="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
            </div>
            <label className="block space-y-2">
              <span className="editorial-label">Phone</span>
              <input
                className="editorial-input"
                inputMode="tel"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              />
            </label>
            <label className="block space-y-2">
              <span className="editorial-label">Notes</span>
              <textarea
                className="editorial-textarea"
                placeholder="Met at a conference, interested in AI setup for his law firm."
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>
            {error ? <p className="text-sm text-serene-ochre">{error}</p> : null}
            {success ? <p className="text-sm text-serene-sage">{success}</p> : null}
            <button className="editorial-button w-full md:w-auto" disabled={isPending} type="submit">
              {isPending ? "Submitting" : "Submit Prospect"}
            </button>
          </form>
        </div>

        <div>
          <div className="mb-8 flex items-center justify-between">
            <h3 className="heading-serif text-2xl text-white">Submitted Prospects</h3>
            <p className="text-[10px] uppercase tracking-widest text-serene-muted">Status History</p>
          </div>
          <div className="space-y-2">
            {prospects.length === 0 ? (
              <div className="editorial-panel px-8 py-12 text-sm text-serene-muted">
                No prospects submitted yet.
              </div>
            ) : (
              prospects.map((prospect, index) => (
                <div
                  key={prospect.id}
                  className={`list-row flex flex-col gap-6 md:flex-row md:items-center ${
                    index === prospects.length - 1 ? "border-none" : ""
                  }`}
                >
                  <div className="w-full md:w-[26%]">
                    <h3 className="text-lg font-medium text-white">{prospect.name}</h3>
                    <p className="mt-1 text-xs italic text-serene-muted">{formatDate(prospect.createdAt)}</p>
                  </div>
                  <div className="w-full md:w-[24%]">
                    <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Contact</span>
                    <span className="text-sm text-serene-text">
                      {prospect.email ?? prospect.phone ?? "Not provided."}
                    </span>
                  </div>
                  <div className="w-full md:w-[30%]">
                    <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Notes</span>
                    <span className="text-sm leading-6 text-serene-muted">{prospect.notes ?? "No notes."}</span>
                  </div>
                  <div className="w-full md:ml-auto md:w-[16%]">
                    <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Status</span>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest ${statusStyles[prospect.status]}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDots[prospect.status]}`} />
                      {prospect.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
