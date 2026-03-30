import { PayoutTracker } from "@/components/payout-tracker";
import { Shell } from "@/components/shell";
import { requireAdmin } from "@/lib/auth";
import { getPayouts } from "@/lib/data";

export default async function PayoutsPage() {
  await requireAdmin();

  return (
    <Shell
      title="Payout Tracker"
      description="Review every earned referral fee, then mark each distribution paid once the client setup is completed."
    >
      <PayoutTracker payouts={getPayouts()} />
    </Shell>
  );
}
