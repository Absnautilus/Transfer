"use client";

import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FieldError, FieldGroup, Input, Label, Textarea } from "@/components/ui/field";
import { PhoneInput } from "@/components/phone-input";
import { computePrice, isValidPriceTiers, type PriceTiers } from "@/lib/pricing";
import { localizedText, type Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/dictionaries";
import { submitTransferRequest } from "./actions";

type Route = {
  id: string;
  pointLabel: string;
  pointCategory: string;
  transferMode: string | null;
  descriptionArrival: unknown;
  descriptionDeparture: unknown;
  durationMinutes: number | null;
  priceTiers: unknown;
};

const ARRIVAL_MODES = ["AEREO", "TRENO", "NAVE", "AUTO", "AUTOBUS"] as const;
type ArrivalMode = (typeof ARRIVAL_MODES)[number];

export function RequestForm({
  hotelSlug,
  hotelName,
  routes,
  locale,
}: {
  hotelSlug: string;
  hotelName: string;
  routes: Route[];
  locale: Locale;
}) {
  const dict = t(locale).guestForm;
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  const points = useMemo(() => Array.from(new Set(routes.map((r) => r.pointLabel))), [routes]);
  const [direction, setDirection] = useState<"ARRIVO" | "PARTENZA">("ARRIVO");
  const [selectedPoint, setSelectedPoint] = useState(points[0] ?? "");
  const modesForPoint = useMemo(() => routes.filter((r) => r.pointLabel === selectedPoint), [routes, selectedPoint]);
  const [selectedRouteId, setSelectedRouteId] = useState(modesForPoint[0]?.id ?? "");
  const selectedRoute = modesForPoint.find((r) => r.id === selectedRouteId) ?? modesForPoint[0];

  const [pax, setPax] = useState(1);
  const [isNightService, setIsNightService] = useState(false);
  const [arrivalMode, setArrivalMode] = useState<ArrivalMode>("AEREO");

  const price = useMemo(() => {
    if (!selectedRoute || !isValidPriceTiers(selectedRoute.priceTiers)) return null;
    return computePrice(selectedRoute.priceTiers as PriceTiers, pax, isNightService);
  }, [selectedRoute, pax, isNightService]);

  function onPointChange(point: string) {
    setSelectedPoint(point);
    const modes = routes.filter((r) => r.pointLabel === point);
    setSelectedRouteId(modes[0]?.id ?? "");
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-800">{dict.submittedTitle}</p>
        <p className="mt-2 text-sm text-emerald-700">{dict.submittedBody.replace("{hotelName}", hotelName)}</p>
      </div>
    );
  }

  if (routes.length === 0) {
    return <p className="text-sm text-slate-500">{dict.noRoutesConfigured}</p>;
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("routeOptionId", selectedRouteId);
    formData.set("direction", direction);
    formData.set("locale", locale);
    if (direction === "ARRIVO") formData.set("arrivalMode", arrivalMode);
    startTransition(async () => {
      const result = await submitTransferRequest(hotelSlug, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="guestName" required>
            {dict.guestName}
          </Label>
          <Input id="guestName" name="guestName" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="roomNumber">{dict.roomNumber}</Label>
          <Input id="roomNumber" name="roomNumber" />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="guestEmail" required>
            {dict.email}
          </Label>
          <Input id="guestEmail" name="guestEmail" type="email" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="bookingNumber">{dict.bookingNumber}</Label>
          <Input id="bookingNumber" name="bookingNumber" />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label required>{dict.phone}</Label>
        <PhoneInput name="guestPhone" required />
      </FieldGroup>

      <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
        <FieldGroup>
          <Label htmlFor="date" required>
            {dict.date}
          </Label>
          <Input id="date" name="date" type="date" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="time" required>
            {dict.time}
          </Label>
          <Input id="time" name="time" type="time" required />
        </FieldGroup>
        <FieldGroup>
          <Label htmlFor="pax" required>
            {dict.pax}
          </Label>
          <Input id="pax" name="pax" type="number" min={1} max={50} value={pax} onChange={(e) => setPax(Number(e.target.value) || 1)} required />
        </FieldGroup>
        <FieldGroup className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isNightService"
              value="true"
              checked={isNightService}
              onChange={(e) => setIsNightService(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            {dict.nightService}
          </label>
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label>{dict.bagsLabel}</Label>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="mb-1 text-xs text-slate-500">{dict.bagsCabin}</p>
            <Input name="bagsCabin" type="number" min={0} max={20} defaultValue={0} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">{dict.bagsStandard}</p>
            <Input name="bagsStandard" type="number" min={0} max={20} defaultValue={0} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">{dict.bagsLarge}</p>
            <Input name="bagsLarge" type="number" min={0} max={20} defaultValue={0} />
          </div>
        </div>
      </FieldGroup>

      <FieldGroup>
        <Label required>{dict.transferLabel}</Label>
        <div className="mb-2 flex gap-4 text-sm text-slate-600">
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={direction === "ARRIVO"} onChange={() => setDirection("ARRIVO")} />
            {dict.directionArrival}
          </label>
          <label className="flex items-center gap-1.5">
            <input type="radio" checked={direction === "PARTENZA"} onChange={() => setDirection("PARTENZA")} />
            {dict.directionDeparture}
          </label>
        </div>

        <p className="mb-1 text-xs text-slate-500">{direction === "ARRIVO" ? dict.fromPrompt : dict.toPrompt}</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {points.map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => onPointChange(p)}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                p === selectedPoint ? "border-purple-600 bg-purple-600 text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        {modesForPoint.length > 0 && (
          <div className="space-y-2">
            {modesForPoint.map((m) => {
              const modePrice =
                isValidPriceTiers(m.priceTiers) ? computePrice(m.priceTiers as PriceTiers, pax, isNightService) : null;
              const description = localizedText(
                direction === "ARRIVO" ? m.descriptionArrival : m.descriptionDeparture,
                locale,
              );
              return (
                <label
                  key={m.id}
                  className={`block cursor-pointer rounded-md border p-3 text-sm ${
                    m.id === selectedRouteId ? "border-purple-600 ring-1 ring-purple-600" : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <input
                        type="radio"
                        name="routeOptionRadio"
                        className="mr-2"
                        checked={m.id === selectedRouteId}
                        onChange={() => setSelectedRouteId(m.id)}
                      />
                      <span className="font-medium text-slate-900">{m.transferMode ?? dict.modeStandardFallback}</span>
                      {m.durationMinutes && (
                        <span className="ml-2 text-xs text-slate-500">
                          ~{m.durationMinutes} {dict.durationSuffix}
                        </span>
                      )}
                      {description && <p className="ml-5 mt-1 text-xs text-slate-500">{description}</p>}
                    </div>
                    <span className="whitespace-nowrap font-semibold text-slate-900">
                      {modePrice != null ? `€ ${modePrice.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {price != null && (
          <p className="mt-2 text-sm text-slate-600">
            {dict.indicativePriceLabel.replace("{pax}", String(pax)).replace("{night}", isNightService ? dict.nightSuffix : "")}:{" "}
            <strong>€ {price.toFixed(2)}</strong>
          </p>
        )}
      </FieldGroup>

      {direction === "ARRIVO" && (
        <FieldGroup>
          <Label required>{dict.arrivalModeQuestion}</Label>
          <div className="mb-2 flex flex-wrap gap-3 text-sm text-slate-600">
            {ARRIVAL_MODES.map((mode) => (
              <label key={mode} className="flex items-center gap-1.5">
                <input type="radio" checked={arrivalMode === mode} onChange={() => setArrivalMode(mode)} />
                {t(locale).arrivalMode[mode]}
              </label>
            ))}
          </div>

          {arrivalMode === "AEREO" && (
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <FieldGroup>
                <Label htmlFor="flightOrTrainNumber">{dict.flightNumberLabel}</Label>
                <Input id="flightOrTrainNumber" name="flightOrTrainNumber" />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="flightOrTrainOrigin">{dict.flightOriginLabel}</Label>
                <Input id="flightOrTrainOrigin" name="flightOrTrainOrigin" />
              </FieldGroup>
            </div>
          )}
          {arrivalMode === "TRENO" && (
            <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
              <FieldGroup>
                <Label htmlFor="flightOrTrainNumber">{dict.trainNumberLabel}</Label>
                <Input id="flightOrTrainNumber" name="flightOrTrainNumber" />
              </FieldGroup>
              <FieldGroup>
                <Label htmlFor="flightOrTrainOrigin">{dict.trainOriginLabel}</Label>
                <Input id="flightOrTrainOrigin" name="flightOrTrainOrigin" />
              </FieldGroup>
            </div>
          )}
          {arrivalMode === "NAVE" && (
            <FieldGroup>
              <Label htmlFor="flightOrTrainNumber">{dict.shipNameLabel}</Label>
              <Input id="flightOrTrainNumber" name="flightOrTrainNumber" />
            </FieldGroup>
          )}
          {(arrivalMode === "AUTO" || arrivalMode === "AUTOBUS") && (
            <FieldGroup className="w-48">
              <Label htmlFor="estimatedArrivalTime">{dict.estimatedArrivalTimeLabel}</Label>
              <Input id="estimatedArrivalTime" name="estimatedArrivalTime" type="time" />
            </FieldGroup>
          )}
        </FieldGroup>
      )}

      <FieldGroup>
        <Label htmlFor="notes">{dict.notesLabel}</Label>
        <Textarea id="notes" name="notes" rows={3} placeholder={dict.notesPlaceholder} />
      </FieldGroup>

      <div className="mb-4 rounded-md bg-slate-50 p-3 text-xs text-slate-500">
        <p className="mb-1 font-medium text-slate-600">{dict.cancellationPolicyTitle}</p>
        {dict.cancellationPolicyText}
      </div>

      <FieldError>{error ?? undefined}</FieldError>

      <Button type="submit" disabled={pending} className="mt-2 w-full">
        {pending ? dict.submitButtonPending : dict.submitButton}
      </Button>
    </form>
  );
}
