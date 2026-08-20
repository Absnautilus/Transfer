import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="inline-flex justify-center hover:opacity-80">
            <Logo textClassName="text-lg font-semibold text-slate-900" />
          </Link>
          <p className="mt-1 text-sm text-slate-500">Accesso operatori hotel, taxi e autisti</p>
        </div>
        <Card>
          <CardHeader>
            <h1 className="text-base font-semibold text-slate-900">Accedi</h1>
          </CardHeader>
          <CardBody>
            <Suspense>
              <LoginForm />
            </Suspense>
          </CardBody>
        </Card>
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-purple-600 hover:underline">
            ← Torna alla home
          </Link>
        </p>
      </div>
    </div>
  );
}
