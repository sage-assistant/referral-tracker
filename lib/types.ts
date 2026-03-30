export type ClientStatus = "Pending" | "In Progress" | "Completed";

export type Person = {
  id: number;
  name: string;
  referredByPersonId: number | null;
  notes: string | null;
  createdAt: string;
};

export type Client = {
  id: number;
  personId: number;
  name: string;
  setupFeeCents: number;
  status: ClientStatus;
  dateAdded: string;
  notes: string | null;
  referredByPersonId: number | null;
  referredByName: string | null;
  secondaryReferrerName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Payout = {
  id: number;
  clientId: number;
  clientName: string;
  recipientPersonId: number;
  recipientName: string;
  level: 1 | 2;
  amountCents: number;
  paidAt: string | null;
  status: ClientStatus;
  dateAdded: string;
};

export type DashboardStats = {
  totalSetups: number;
  totalRevenueCents: number;
  totalOwedCents: number;
  totalPaidCents: number;
};

export type ReferrerReferral = {
  payoutId: number;
  clientId: number;
  clientName: string;
  setupFeeCents: number;
  level: 1 | 2;
  amountCents: number;
  paidAt: string | null;
  clientStatus: ClientStatus;
  dateAdded: string;
};

export type ReferrerSummary = {
  totalClients: number;
  totalFeesEarnedCents: number;
  totalPaidOutCents: number;
  totalUnpaidCents: number;
};

export type TreeNode = {
  id: number;
  name: string;
  clientId: number | null;
  children: TreeNode[];
};
