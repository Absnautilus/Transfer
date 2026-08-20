import Link from "next/link";
import { Logo } from "@/components/logo";

export function PublicHeader() {
  return (
    <div className="mx-auto flex w-full max-w-3xl items-center px-4 pt-6">
      <Link href="/" className="hover:opacity-80">
        <Logo />
      </Link>
    </div>
  );
}
