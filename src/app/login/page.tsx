import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm flex-shrink-0 rounded-xl border border-slate-200 bg-white px-8 pb-7 pt-9 shadow-md">
        <div className="mx-auto mb-4 flex h-[50px] w-[50px] items-center justify-center rounded-2xl bg-purple-600 text-white shadow-[0_8px_20px_-6px_var(--color-purple-600)]">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
          </svg>
        </div>
        <p className="text-center text-[10px] font-extrabold uppercase tracking-widest text-purple-600">FromTo</p>
        <h1 className="mt-1.5 text-center text-lg font-extrabold text-slate-900">Accedi</h1>
        <p className="mx-auto mt-1.5 max-w-[230px] text-center text-xs leading-relaxed text-slate-500">
          Accesso operatori hotel, taxi e autisti
        </p>

        <div className="mt-6">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          <Link href="/" className="font-semibold text-purple-600 hover:underline">
            ← Torna alla home
          </Link>
        </p>
      </div>
    </div>
  );
}
