import { ProspectManager } from "@/components/prospect-manager";
import { Shell } from "@/components/shell";
import { requireAdmin } from "@/lib/auth";
import { getProspects } from "@/lib/data";

export default async function ProspectsPage() {
  await requireAdmin();

  return (
    <Shell
      title="Prospects"
      description="Review every submitted lead, track follow up, and move each prospect through the referral pipeline."
    >
      <ProspectManager prospects={getProspects()} />
    </Shell>
  );
}
