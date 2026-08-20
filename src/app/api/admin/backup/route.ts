import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { buildBackupPayload } from "@/lib/backup";

export async function GET() {
  const session = await auth();
  if (!session?.user?.isOrgAdmin) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 403 });
  }

  const payload = await buildBackupPayload();
  const filename = `backup-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
