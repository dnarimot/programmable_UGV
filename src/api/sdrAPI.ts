// src/api/sdrApi.ts

export type SDRDirection = "rx" | "tx";

export interface ApplySDRPayload {
  uri: string;
  frequency: number;   // MHz
  bandwidth: number;   // MHz
  sampleRate: number;  // MS/s
  gainMode: string;
  gainValue: number;
  direction: SDRDirection;
}

export async function applySDR(
  roverIp: string,
  roverPort: string,
  payload: ApplySDRPayload,
) {
  const res = await fetch(`http://${roverIp}:${roverPort}/sdr/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to apply SDR");
  }

  return res.json();
}

export async function verifySDR(
  roverIp: string,
  roverPort: string,
  uri: string,
) {
  const res = await fetch(`http://${roverIp}:${roverPort}/sdr/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uri }),
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || "Failed to verify SDR");
  }

  return res.json();
}
