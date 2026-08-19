import { sendMail } from "@/lib/mail";

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

export async function sendRequestAcceptedEmail(params: {
  guestEmail: string;
  guestName: string;
  hotelName: string;
  date: string;
  time: string;
  routeFrom: string;
  routeTo: string;
  trackingToken: string;
}) {
  const { guestEmail, guestName, hotelName, date, time, routeFrom, routeTo, trackingToken } = params;
  const trackingUrl = `${APP_URL}/traccia/${trackingToken}`;
  const subject = `Transfer confermato — ${hotelName}`;
  const text = `Gentile ${guestName},\n\nIl suo transfer è stato confermato da ${hotelName}.\n\nData: ${date} alle ${time}\nTratta: ${routeFrom} → ${routeTo}\n\nPuò seguire lo stato del transfer qui: ${trackingUrl}\n\nGrazie,\n${hotelName}`;
  const html = `
    <p>Gentile ${guestName},</p>
    <p>Il suo transfer è stato <strong>confermato</strong> da ${hotelName}.</p>
    <table cellpadding="4">
      <tr><td>Data</td><td><strong>${date} alle ${time}</strong></td></tr>
      <tr><td>Tratta</td><td><strong>${routeFrom} → ${routeTo}</strong></td></tr>
    </table>
    <p><a href="${trackingUrl}">Segui lo stato del tuo transfer</a></p>
    <p>Grazie,<br/>${hotelName}</p>
  `;
  await sendMail({ to: guestEmail, subject, html, text });
}

export async function sendRequestRejectedEmail(params: {
  guestEmail: string;
  guestName: string;
  hotelName: string;
  reason: string;
}) {
  const { guestEmail, guestName, hotelName, reason } = params;
  const subject = `Richiesta transfer — ${hotelName}`;
  const text = `Gentile ${guestName},\n\nLa sua richiesta di transfer non può essere confermata così come inviata.\n\nMotivo: ${reason}\n\nLa contattiamo a breve per definire i dettagli. Può anche rispondere a questa email.\n\n${hotelName}`;
  const html = `
    <p>Gentile ${guestName},</p>
    <p>La sua richiesta di transfer non può essere confermata così come inviata.</p>
    <p><strong>Motivo:</strong> ${reason}</p>
    <p>La contattiamo a breve per definire i dettagli. Può anche rispondere a questa email.</p>
    <p>${hotelName}</p>
  `;
  await sendMail({ to: guestEmail, subject, html, text });
}
