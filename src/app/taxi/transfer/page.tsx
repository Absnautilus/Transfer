import { requireTaxiUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getTransfers } from "@/lib/transfers";
import { TransfersToolbar } from "@/components/transfers-toolbar";
import { TransfersTable } from "@/components/transfers-table";
import { TRANSFER_STATUS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export default async function TaxiTransfersPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; q?: string }>;
}) {
  const user = await requireTaxiUser();
  const { date, q } = await searchParams;
  const [transfers, drivers] = await Promise.all([
    getTransfers({ taxiCompanyId: user.taxiCompanyId }, { date, q }),
    prisma.driver.findMany({ where: { taxiCompanyId: user.taxiCompanyId }, orderBy: { name: "asc" } }),
  ]);

  const awaitingCount = transfers.filter((t) => t.status === TRANSFER_STATUS.AWAITING_TAXI).length;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Transfer</h1>
          <p className="text-sm text-slate-500">Conferma le richieste dell&apos;hotel e assegna gli autisti, anche last minute.</p>
        </div>
        {awaitingCount > 0 && <Badge className="bg-amber-100 text-amber-800">{awaitingCount} da confermare</Badge>}
      </div>
      <TransfersToolbar basePath="/taxi/transfer" />
      <TransfersTable transfers={transfers} scope="taxi" drivers={drivers} />
    </div>
  );
}
