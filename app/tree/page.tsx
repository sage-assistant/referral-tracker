import { ReferralTree } from "@/components/referral-tree";
import { Shell } from "@/components/shell";
import { getTree } from "@/lib/data";

export default function TreePage() {
  return (
    <Shell
      title="Referral Tree"
      description="Trace how Harley's network expands, from the root referral source through each active client node."
    >
      <ReferralTree roots={getTree()} />
    </Shell>
  );
}
