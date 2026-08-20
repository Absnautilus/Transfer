import { startOfMonth, endOfMonth, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireHotelOrgAdmin } from "@/lib/session";
import { AccountingView } from "@/components/accounting-view";
import { TRANSFER_STATUS } from "@/lib/constants";

export default async function HotelContabilitaPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string }> }) {
  const user = await requireHotelOrgAdmin();
  const { from: fromParam, to: toParam } = await searchParams;
  const from = fromParam ?? format(startOfMonth(new Date()), "yyyy-MM-dd");
  const to = toParam ?? format(endOfMonth(new Date()), "yyyy-MM-dd");

  const rows = await prisma.transfer.findMany({
    where: { hotelId: user.hotelId, status: TRANSFER_STATUS.COMPLETED, date: { gte: from, lte: to } },
    select: { id: true, date: true, guestName: true, price: true, commissionRateSnapshot: true },
    orderBy: { date: "desc" },
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Contabilità</h1>
      <p className="mb-4 text-sm text-slate-500">Transfer completati, fatturato e provvigioni per la compagnia taxi.</p>
      <AccountingView rows={rows} from={from} to={to} />
    </div>
  );
}
