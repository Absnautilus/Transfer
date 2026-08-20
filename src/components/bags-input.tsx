import { Input, Label } from "@/components/ui/field";

export function BagsInput({
  cabinDefault = 0,
  standardDefault = 0,
  largeDefault = 0,
  labels,
}: {
  cabinDefault?: number;
  standardDefault?: number;
  largeDefault?: number;
  labels?: { cabin: string; standard: string; large: string };
}) {
  const l = labels ?? {
    cabin: "Cabina (≤ 55×40×20 cm)",
    standard: "Stiva standard (≤ 23 kg)",
    large: "Grande / voluminoso",
  };
  return (
    <div>
      <Label>Bagagli</Label>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="mb-1 text-xs text-slate-500">{l.cabin}</p>
          <Input name="bagsCabin" type="number" min={0} max={20} defaultValue={cabinDefault} />
        </div>
        <div>
          <p className="mb-1 text-xs text-slate-500">{l.standard}</p>
          <Input name="bagsStandard" type="number" min={0} max={20} defaultValue={standardDefault} />
        </div>
        <div>
          <p className="mb-1 text-xs text-slate-500">{l.large}</p>
          <Input name="bagsLarge" type="number" min={0} max={20} defaultValue={largeDefault} />
        </div>
      </div>
    </div>
  );
}
