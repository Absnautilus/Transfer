// Flight-monitor integration point — provider-agnostic on purpose so a
// specific service (AeroDataBox, AviationStack, FlightAware AeroAPI, …)
// can be plugged in later without touching callers. Until FLIGHT_LOOKUP_API_KEY
// (and a provider implementation below) are set up, lookupFlight always
// returns "not_configured" and the UI degrades to a no-op gracefully.
export type FlightLookupResult =
  | { status: "not_configured" }
  | { status: "not_found" }
  | { status: "error"; message: string }
  | { status: "found"; flightNumber: string; scheduledArrivalTime: string | null; airline?: string; origin?: string };

// `date` is the transfer date (YYYY-MM-DD) the guest entered, used to
// disambiguate a flight number that flies on multiple days.
export async function lookupFlight(flightNumber: string, date: string): Promise<FlightLookupResult> {
  const apiKey = process.env.FLIGHT_LOOKUP_API_KEY;
  if (!apiKey) return { status: "not_configured" };
  void flightNumber;
  void date;

  // TODO: once a provider is chosen, call it here and map its response to
  // FlightLookupResult, e.g. for AeroDataBox (RapidAPI):
  //
  //   const res = await fetch(
  //     `https://aerodatabox.p.rapidapi.com/flights/number/${flightNumber}/${date}`,
  //     { headers: { "X-RapidAPI-Key": apiKey, "X-RapidAPI-Host": "aerodatabox.p.rapidapi.com" } },
  //   );
  //   if (res.status === 404) return { status: "not_found" };
  //   if (!res.ok) return { status: "error", message: `Flight API returned ${res.status}` };
  //   const data = await res.json();
  //   ... map data to { status: "found", flightNumber, scheduledArrivalTime, airline, origin }

  return { status: "not_configured" };
}

// Compares the flight's scheduled arrival (HH:mm) against the time the
// guest entered in the questionnaire, with a tolerance window since the
// requested pickup time is rarely the exact minute of touchdown.
export function arrivalTimesDiffer(scheduledArrivalTime: string, enteredTime: string, toleranceMinutes = 90): boolean {
  const [sh, sm] = scheduledArrivalTime.split(":").map(Number);
  const [eh, em] = enteredTime.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return false;
  const diff = Math.abs(sh * 60 + sm - (eh * 60 + em));
  return diff > toleranceMinutes;
}
