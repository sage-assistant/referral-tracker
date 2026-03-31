import "server-only";

import { db } from "@/lib/db";
import { AppError } from "@/lib/errors";
import {
  Client,
  ClientStatus,
  DashboardStats,
  Payout,
  Person,
  Prospect,
  ProspectStatus,
  ReferrerReferral,
  ReferrerSummary,
  TreeNode
} from "@/lib/types";

const DEFAULT_FEE_CENTS = 575000;
const VALID_STATUSES: ClientStatus[] = ["Pending", "In Progress", "Completed"];
const VALID_PROSPECT_STATUSES: ProspectStatus[] = ["New", "Contacted", "Converted", "Declined"];

function nowIso() {
  return new Date().toISOString();
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function toTitleStatus(value: unknown): ClientStatus {
  if (typeof value !== "string" || !VALID_STATUSES.includes(value as ClientStatus)) {
    throw new AppError("Invalid setup status.");
  }

  return value as ClientStatus;
}

function normalizeName(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(`${fieldName} is required.`);
  }

  return value.trim();
}

function normalizeNotes(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeFee(value: unknown) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new AppError("Setup fee must be greater than zero.");
  }

  return Math.round(parsed * 100);
}

function normalizeDate(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new AppError("Date added must use YYYY-MM-DD format.");
  }

  return value;
}

