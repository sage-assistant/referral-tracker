"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Session } from "@/lib/auth-shared";

const adminNavItems = [
  { href: "/", icon: "grid_view", label: "Dashboard" },
  { href: "/clients", icon: "contacts", label: "Clients" },
  { href: "/payouts", icon: "account_balance", label: "Payouts" },
  { href: "/tree", icon: "device_hub", label: "Referral Tree" }
];

const referrerNavItems = [{ href: "/", icon: "grid_view", label: "Dashboard" }];

export function Sidebar({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const navItems = session?.role === "admin" ? adminNavItems : referrerNavItems;

  if (!session || pathname === "/login") {
    return null;
  }

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
      <div className="mt-auto flex flex-col items-center gap-6">
        <form action="/logout" method="post">
          <button
            aria-label="Logout"
            className="text-serene-muted transition-colors hover:text-serene-text"
            type="submit"
          >
            <span className="material-symbols-outlined !text-3xl">logout</span>
          </button>
        </form>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-serene-border text-[10px] uppercase tracking-widest text-serene-sage">
          {session.username.slice(0, 2)}
        </div>
      </div>
    </aside>
  );
}
