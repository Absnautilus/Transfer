import { requireHotelUser } from "@/lib/session";
import { getTransfers } from "@/lib/transfers";
import { TransfersToolbar } from "@/components/transfers-toolbar";
import { TransfersTable } from "@/components/transfers-table";
import { LinkButton } from "@/components/ui/button";

export default async function HotelTransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; q?: string }>;
}) {
  const user = await requireHotelUser();
  const { date, q } = await searchParams;
  const transfers = await getTransfers({ hotelId: user.hotelId }, { date, q });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Transfer confermati</h1>
          <p className="text-sm text-slate-500">Tabella condivisa con la compagnia taxi.</p>
        </div>
        <LinkButton href="/hotel/transfer/nuovo" variant="secondary" size="sm">
          + Nuovo transfer
        </LinkButton>
      </div>
      <TransfersToolbar basePath="/hotel/transfer" />
      <TransfersTable transfers={transfers} scope="hotel" />
    </div>
  );
}