function toProspectStatus(value: unknown): ProspectStatus {
  if (typeof value !== "string" || !VALID_PROSPECT_STATUSES.includes(value as ProspectStatus)) {
    throw new AppError("Prospect status is invalid.");
  }

  return value as ProspectStatus;
}

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS people (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      referred_by_person_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id INTEGER NOT NULL UNIQUE REFERENCES people(id) ON DELETE CASCADE,
      setup_fee_cents INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Pending', 'In Progress', 'Completed')),
      date_added TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      recipient_person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      level INTEGER NOT NULL CHECK (level IN (1, 2)),
      amount_cents INTEGER NOT NULL,
      paid_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      UNIQUE(client_id, recipient_person_id, level)
    );

    CREATE TABLE IF NOT EXISTS prospects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      notes TEXT,
      submitted_by_person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Converted', 'Declined')),
      created_at TEXT NOT NULL
    );
  `);

  const existingHarley = db
    .prepare("SELECT id FROM people WHERE name = ?")
    .get("Harley") as { id: number } | undefined;

  if (!existingHarley) {
    db.prepare(
      "INSERT INTO people (name, referred_by_person_id, notes, created_at) VALUES (?, NULL, ?, ?)"
    ).run("Harley", "Root referrer for OpenClaw AI concierge setups.", nowIso());
  }
}

initializeDatabase();

export function getPeople() {
  return db
    .prepare(
      `SELECT id, name, referred_by_person_id AS referredByPersonId, notes, created_at AS createdAt
       FROM people
       ORDER BY LOWER(name) ASC`
    )
    .all() as Person[];
}

function getPersonById(personId: number) {
  return db
    .prepare(
      `SELECT id, name, referred_by_person_id AS referredByPersonId, notes, created_at AS createdAt
       FROM people
       WHERE id = ?`
    )
    .get(personId) as Person | undefined;
}

function getPersonByName(name: string) {
  return db
    .prepare(
      `SELECT id, name, referred_by_person_id AS referredByPersonId, notes, created_at AS createdAt
       FROM people
       WHERE LOWER(name) = LOWER(?)`
    )
    .get(name) as Person | undefined;
}

function getClientById(clientId: number) {
  return db
    .prepare(
      `SELECT c.id, c.person_id AS personId, p.name, c.setup_fee_cents AS setupFeeCents, c.status, c.date_added AS dateAdded,
              c.notes, p.referred_by_person_id AS referredByPersonId, ref.name AS referredByName, ref2.name AS secondaryReferrerName,
              c.created_at AS createdAt, c.updated_at AS updatedAt
       FROM clients c
       INNER JOIN people p ON p.id = c.person_id
       LEFT JOIN people ref ON ref.id = p.referred_by_person_id
       LEFT JOIN people ref2 ON ref2.id = ref.referred_by_person_id
       WHERE c.id = ?`
    )
    .get(clientId) as Client | undefined;
}

function getClientByPersonId(personId: number) {
  return db
    .prepare("SELECT id FROM clients WHERE person_id = ?")
    .get(personId) as { id: number } | undefined;
}

function syncPayoutsForClient(clientId: number) {
  const client = db
    .prepare(
      `SELECT c.id, c.person_id AS personId, c.setup_fee_cents AS setupFeeCents
       FROM clients c
       WHERE c.id = ?`
    )
    .get(clientId) as { id: number; personId: number; setupFeeCents: number } | undefined;

  if (!client) {
    throw new AppError("Client not found.", 404);
  }

  const person = getPersonById(client.personId);

  if (!person) {
    throw new AppError("Client person record not found.", 500);
  }

  const chain = [person.referredByPersonId, person.referredByPersonId ? getPersonById(person.referredByPersonId)?.referredByPersonId ?? null : null]
    .filter((value): value is number => Boolean(value));

  const expected = chain.map((recipientPersonId, index) => ({
    recipientPersonId,
    level: (index + 1) as 1 | 2,
    amountCents: Math.round(client.setupFeeCents * (index === 0 ? 0.2 : 0.1))
  }));

  const tx = db.transaction(() => {
    const existing = db
      .prepare("SELECT recipient_person_id AS recipientPersonId, level FROM payouts WHERE client_id = ?")
      .all(clientId) as Array<{ recipientPersonId: number; level: 1 | 2 }>;

    const keepKeys = new Set(expected.map((entry) => `${entry.recipientPersonId}:${entry.level}`));

    for (const payout of existing) {
      const key = `${payout.recipientPersonId}:${payout.level}`;
      if (!keepKeys.has(key)) {
        db.prepare("DELETE FROM payouts WHERE client_id = ? AND recipient_person_id = ? AND level = ?").run(
          clientId,
          payout.recipientPersonId,
          payout.level
        );
      }
    }

    for (const payout of expected) {
      const existingRow = db
        .prepare(
          `SELECT id, paid_at AS paidAt
           FROM payouts
           WHERE client_id = ? AND recipient_person_id = ? AND level = ?`
        )
        .get(clientId, payout.recipientPersonId, payout.level) as { id: number; paidAt: string | null } | undefined;

      if (existingRow) {
        db.prepare(
          `UPDATE payouts
           SET amount_cents = ?, updated_at = ?
           WHERE id = ?`
        ).run(payout.amountCents, nowIso(), existingRow.id);
      } else {
        db.prepare(
          `INSERT INTO payouts (client_id, recipient_person_id, level, amount_cents, paid_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, NULL, ?, ?)`
        ).run(clientId, payout.recipientPersonId, payout.level, payout.amountCents, nowIso(), nowIso());
      }
    }
  });

  tx();
}

function ensureUniqueName(name: string, excludedPersonId?: number) {
  const existing = db
    .prepare("SELECT id FROM people WHERE LOWER(name) = LOWER(?)")
    .get(name) as { id: number } | undefined;

  if (existing && existing.id !== excludedPersonId) {
    throw new AppError("A person with this name already exists.");
  }
}

export function getDashboardStats(): DashboardStats {
  const totalSetups = db
    .prepare("SELECT COUNT(*) AS count FROM clients")
    .get() as { count: number };

  const revenue = db
    .prepare("SELECT COALESCE(SUM(setup_fee_cents), 0) AS total FROM clients")
    .get() as { total: number };

  const owed = db
    .prepare(
      `SELECT COALESCE(SUM(p.amount_cents), 0) AS total
       FROM payouts p
       INNER JOIN clients c ON c.id = p.client_id
       WHERE c.status = 'Completed' AND p.paid_at IS NULL`
    )
    .get() as { total: number };

  const paid = db
    .prepare(
      `SELECT COALESCE(SUM(p.amount_cents), 0) AS total
       FROM payouts p
       INNER JOIN clients c ON c.id = p.client_id
       WHERE c.status = 'Completed' AND p.paid_at IS NOT NULL`
    )
    .get() as { total: number };

  return {
    totalSetups: totalSetups.count,
    totalRevenueCents: revenue.total,
    totalOwedCents: owed.total,
    totalPaidCents: paid.total
  };
}

export function getClients() {
  return db
    .prepare(
      `SELECT c.id, c.person_id AS personId, p.name, c.setup_fee_cents AS setupFeeCents, c.status, c.date_added AS dateAdded,
              c.notes, p.referred_by_person_id AS referredByPersonId, ref.name AS referredByName, ref2.name AS secondaryReferrerName,
              c.created_at AS createdAt, c.updated_at AS updatedAt
       FROM clients c
       INNER JOIN people p ON p.id = c.person_id
       LEFT JOIN people ref ON ref.id = p.referred_by_person_id
       LEFT JOIN people ref2 ON ref2.id = ref.referred_by_person_id
       ORDER BY date(c.date_added) DESC, c.id DESC`
    )
    .all() as Client[];
}

export function getPayouts() {
  return db
    .prepare(
      `SELECT p.id, p.client_id AS clientId, person.name AS clientName, p.recipient_person_id AS recipientPersonId,
              recipient.name AS recipientName, p.level, p.amount_cents AS amountCents, p.paid_at AS paidAt,
              c.status, c.date_added AS dateAdded
       FROM payouts p
       INNER JOIN clients c ON c.id = p.client_id
       INNER JOIN people person ON person.id = c.person_id
       INNER JOIN people recipient ON recipient.id = p.recipient_person_id
       ORDER BY p.paid_at IS NOT NULL ASC, date(c.date_added) DESC, p.level ASC`
    )
    .all() as Payout[];
}

export function getReferrerReferrals(referrerName: string) {
  const referrer = getPersonByName(referrerName);

  if (!referrer) {
    return [] as ReferrerReferral[];
  }

  return db
    .prepare(
      `SELECT p.id AS payoutId, c.id AS clientId, person.name AS clientName, c.setup_fee_cents AS setupFeeCents,
              p.level, p.amount_cents AS amountCents, p.paid_at AS paidAt, c.status AS clientStatus,
              c.date_added AS dateAdded
       FROM payouts p
       INNER JOIN clients c ON c.id = p.client_id
       INNER JOIN people person ON person.id = c.person_id
       WHERE p.recipient_person_id = ?
       ORDER BY date(c.date_added) DESC, p.level ASC, c.id DESC`
    )
    .all(referrer.id) as ReferrerReferral[];
}

export function getReferrerSummary(referrerName: string): ReferrerSummary {
  const referrals = getReferrerReferrals(referrerName);

  return referrals.reduce<ReferrerSummary>(
    (summary, referral) => ({
      totalClients: summary.totalClients + 1,
      totalFeesEarnedCents: summary.totalFeesEarnedCents + referral.amountCents,
      totalPaidOutCents: summary.totalPaidOutCents + (referral.paidAt ? referral.amountCents : 0),
      totalUnpaidCents: summary.totalUnpaidCents + (referral.paidAt ? 0 : referral.amountCents)
    }),
    {
      totalClients: 0,
      totalFeesEarnedCents: 0,
      totalPaidOutCents: 0,
      totalUnpaidCents: 0
    }
  );
}

export function getProspects(submittedByPersonId?: number) {
  const baseQuery = `SELECT p.id, p.name, p.email, p.phone, p.notes,
                            p.submitted_by_person_id AS submittedByPersonId,
                            submitter.name AS submittedByName,
                            p.status, p.created_at AS createdAt
                     FROM prospects p
                     INNER JOIN people submitter ON submitter.id = p.submitted_by_person_id`;

  const query =
    submittedByPersonId === undefined
      ? `${baseQuery} ORDER BY datetime(p.created_at) DESC, p.id DESC`
      : `${baseQuery} WHERE p.submitted_by_person_id = ? ORDER BY datetime(p.created_at) DESC, p.id DESC`;

  const statement = db.prepare(query);
  return (
    submittedByPersonId === undefined ? statement.all() : statement.all(submittedByPersonId)
  ) as Prospect[];
}

export function getReferrerProspects(referrerName: string) {
  const referrer = getPersonByName(referrerName);

  if (!referrer) {
    return [] as Prospect[];
  }

  return getProspects(referrer.id);
}

type ProspectInput = {
  name: unknown;
  email: unknown;
  phone: unknown;
  notes: unknown;
};

function parseProspectInput(input: ProspectInput) {
  return {
    name: normalizeName(input.name, "Prospect name"),
    email: normalizeOptionalText(input.email),
    phone: normalizeOptionalText(input.phone),
    notes: normalizeOptionalText(input.notes)
  };
}

export function createProspect(submittedByName: string, input: ProspectInput) {
  const submitter = getPersonByName(submittedByName);

  if (!submitter) {
    throw new AppError("Submitting referrer was not found.", 404);
  }

  const parsed = parseProspectInput(input);
  const createdAt = nowIso();

  const result = db
    .prepare(
      `INSERT INTO prospects (name, email, phone, notes, submitted_by_person_id, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'New', ?)`
    )
    .run(parsed.name, parsed.email, parsed.phone, parsed.notes, submitter.id, createdAt);

  const prospect = db
    .prepare(
      `SELECT p.id, p.name, p.email, p.phone, p.notes,
              p.submitted_by_person_id AS submittedByPersonId,
              submitter.name AS submittedByName,
              p.status, p.created_at AS createdAt
       FROM prospects p
       INNER JOIN people submitter ON submitter.id = p.submitted_by_person_id
       WHERE p.id = ?`
    )
    .get(Number(result.lastInsertRowid)) as Prospect | undefined;

  if (!prospect) {
    throw new AppError("Prospect could not be loaded after creation.", 500);
  }

  return prospect;
}

export function updateProspectStatus(prospectId: number, status: unknown) {
  const parsedStatus = toProspectStatus(status);
  const prospect = db.prepare("SELECT id FROM prospects WHERE id = ?").get(prospectId) as { id: number } | undefined;

  if (!prospect) {
    throw new AppError("Prospect not found.", 404);
  }

  db.prepare("UPDATE prospects SET status = ? WHERE id = ?").run(parsedStatus, prospectId);
}

export function getTree() {
  const people = getPeople();
  const clientRows = db
    .prepare("SELECT id, person_id AS personId FROM clients")
    .all() as Array<{ id: number; personId: number }>;

  const clientMap = new Map(clientRows.map((row) => [row.personId, row.id]));
  const nodeMap = new Map<number, TreeNode>(
    people.map((person) => [
      person.id,
      { id: person.id, name: person.name, clientId: clientMap.get(person.id) ?? null, children: [] }
    ])
  );

  const roots: TreeNode[] = [];

  for (const person of people) {
    const node = nodeMap.get(person.id)!;
    if (person.referredByPersonId && nodeMap.has(person.referredByPersonId)) {
      nodeMap.get(person.referredByPersonId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

type ClientInput = {
  name: unknown;
  setupFee: unknown;
  status: unknown;
  dateAdded: unknown;
  notes: unknown;
  referredByPersonId: unknown;
};

function parseClientInput(input: ClientInput) {
  const name = normalizeName(input.name, "Client name");
  const setupFeeCents = input.setupFee === "" || input.setupFee === undefined ? DEFAULT_FEE_CENTS : normalizeFee(input.setupFee);
  const status = toTitleStatus(input.status);
  const dateAdded = normalizeDate(input.dateAdded ?? todayIsoDate());
  const notes = normalizeNotes(input.notes);
  const referredByPersonId =
    input.referredByPersonId === "" || input.referredByPersonId === null || input.referredByPersonId === undefined
      ? null
      : Number(input.referredByPersonId);

  if (referredByPersonId !== null && !Number.isInteger(referredByPersonId)) {
    throw new AppError("Referrer is invalid.");
  }

  if (referredByPersonId !== null && !getPersonById(referredByPersonId)) {
    throw new AppError("Selected referrer does not exist.");
  }

  return { name, setupFeeCents, status, dateAdded, notes, referredByPersonId };
}

function wouldCreateCycle(personId: number, referredByPersonId: number | null) {
  let currentId = referredByPersonId;

  while (currentId !== null) {
    if (currentId === personId) {
      return true;
    }

    const person = getPersonById(currentId);
    currentId = person?.referredByPersonId ?? null;
  }

  return false;
}

export function createClient(input: ClientInput) {
  const parsed = parseClientInput(input);
  ensureUniqueName(parsed.name);

  const tx = db.transaction(() => {
    const createdAt = nowIso();
    const personResult = db
      .prepare(
        `INSERT INTO people (name, referred_by_person_id, notes, created_at)
         VALUES (?, ?, ?, ?)`
      )
      .run(parsed.name, parsed.referredByPersonId, parsed.notes || null, createdAt);

    const clientResult = db
      .prepare(
        `INSERT INTO clients (person_id, setup_fee_cents, status, date_added, notes, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        Number(personResult.lastInsertRowid),
        parsed.setupFeeCents,
        parsed.status,
        parsed.dateAdded,
        parsed.notes || null,
        createdAt,
        createdAt
      );

    syncPayoutsForClient(Number(clientResult.lastInsertRowid));
    return Number(clientResult.lastInsertRowid);
  });

  const clientId = tx();
  return getClientById(clientId)!;
}

