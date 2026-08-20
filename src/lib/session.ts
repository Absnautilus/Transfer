import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLES } from "@/lib/constants";

export async function requireHotelUser() {
  const session = await auth();
  if (!session?.user || (session.user.role !== ROLES.HOTEL_STAFF && session.user.role !== ROLES.ADMIN) || !session.user.hotelId) {
    redirect("/login");
  }
  return session.user as typeof session.user & { hotelId: string };
}

export async function requireTaxiUser() {
  const session = await auth();
  if (!session?.user || (session.user.role !== ROLES.TAXI_STAFF && session.user.role !== ROLES.ADMIN) || !session.user.taxiCompanyId) {
    redirect("/login");
  }
  return session.user as typeof session.user & { taxiCompanyId: string };
}

export async function requireHotelOrgAdmin() {
  const user = await requireHotelUser();
  if (!user.isOrgAdmin) redirect("/hotel/richieste");
  return user;
}

export async function requireTaxiOrgAdmin() {
  const user = await requireTaxiUser();
  if (!user.isOrgAdmin) redirect("/taxi/transfer");
  return user;
}

export async function requireDriverUser() {
  const session = await auth();
  if (!session?.user || session.user.role !== ROLES.DRIVER || !session.user.driverId) {
    redirect("/login");
  }
  return session.user as typeof session.user & { driverId: string };
}
