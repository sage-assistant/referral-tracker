"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Client, ClientStatus, Person } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { StatusBadge } from "@/components/status-badge";

type FormState = {
  name: string;
  setupFee: string;
  referredByPersonId: string;
  status: ClientStatus;
  dateAdded: string;
  notes: string;
};

const defaultForm: FormState = {
  name: "",
  setupFee: "5750",
  referredByPersonId: "",
  status: "Pending",
  dateAdded: new Date().toISOString().slice(0, 10),
  notes: ""
};

function makeDefaultForm(people: Person[]): FormState {
  const harley = people.find((person) => person.name === "Harley");
  return {
    ...defaultForm,
    referredByPersonId: harley ? String(harley.id) : ""
  };
}

function getInitialForm(client?: Client): FormState {
  if (!client) return defaultForm;
  return {
    name: client.name,
    setupFee: String(client.setupFeeCents / 100),
    referredByPersonId: client.referredByPersonId ? String(client.referredByPersonId) : "",
    status: client.status,
    dateAdded: client.dateAdded,
    notes: client.notes ?? ""
  };
}

export function ClientManager({ clients, people }: { clients: Client[]; people: Person[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [editingClientId, setEditingClientId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => makeDefaultForm(people));

  const editingClient = useMemo(
    () => clients.find((client) => client.id === editingClientId),
    [clients, editingClientId]
  );

  const selectablePeople = useMemo(() => {
    return people.filter((person) => person.id !== editingClient?.personId);
  }, [people, editingClient?.personId]);

  function openCreate() {
    setShowCreate(true);
    setEditingClientId(null);
    setForm(makeDefaultForm(people));
    setError(null);
  }

  function openEdit(client: Client) {
    setEditingClientId(client.id);
    setShowCreate(true);
    setForm(getInitialForm(client));
    setError(null);
  }

  function closeForm() {
    setShowCreate(false);
    setEditingClientId(null);
    setForm(makeDefaultForm(people));
    setError(null);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const url = editingClientId ? `/api/clients/${editingClientId}` : "/api/clients";
    const method = editingClientId ? "PATCH" : "POST";

    startTransition(async () => {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Unable to save client.");
        return;
      }

      closeForm();
      router.refresh();
    });
  }

  async function removeClient(clientId: number) {
    setError(null);

    startTransition(async () => {
      const response = await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Unable to delete client.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section>
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center md:gap-0">
          <h2 className="heading-serif text-2xl text-white">Client Records</h2>
          <button className="editorial-button" onClick={openCreate} type="button">
            Add New Client
          </button>
        </div>
        <div className="space-y-2">
          {clients.map((client, index) => (
            <div key={client.id} className={`list-row flex flex-col gap-6 md:flex-row md:items-center ${index === clients.length - 1 ? "border-none" : ""}`}>
              <div className="w-full md:w-1/4">
                <h3 className="text-lg font-medium text-white">{client.name}</h3>
                <p className="mt-1 text-xs italic text-serene-muted">
                  {client.referredByName ?? "Harley"}, {formatDate(client.dateAdded)}
                </p>
              </div>
              <div className="w-full md:w-1/6">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Setup Fee</span>
                <span>{formatCurrency(client.setupFeeCents)}</span>
              </div>
              <div className="w-full md:w-1/5">
                <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Notes</span>
                <span className="text-sm text-serene-muted">{client.notes || "No notes."}</span>
              </div>
              <div className="w-full md:w-1/5">
                <StatusBadge status={client.status} />
              </div>
              <div className="flex w-full gap-3 md:ml-auto md:w-auto">
                <button className="text-[11px] uppercase tracking-widest text-serene-muted hover:text-serene-ochre" onClick={() => openEdit(client)} type="button">
                  Edit
                </button>
                <button className="text-[11px] uppercase tracking-widest text-serene-muted hover:text-white" onClick={() => removeClient(client.id)} type="button">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {clients.length === 0 ? (
            <div className="editorial-panel px-8 py-12 text-sm text-serene-muted">No client records yet.</div>
          ) : null}
        </div>
      </section>

      <aside className="editorial-panel h-fit p-8">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="heading-serif text-2xl italic text-white">
            {editingClientId ? "Edit Client" : "Add Client"}
          </h3>
          {showCreate ? (
            <button className="text-[10px] uppercase tracking-widest text-serene-muted hover:text-serene-text" onClick={closeForm} type="button">
              Close
            </button>
          ) : null}
        </div>
        {showCreate ? (
          <form className="space-y-6" onSubmit={submitForm}>
            <label className="block space-y-2">
              <span className="editorial-label">Client Name</span>
              <input
                className="editorial-input"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="block space-y-2">
              <span className="editorial-label">Setup Fee</span>
              <input
                className="editorial-input"
                inputMode="decimal"
                value={form.setupFee}
                onChange={(event) => setForm((current) => ({ ...current, setupFee: event.target.value }))}
              />
            </label>
            <label className="block space-y-2">
              <span className="editorial-label">Referred By</span>
              <select
                className="editorial-select"
                value={form.referredByPersonId}
                onChange={(event) => setForm((current) => ({ ...current, referredByPersonId: event.target.value }))}
              >
                <option value="">No referrer</option>
                {selectablePeople.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-2">
              <span className="editorial-label">Setup Status</span>
              <select
                className="editorial-select"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({ ...current, status: event.target.value as ClientStatus }))
                }
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </label>
            <label className="block space-y-2">
              <span className="editorial-label">Date Added</span>
              <input
                className="editorial-input"
                type="date"
                value={form.dateAdded}
                onChange={(event) => setForm((current) => ({ ...current, dateAdded: event.target.value }))}
              />
            </label>
            <label className="block space-y-2">
              <span className="editorial-label">Notes</span>
              <textarea
                className="editorial-textarea"
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
              />
            </label>
            {error ? <p className="text-sm text-serene-ochre">{error}</p> : null}
            <button className="editorial-button w-full" disabled={isPending} type="submit">
              {isPending ? "Saving" : editingClientId ? "Save Changes" : "Create Client"}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-sm text-serene-muted">
            <p>
              Add a client, assign the referring person, and the app will calculate L1 and L2 fees automatically.
            </p>
            <p>Setup fees default to {formatCurrency(575000)} and can be customized on every record.</p>
          </div>
        )}
      </aside>
    </div>
  );
}
