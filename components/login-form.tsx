"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/app/login/actions";

const initialState = { error: null as string | null };

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="editorial-button w-full rounded-full" disabled={pending} type="submit">
      {pending ? "Signing In" : "Sign In"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label className="editorial-label block" htmlFor="username">
          Username
        </label>
        <input
          autoComplete="username"
          className="editorial-input rounded-2xl"
          id="username"
          name="username"
          placeholder="Enter username"
          required
          type="text"
        />
      </div>
      <div className="space-y-2">
        <label className="editorial-label block" htmlFor="password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="editorial-input rounded-2xl"
          id="password"
          name="password"
          placeholder="Enter password"
          required
          type="password"
        />
      </div>
      {state.error ? <p className="text-sm text-serene-ochre">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
