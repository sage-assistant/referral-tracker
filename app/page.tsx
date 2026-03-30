import { DashboardList } from "@/components/dashboard-list";
import { Shell } from "@/components/shell";
import { StatsStrip } from "@/components/stats-strip";
import { getClients, getDashboardStats } from "@/lib/data";

export default function DashboardPage() {
  const stats = getDashboardStats();
  const clients = getClients();

  return (
    <Shell
      title="Referral Performance"
      description="A refined record of Harley's OpenClaw AI concierge network, capturing client growth, fee flow, and payout readiness."
    >
      <StatsStrip stats={stats} />
      <DashboardList clients={clients} />
    </Shell>
  );
}
