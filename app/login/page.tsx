import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getSession } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16 sm:px-6">
      <div className="editorial-panel w-full max-w-md rounded-3xl border-serene-border bg-serene-slate/30 px-5 py-10 shadow-serene sm:px-8 md:px-10">
        <div className="mb-10 text-center">
          <p className="editorial-label mb-4">OpenClaw Referral Tracker</p>
          <h1 className="heading-serif text-4xl italic tracking-tight text-white sm:text-5xl">Private Entry</h1>
          <p className="mt-4 text-sm leading-7 text-serene-muted">
            Sign in to view your referral records and payout history.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
