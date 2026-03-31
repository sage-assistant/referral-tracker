import { Shell } from "@/components/shell";
import { formatCurrency, formatDate } from "@/lib/format";
import { Prospect, ReferrerReferral, ReferrerSummary } from "@/lib/types";
import { ProspectForm } from "@/components/prospect-form";

function getPaymentStatus(referral: ReferrerReferral) {
  if (referral.paidAt) {
    return {
      label: "Paid",
      className: "border-serene-sage/30 text-serene-sage",
      dotClassName: "bg-serene-sage"
    };
  }

  if (referral.clientStatus === "Completed") {
    return {
      label: "Unpaid",
      className: "border-serene-ochre/30 text-serene-ochre",
      dotClassName: "bg-serene-ochre"
    };
  }

  return {
    label: "Awaiting Completion",
    className: "border-serene-border text-serene-muted",
    dotClassName: "bg-serene-muted"
  };
}

export function ReferrerPortal({
  prospects,
  referrals,
  summary
}: {
  prospects: Prospect[];
  referrals: ReferrerReferral[];
  summary: ReferrerSummary;
}) {
  const stats = [
    { label: "Clients Referred", value: String(summary.totalClients) },
    { label: "Fees Earned", value: formatCurrency(summary.totalFeesEarnedCents) },
    { label: "Paid Out", value: formatCurrency(summary.totalPaidOutCents) },
    { label: "Unpaid", value: formatCurrency(summary.totalUnpaidCents) }
  ];

  return (
    <Shell
      title="Referral Overview"
      description="A private view of Harley's referrals, earned fees, and payment activity."
    >
      <section className="mb-24 border-y border-serene-border py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {stats.map((item, index) => (
            <div
              key={item.label}
              className={
                index === 0
                  ? "flex flex-col gap-2"
                  : "flex flex-col gap-2 md:border-l md:border-serene-border/30 md:pl-8"
              }
            >
              <span className="editorial-label">{item.label}</span>
              <span className="heading-serif text-4xl text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-24">
        <div className="editorial-panel p-8 md:p-10">
          <div className="mb-6">
            <h2 className="heading-serif text-2xl italic text-white">Referral Agreement</h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-serene-muted">
            <p>
              <span className="text-serene-text">Level 1 Referral (Direct)</span>, you earn 20% of the
              setup fee for any client you refer directly.
            </p>
            <p>
              <span className="text-serene-text">Level 2 Referral (Indirect)</span>, you earn 10% of the
              setup fee when one of your referred clients brings in a new client.
            </p>
            <p>Payouts are processed once a client setup is marked as Completed.</p>
            <p>
              Each client may have a different setup fee. Your commission is calculated on the actual fee
              charged.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-10 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center md:gap-0">
          <h2 className="heading-serif text-2xl text-white">Referral Ledger</h2>
          <p className="text-[10px] uppercase tracking-widest text-serene-muted">Read Only View</p>
        </div>
        <div className="space-y-2">
          {referrals.length === 0 ? (
            <div className="editorial-panel px-8 py-12 text-sm text-serene-muted">
              No referral fees have been recorded yet.
            </div>
          ) : (
            referrals.map((referral, index) => {
              const paymentStatus = getPaymentStatus(referral);

              return (
                <div
                  key={referral.payoutId}
                  className={`list-row flex flex-col gap-6 md:flex-row md:items-center ${
                    index === referrals.length - 1 ? "border-none" : ""
                  }`}
                >
                  <div className="w-full md:w-[22%]">
                    <h3 className="text-lg font-medium text-white">{referral.clientName}</h3>
                    <p className="mt-1 text-xs italic text-serene-muted">{formatDate(referral.dateAdded)}</p>
                  </div>
                  <div className="w-full md:w-[14%]">
                    <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Setup Fee</span>
                    <span className="text-serene-text">{formatCurrency(referral.setupFeeCents)}</span>
                  </div>
                  <div className="w-full md:w-[10%]">
                    <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Tier</span>
                    <span className="text-serene-text">L{referral.level}</span>
                  </div>
                  <div className="w-full md:w-[14%]">
                    <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Fee Earned</span>
                    <span className="text-serene-text">{formatCurrency(referral.amountCents)}</span>
                  </div>
                  <div className="w-full md:w-[20%]">
                    <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Payment Status</span>
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] uppercase tracking-widest ${paymentStatus.className}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${paymentStatus.dotClassName}`} />
                      {paymentStatus.label}
                    </span>
                  </div>
                  <div className="w-full md:ml-auto md:w-[10%]">
                    <span className="mb-1 block text-[10px] uppercase tracking-widest text-serene-muted">Date</span>
                    <span className="text-sm text-serene-text">{formatDate(referral.dateAdded)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      <ProspectForm prospects={prospects} />
    </Shell>
  );
}
