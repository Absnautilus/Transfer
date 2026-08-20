// Next.js server actions signal navigation by throwing a special error with
// a digest starting with "NEXT_REDIRECT". A client component that awraps a
// redirecting action in try/catch must let that specific throw propagate —
// otherwise the catch swallows it, the navigation never happens, and the
// user sees a false "something went wrong" even though the write succeeded.
export function isRedirectError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
