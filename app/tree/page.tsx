import { ReferralTree } from "@/components/referral-tree";
import { Shell } from "@/components/shell";
import { requireAdmin } from "@/lib/auth";
import { getTree } from "@/lib/data";

export default async function TreePage() {
  await requireAdmin();

  return (
    <Shell
      title="Referral Tree"
      description="Trace how Harley's Silicon Grip network expands, from the root referral source through each active client node."
    >
      <ReferralTree roots={getTree()} />
    </Shell>
  );
}
