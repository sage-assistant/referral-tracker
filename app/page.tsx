import { DashboardList } from "@/components/dashboard-list";
import { ReferrerPortal } from "@/components/referrer-portal";
import { Shell } from "@/components/shell";
import { StatsStrip } from "@/components/stats-strip";
import { requireSession } from "@/lib/auth";
import { getClients, getDashboardStats, getReferrerProspects, getReferrerReferrals, getReferrerSummary } from "@/lib/data";

export default async function DashboardPage() {
  const session = await requireSession();

  if (session.role === "referrer") {
    return (
      <ReferrerPortal
        prospects={getReferrerProspects(session.username)}
        referrals={getReferrerReferrals(session.username)}
        summary={getReferrerSummary(session.username)}
      />
    );
  }

  const stats = getDashboardStats();
  const clients = getClients();

  return (
    <Shell
      title="Referral Performance"
      description="A refined record of Harley's Silicon Grip referral network, capturing client growth, fee flow, and payout readiness."
    >
      <StatsStrip stats={stats} />
      <DashboardList clients={clients} />
    </Shell>
  );
}
