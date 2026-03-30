import { ClientManager } from "@/components/client-manager";
import { Shell } from "@/components/shell";
import { requireAdmin } from "@/lib/auth";
import { getClients, getPeople } from "@/lib/data";

export default async function ClientsPage() {
  await requireAdmin();

  return (
    <Shell
      title="Client Records"
      description="Add new setups, edit fee details, and preserve the referral chain that governs every distribution."
    >
      <ClientManager clients={getClients()} people={getPeople()} />
    </Shell>
  );
}
