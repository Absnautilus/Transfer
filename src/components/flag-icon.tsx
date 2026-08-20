import * as Flags from "country-flag-icons/react/3x2";

type FlagComponent = (props: { className?: string; title?: string }) => React.JSX.Element;

export function FlagIcon({ iso, className }: { iso: string; className?: string }) {
  const Comp = (Flags as unknown as Record<string, FlagComponent | undefined>)[iso];
  if (!Comp) return null;
  return <Comp className={className} title={iso} />;
}
