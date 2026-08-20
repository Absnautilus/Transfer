import { prisma } from "@/lib/prisma";
import { requireHotelOrgAdmin } from "@/lib/session";
import { TeamTable } from "@/components/team-table";
import { setHotelStaffAdmin } from "./actions";

export default async function HotelTeamPage() {
  const user = await requireHotelOrgAdmin();
  const members = await prisma.user.findMany({ where: { hotelId: user.hotelId }, orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold text-slate-900">Team</h1>
      <p className="mb-4 text-sm text-slate-500">
        Gli amministratori vedono la contabilità e possono gestire i permessi degli altri operatori.
      </p>
      <TeamTable members={members} currentUserId={user.id} onToggleAdmin={setHotelStaffAdmin} />

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-700">Backup dati</p>
        <p className="mt-1 text-xs text-slate-500">
          Scarica un export completo di richieste e transfer in formato JSON, da conservare come copia di sicurezza.
        </p>
        <a
          href="/api/admin/backup"
          className="mt-2 inline-block rounded-md bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
        >
          Scarica backup
        </a>
      </div>
    </div>
  );
}
