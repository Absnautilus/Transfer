import type { Role } from "@/lib/constants";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    hotelId: string | null;
    taxiCompanyId: string | null;
    driverId: string | null;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      hotelId: string | null;
      taxiCompanyId: string | null;
      driverId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    hotelId: string | null;
    taxiCompanyId: string | null;
    driverId: string | null;
  }
}
