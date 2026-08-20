import { prisma } from "@/lib/prisma";

type NotificationInput = { type: string; title: string; body?: string; link?: string };

export async function notifyUsers(userIds: string[], data: NotificationInput) {
  if (userIds.length === 0) return;
  await prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, type: data.type, title: data.title, body: data.body, link: data.link })),
  });
}

export async function notifyHotelStaff(hotelId: string, data: NotificationInput) {
  const users = await prisma.user.findMany({ where: { hotelId }, select: { id: true } });
  await notifyUsers(users.map((u) => u.id), data);
}

export async function notifyTaxiStaff(taxiCompanyId: string, data: NotificationInput) {
  const users = await prisma.user.findMany({ where: { taxiCompanyId }, select: { id: true } });
  await notifyUsers(users.map((u) => u.id), data);
}
