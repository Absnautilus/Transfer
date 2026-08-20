import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ROLE_HOME } from "@/lib/constants";

// Landing spot right after login: sends each role to its own dashboard
// instead of dumping everyone back on the marketing homepage.
export default async function DashboardRedirect() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  redirect(ROLE_HOME[session.user.role]);
}
