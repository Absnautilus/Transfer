"use server";

import { lookupFlight, arrivalTimesDiffer } from "@/lib/flight-lookup";

export type FlightCheckResult =
  | { status: "not_configured" }
  | { status: "not_found" }
  | { status: "error" }
  | { status: "ok"; scheduledArrivalTime: string; mismatch: boolean };

// Operator-facing flight check (hotel review, confirmed transfers). Not
// exposed to guests — staff verify the flight, not the person booking it.
export async function checkFlight(flightNumber: string, date: string, enteredTime: string): Promise<FlightCheckResult> {
  if (!flightNumber.trim() || !date) return { status: "error" };

  const result = await lookupFlight(flightNumber.trim(), date);
  if (result.status !== "found") return { status: result.status === "error" ? "error" : result.status };
  if (!result.scheduledArrivalTime) return { status: "error" };

  return {
    status: "ok",
    scheduledArrivalTime: result.scheduledArrivalTime,
    mismatch: arrivalTimesDiffer(result.scheduledArrivalTime, enteredTime),
  };
}
