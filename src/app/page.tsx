import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";

export default async function Home() {
  const hotels = await prisma.hotel.findMany({ select: { name: true, slug: true }, take: 5 });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-2xl text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-blue-600">Hotel Transfer</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Gestione automatizzata dei transfer organizzati dall&apos;hotel
        </h1>
        <p className="mt-4 text-slate-600">
          Richieste ospiti, verifica dell&apos;operatore hotel, conferma della compagnia taxi, assegnazione autisti e stato del
          viaggio condiviso in tempo reale — tutto in un unico flusso.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <LinkButton href="/login" variant="primary">
            Accesso operatori
          </LinkButton>
        </div>

        {hotels.length > 0 && (
          <Card className="mt-10 text-left">
            <CardBody>
              <p className="mb-2 text-sm font-semibold text-slate-700">Questionario ospite (demo)</p>
              <ul className="space-y-1">
                {hotels.map((h) => (
                  <li key={h.slug}>
                    <Link href={`/richiedi/${h.slug}`} className="text-sm text-blue-600 hover:underline">
                      {h.name} — /richiedi/{h.slug}
                    </Link>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
