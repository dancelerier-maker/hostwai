// Same caveat as conversations.ts — swap for a real database before going live
// with more than one server instance. This is what /api/reservations reads,
// and what the dashboard would eventually poll or subscribe to.

export type Reservation = {
  name: string;
  people: number;
  time: string;
  createdAt: string;
};

export type CallLogEntry = {
  callSid: string;
  from: string;
  startedAt: string;
  turns: number;
  transferred: boolean;
};

const reservations: Reservation[] = [];
const callLog: CallLogEntry[] = [];

export function addReservation(r: Omit<Reservation, "createdAt">) {
  reservations.push({ ...r, createdAt: new Date().toISOString() });
}

export function listReservations() {
  return reservations;
}

export function logCall(entry: CallLogEntry) {
  const idx = callLog.findIndex((c) => c.callSid === entry.callSid);
  if (idx >= 0) callLog[idx] = entry;
  else callLog.unshift(entry);
}

export function listCalls() {
  return callLog;
}
