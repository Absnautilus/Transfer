import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EditUserForm } from "../edit-user-form";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: { hotel: { select: { name: true } }, taxiCompany: { select: { name: true } } },
  });
  if (!user) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Modifica utente</h1>
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">{user.name}</h2>
        </CardHeader>
        <CardBody>
          <EditUserForm
            user={{
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              isOrgAdmin: user.isOrgAdmin,
              org: user.hotel?.name ?? user.taxiCompany?.name ?? null,
            }}
          />
        </CardBody>
      </Card>
    </div>
  );
}
