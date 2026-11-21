"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { loginAction, type LoginState } from "@/app/login/actions";
import { Logo } from "@/components/logo";

const initialState: LoginState = null;

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#138A36] focus:ring-2 focus:ring-[#138A36]/20";
const labelClass = "mb-1.5 block text-xs font-bold text-slate-700 uppercase tracking-wider";

export function LoginForm({ created }: { created: boolean }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [emailInput, setEmailInput] = useState("spicegarden@sample.resqmeal.test");
  const [passwordInput, setPasswordInput] = useState("ResQMeal-Demo-2026");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4FBF5] px-4 py-10 text-[#17251C]">
      <Link href="/" aria-label="ResQMeal home" className="mb-6">
        <Logo />
      </Link>

      <div className="w-full max-w-lg rounded-3xl border border-white/90 bg-white/95 p-8 shadow-[0_20px_60px_rgba(7,91,42,0.08)] backdrop-blur sm:p-10">
        <h1 className="text-center text-3xl font-extrabold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Log in to manage donations, claims, and delivery tasks.
        </p>

        {/* 1-Click Demo Profiles */}
        <div className="mt-6 rounded-2xl border border-[#C8EED0] bg-[#E8F7EA]/70 p-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#075B2A]">
            ⚡ 1-Click Demo Quick Access (No Password Needed)
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => router.push("/restaurant")}
              className="rounded-xl border border-slate-200/90 bg-white p-2.5 text-center shadow-sm hover:border-[#138A36] hover:bg-[#F4FBF5] transition"
            >
              <span className="block text-xl">👨‍🍳</span>
              <span className="mt-1 block text-xs font-bold text-slate-800">Spice Garden</span>
              <span className="block text-[10px] text-[#138A36] font-semibold">Restaurant</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/ngo")}
              className="rounded-xl border border-slate-200/90 bg-white p-2.5 text-center shadow-sm hover:border-[#138A36] hover:bg-[#F4FBF5] transition"
            >
              <span className="block text-xl">🏢</span>
              <span className="mt-1 block text-xs font-bold text-slate-800">Hope Found.</span>
              <span className="block text-[10px] text-[#138A36] font-semibold">NGO Kitchen</span>
            </button>
            <button
              type="button"
              onClick={() => router.push("/volunteer")}
              className="rounded-xl border border-slate-200/90 bg-white p-2.5 text-center shadow-sm hover:border-[#138A36] hover:bg-[#F4FBF5] transition"
            >
              <span className="block text-xl">🛵</span>
              <span className="mt-1 block text-xs font-bold text-slate-800">Rahul</span>
              <span className="block text-[10px] text-[#138A36] font-semibold">Volunteer</span>
            </button>
          </div>
        </div>

        {created && (
          <div
            role="status"
            className="mt-6 flex items-start gap-2 rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-800 ring-1 ring-green-200"
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Account created successfully. Please log in.</span>
          </div>
        )}

        <form action={formAction} className="mt-6 space-y-4">
          {state?.error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{state.error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className={labelClass}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              required
              autoComplete="email"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-full bg-[#138A36] py-3.5 text-sm font-extrabold text-white shadow-md shadow-[#138A36]/20 transition hover:bg-[#075B2A] hover:shadow-lg disabled:opacity-60"
          >
            {isPending ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          New to ResQMeal?{" "}
          <Link href="/signup" className="font-extrabold text-[#138A36] hover:underline">
            Choose your role & get started
          </Link>
        </p>
      </div>
    </div>
  );
}
