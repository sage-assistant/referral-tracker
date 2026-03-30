import Link from "next/link";
import { TreeNode } from "@/lib/types";

function Branch({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  return (
    <div className="relative pl-0" style={{ marginLeft: depth * 28 }}>
      <div className="mb-4 flex items-center gap-4">
        <div className="h-px flex-1 bg-serene-border" />
        <div className="min-w-56 rounded-full border border-serene-border px-5 py-3 text-center">
          <div className="editorial-label mb-1">{node.clientId ? "Client Node" : "Root Referrer"}</div>
          <div className="heading-serif text-xl italic text-white">{node.name}</div>
        </div>
        <div className={`h-px flex-1 ${node.children.length ? "bg-serene-ochre" : "bg-serene-border"}`} />
      </div>
      {node.children.length > 0 ? (
        <div className="space-y-4 border-l border-serene-border pl-6">
          {node.children.map((child) => (
            <Branch key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ReferralTree({ roots }: { roots: TreeNode[] }) {
  return (
    <section className="grid gap-24 md:grid-cols-2">
      <div>
        <h2 className="heading-serif mb-8 text-xl italic text-white">Network Path Analysis</h2>
        <div className="space-y-8">
          {roots.map((root) => (
            <Branch key={root.id} node={root} />
          ))}
        </div>
      </div>
      <div>
        <h2 className="heading-serif mb-8 text-xl italic text-white">Network Notes</h2>
        <div className="space-y-6">
          <div className="flex items-baseline justify-between border-b border-serene-border/20 pb-2">
            <span className="text-sm font-light">Primary tier payout</span>
            <span className="heading-serif text-lg text-serene-sage">$1 on every $5</span>
          </div>
          <div className="flex items-baseline justify-between border-b border-serene-border/20 pb-2">
            <span className="text-sm font-light">Secondary tier payout</span>
            <span className="heading-serif text-lg text-serene-ochre">$1 on every $10</span>
          </div>
          <div className="pt-10 text-sm leading-7 text-serene-muted">
            Open client records and assign the right referrer. Completed setups immediately become payable in the payout ledger.
          </div>
          <Link href="/clients" className="inline-block text-[11px] uppercase tracking-widest text-serene-muted hover:text-white">
            Open Client Records
          </Link>
        </div>
      </div>
    </section>
  );
}
