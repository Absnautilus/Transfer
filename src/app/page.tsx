import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LinkButton } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { LogoMark } from "@/components/logo";

// Lists hotels from the database — must read at request time, not be
// baked into a static page at build time (new hotels wouldn't show up,
// and the build itself would depend on the database being reachable).
export const dynamic = "force-dynamic";

export default async function Home() {
  const hotels = await prisma.hotel.findMany({ select: { name: true, slug: true }, orderBy: { createdAt: "asc" } });

  // For now this is a single-hotel pilot: guests should land directly on
  // their hotel's questionnaire instead of picking from a list. Once
  // multiple hotels are really in use, this should become guest-account
  // based routing instead of an env-configured default.
  if (hotels.length > 0) {
    const primarySlug = process.env.PRIMARY_HOTEL_SLUG;
    const primaryHotel = (primarySlug && hotels.find((h) => h.slug === primarySlug)) || hotels[0];
    redirect(`/richiedi/${primaryHotel.slug}`);
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 py-16">
      <div className="w-full max-w-3xl text-center">
        <LogoMark className="mx-auto h-12 w-12" />
        <p className="mt-3 text-sm font-medium uppercase tracking-wide text-purple-600">FromTo</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
          Just choose your transfer, we take care of the rest.
        </h1>
        <p className="mt-4 text-slate-600">
          Richieste ospiti, verifica dell&apos;operatore hotel, conferma della compagnia taxi, assegnazione autisti e stato del
          viaggio condiviso in tempo reale — tutto in un unico flusso.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="flex flex-col items-center p-2 text-center">
            <CardBody className="flex flex-1 flex-col items-center">
              <h2 className="text-lg font-semibold text-slate-900">Hai bisogno di un transfer?</h2>
              <p className="mt-1 flex-1 text-sm text-slate-500">Nessun hotel configurato al momento.</p>
              <Link href="/miei-transfer" className="mt-3 text-sm text-slate-500 underline hover:text-slate-700">
                Hai già inviato una richiesta? Controlla lo stato
              </Link>
            </CardBody>
          </Card>

          <Card className="flex flex-col items-center p-2 text-center">
            <CardBody className="flex flex-1 flex-col items-center">
              <h2 className="text-lg font-semibold text-slate-900">Sei un operatore?</h2>
              <p className="mt-1 flex-1 text-sm text-slate-500">
                Accedi alla dashboard del tuo hotel, della tua compagnia taxi, o come autista.
              </p>
              <div className="mt-4 w-full">
                <LinkButton href="/login" variant="primary" className="w-full">
                  Accedi
                </LinkButton>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