export function updateClient(clientId: number, input: ClientInput) {
  const existing = getClientById(clientId);

  if (!existing) {
    throw new AppError("Client not found.", 404);
  }

  const parsed = parseClientInput(input);
  ensureUniqueName(parsed.name, existing.personId);

  if (parsed.referredByPersonId === existing.personId) {
    throw new AppError("A client cannot refer themselves.");
  }

  if (wouldCreateCycle(existing.personId, parsed.referredByPersonId)) {
    throw new AppError("This referral link would create a cycle.");
  }

  const tx = db.transaction(() => {
    db.prepare(
      `UPDATE people
       SET name = ?, referred_by_person_id = ?, notes = ?
       WHERE id = ?`
    ).run(parsed.name, parsed.referredByPersonId, parsed.notes || null, existing.personId);

    db.prepare(
      `UPDATE clients
       SET setup_fee_cents = ?, status = ?, date_added = ?, notes = ?, updated_at = ?
       WHERE id = ?`
    ).run(parsed.setupFeeCents, parsed.status, parsed.dateAdded, parsed.notes || null, nowIso(), clientId);

    syncPayoutsForClient(clientId);
  });

  tx();
  return getClientById(clientId)!;
}

export function deleteClient(clientId: number) {
  const client = getClientById(clientId);

  if (!client) {
    throw new AppError("Client not found.", 404);
  }

  const hasChildren = db
    .prepare("SELECT COUNT(*) AS count FROM people WHERE referred_by_person_id = ?")
    .get(client.personId) as { count: number };

  if (hasChildren.count > 0) {
    throw new AppError("Reassign referred clients before deleting this client.");
  }

  const tx = db.transaction(() => {
    db.prepare("DELETE FROM clients WHERE id = ?").run(clientId);
    db.prepare("DELETE FROM people WHERE id = ?").run(client.personId);
  });

  tx();
}

export function setPayoutPaid(payoutId: number, paid: boolean) {
  const payout = db
    .prepare(
      `SELECT p.id, c.status
       FROM payouts p
       INNER JOIN clients c ON c.id = p.client_id
       WHERE p.id = ?`
    )
    .get(payoutId) as { id: number; status: ClientStatus } | undefined;

  if (!payout) {
    throw new AppError("Payout not found.", 404);
  }

  if (payout.status !== "Completed") {
    throw new AppError("Payouts can only be marked once the setup is completed.");
  }

  db.prepare(
    `UPDATE payouts
     SET paid_at = ?, updated_at = ?
     WHERE id = ?`
  ).run(paid ? nowIso() : null, nowIso(), payoutId);
}
