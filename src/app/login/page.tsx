import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Link href="/" className="text-lg font-semibold text-slate-900">
            Hotel Transfer
          </Link>
          <p className="text-sm text-slate-500">Accesso operatori hotel, taxi e autisti</p>
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
      </div>
    </div>
  );
}
