import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });
  return transporter;
}

export async function sendMail(options: { to: string; subject: string; html: string; text: string }) {
  const { to, subject, html, text } = options;
  if (!to) return;

  const client = getTransporter();
  let status: "SENT" | "FAILED" = "SENT";
  let error: string | undefined;

  if (client) {
    try {
      await client.sendMail({
        from: process.env.SMTP_FROM ?? "Hotel Transfer <no-reply@hoteltransfer.local>",
        to,
        subject,
        html,
        text,
      });
    } catch (err) {
      status = "FAILED";
      error = err instanceof Error ? err.message : String(err);
    }
  } else {
    // Dev fallback: no SMTP configured, just log so the flow is still visible.
    console.log(`\n--- [DEV MAIL] to:${to} | ${subject} ---\n${text}\n---\n`);
  }

  await prisma.emailLog.create({
    data: { to, subject, body: text, status, error },
  });
}
