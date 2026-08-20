// Guest-facing status bucket — collapses internal coordination states
// (AWAITING_TAXI, REJECTED_BY_TAXI) into "accepted by the hotel" so the
// guest never sees taxi-side coordination detail that isn't theirs to
// worry about; the hotel/taxi staff dashboards keep the granular status.
export type GuestStatusBucket = "ACCEPTED" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export function toGuestStatusBucket(status: string): GuestStatusBucket {
  switch (status) {
    case "CONFIRMED":
    case "ASSIGNED":
      return "CONFIRMED";
    case "IN_PROGRESS":
      return "IN_PROGRESS";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
      return "CANCELLED";
    case "AWAITING_TAXI":
    case "REJECTED_BY_TAXI":
    default:
      return "ACCEPTED";
  }
}
