// Domain constants shared across the app.
// SQLite has no native enum support, so status/role columns are plain
// strings constrained to these values at the application layer.

export const ROLES = {
  ADMIN: "ADMIN",
  HOTEL_STAFF: "HOTEL_STAFF",
  TAXI_STAFF: "TAXI_STAFF",
  DRIVER: "DRIVER",
} as const;
export type Role = (typeof ROLES)[keyof typeof ROLES];

export const REQUEST_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
} as const;
export type RequestStatus = (typeof REQUEST_STATUS)[keyof typeof REQUEST_STATUS];

export const TRANSFER_STATUS = {
  AWAITING_TAXI: "AWAITING_TAXI",
  CONFIRMED: "CONFIRMED",
  REJECTED_BY_TAXI: "REJECTED_BY_TAXI",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;
export type TransferStatus = (typeof TRANSFER_STATUS)[keyof typeof TRANSFER_STATUS];

export const TRANSFER_STATUS_LABEL: Record<TransferStatus, string> = {
  AWAITING_TAXI: "In attesa conferma taxi",
  CONFIRMED: "Confermato",
  REJECTED_BY_TAXI: "Rifiutato dal taxi",
  ASSIGNED: "Autista assegnato",
  IN_PROGRESS: "In corso",
  COMPLETED: "Completato",
  CANCELLED: "Annullato",
};

export const TRIP_EVENT = {
  ASSIGNED: "ASSIGNED",
  EN_ROUTE: "EN_ROUTE",
  ARRIVED: "ARRIVED",
  STARTED: "STARTED",
  COMPLETED: "COMPLETED",
} as const;
export type TripEvent = (typeof TRIP_EVENT)[keyof typeof TRIP_EVENT];

export const TRIP_EVENT_LABEL: Record<TripEvent, string> = {
  ASSIGNED: "Autista assegnato",
  EN_ROUTE: "Autista in arrivo",
  ARRIVED: "Autista arrivato al punto di ritiro",
  STARTED: "Transfer iniziato",
  COMPLETED: "Transfer completato",
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Amministratore",
  HOTEL_STAFF: "Operatore Hotel",
  TAXI_STAFF: "Operatore Taxi",
  DRIVER: "Autista",
};

export const ROLE_HOME: Record<Role, string> = {
  ADMIN: "/admin",
  HOTEL_STAFF: "/hotel/richieste",
  TAXI_STAFF: "/taxi/transfer",
  DRIVER: "/driver",
};
