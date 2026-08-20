import Link from "next/link";

export function PublicHeader() {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center px-4 pt-6">
      <Link href="/" className="text-sm font-semibold text-slate-900 hover:text-blue-600">
        ← Hotel Transfer
      </Link>
    </div>
  );
}
