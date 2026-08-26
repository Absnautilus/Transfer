import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EditTaxiCompanyForm } from "../edit-taxi-company-form";

export default async function EditTaxiCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;

  const taxiCompany = await prisma.taxiCompany.findUnique({ where: { id } });
  if (!taxiCompany) notFound();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-slate-900">Modifica compagnia taxi</h1>
      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-700">{taxiCompany.name}</h2>
        </CardHeader>
        <CardBody>
          <EditTaxiCompanyForm taxiCompany={taxiCompany} />
        </CardBody>
      </Card>
    </div>
  );
}
