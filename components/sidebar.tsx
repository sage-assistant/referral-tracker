"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const navItems = [
  { href: "/", icon: "grid_view", label: "Dashboard" },
  { href: "/clients", icon: "contacts", label: "Clients" },
  { href: "/payouts", icon: "account_balance", label: "Payouts" },
  { href: "/tree", icon: "device_hub", label: "Referral Tree" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-20 flex-col items-center border-r border-serene-border py-10">
      <div className="mb-12">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-serene-ochre">
          <span className="heading-serif text-xl italic text-serene-ochre">H</span>
        </div>
      </div>
      <nav className="flex flex-col gap-10">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={clsx(
                active ? "text-serene-ochre" : "text-serene-muted hover:text-serene-text"
              )}
            >
              <span className="material-symbols-outlined !text-3xl">{item.icon}</span>
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-serene-border text-[10px] uppercase tracking-widest text-serene-sage">
          HC
        </div>
      </div>
    </aside>
  );
}
