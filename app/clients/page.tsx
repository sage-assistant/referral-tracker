import { ClientManager } from "@/components/client-manager";
import { Shell } from "@/components/shell";
import { getClients, getPeople } from "@/lib/data";

export default function ClientsPage() {
  return (
    <Shell
      title="Client Records"
      description="Add new setups, edit fee details, and preserve the referral chain that governs every distribution."
    >
      <ClientManager clients={getClients()} people={getPeople()} />
    </Shell>
  );
}
