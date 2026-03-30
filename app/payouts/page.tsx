import { PayoutTracker } from "@/components/payout-tracker";
import { Shell } from "@/components/shell";
import { getPayouts } from "@/lib/data";

export default function PayoutsPage() {
  return (
    <Shell
      title="Payout Tracker"
      description="Review every earned referral fee, then mark each distribution paid once the client setup is completed."
    >
      <PayoutTracker payouts={getPayouts()} />
    </Shell>
  );
}
