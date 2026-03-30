import { DashboardStats } from "@/lib/types";
import { formatCurrency } from "@/lib/format";

export function StatsStrip({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: "Total Setups", value: String(stats.totalSetups) },
    { label: "Total Revenue", value: formatCurrency(stats.totalRevenueCents) },
    { label: "Total Owed", value: formatCurrency(stats.totalOwedCents) },
    { label: "Total Paid Out", value: formatCurrency(stats.totalPaidCents) }
  ];

  return (
    <section className="mb-24 border-y border-serene-border py-10">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={index === 0 ? "flex flex-col gap-2" : "flex flex-col gap-2 border-l border-serene-border/30 pl-8"}
          >
            <span className="editorial-label">{item.label}</span>
            <span className="heading-serif text-4xl text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
