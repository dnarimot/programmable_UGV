import { useState } from "react";

type ConnectionState = "disconnected" | "connecting" | "connected";

interface NavTestState {
  running: boolean;
  lastResult?: "success" | "error";
}

export default function NavTest() {
  /* ───────────────── State ───────────────── */

  const [ip, setIp] = useState("");
  const [port, setPort] = useState("8000");

  const [connection, setConnection] =
    useState<ConnectionState>("disconnected");

  const [destX, setDestX] = useState(0);
  const [destY, setDestY] = useState(0);
  const [baseSpeed, setBaseSpeed] = useState(0.6);
  const [turnSpeed, setTurnSpeed] = useState(1.0);

  const [navState, setNavState] = useState<NavTestState>({
    running: false,
  });

  const backend = () => `http://${ip}:${port}`;

  /* ───────────────── Connection ───────────────── */

  async function connectBackend() {
    if (!ip || !port) return;

    setConnection("connecting");

    try {
      const res = await fetch(`${backend()}`);
      if (!res.ok) throw new Error();
      setConnection("connected");
    } catch {
      setConnection("disconnected");
    }
  }

  function disconnectBackend() {
    setConnection("disconnected");
    setNavState({ running: false });
  }

  /* ───────────────── Navigation ───────────────── */

  async function startNav() {
    if (connection !== "connected") return;

    setNavState({ running: true });

    try {
      const res = await fetch(`${backend()}/nav/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dest_x: destX,
          dest_y: destY,
          base_speed: baseSpeed,
          turn_speed: turnSpeed,
        }),
      });

      if (!res.ok) throw new Error();

      setNavState({ running: true, lastResult: "success" });
    } catch {
      setNavState({ running: false, lastResult: "error" });
    }
  }

  async function stopNav() {
    if (connection !== "connected") return;

    try {
      await fetch(`${backend()}/nav/stop`, {
        method: "POST",
      });

      setNavState({ running: false });
    } catch {
      setNavState({ running: false, lastResult: "error" });
    }
  }

  /* ───────────────── UI ───────────────── */

  return (
    <section className="min-h-screen bg-black text-gray-100 pt-20 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Connection Bar */}
        <div className="bg-zinc-900/70 border border-white/10 rounded-xl px-4 py-3 flex gap-3 items-center">
          <input
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="Rover IP (e.g. 192.168.0.14)"
            className="bg-zinc-800 px-3 py-1 rounded text-sm w-52"
          />

          <input
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="Port (e.g. 8000)"
            className="bg-zinc-800 px-3 py-1 rounded text-sm w-28"
          />

          {connection === "connected" ? (
            <button
              onClick={disconnectBackend}
              className="px-4 py-1.5 rounded text-sm bg-rose-500/20 text-rose-400"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectBackend}
              disabled={connection === "connecting"}
              className="px-4 py-1.5 rounded text-sm bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-700 disabled:text-gray-500"
            >
              {connection === "connecting" ? "Connecting…" : "Connect"}
            </button>
          )}

          <span
            className={`ml-auto text-xs ${
              connection === "connected"
                ? "text-emerald-400"
                : "text-gray-500"
            }`}
          >
            {connection === "connected"
              ? "Backend Connected"
              : "Backend Disconnected"}
          </span>
        </div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* Left Panel */}
          <div className="bg-zinc-900/70 border border-white/10 rounded-2xl flex items-center justify-center p-6">
            <div className="text-center space-y-3">
              <div className="text-indigo-400 text-lg font-semibold">
                Navigation Unit Test
              </div>
              <div className="text-gray-400 text-sm">
                Sends relative XY coordinates to rover control loop.
              </div>

              {navState.running && (
                <div className="text-emerald-400 text-sm">
                  Navigation Running…
                </div>
              )}

              {navState.lastResult === "error" && (
                <div className="text-rose-400 text-sm">
                  Failed to start navigation
                </div>
              )}
            </div>
          </div>

          {/* Right Rail */}
          <div className="space-y-4">
            {/* Destination */}
            <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4">
              <h3 className="text-indigo-400 mb-3 text-sm font-semibold">
                Destination (Relative XY)
              </h3>

              <label className="text-xs text-gray-400">X (meters)</label>
              <input
                type="number"
                value={destX}
                onChange={(e) => setDestX(Number(e.target.value))}
                className="w-full bg-zinc-800 rounded px-2 py-1 mb-3"
              />

              <label className="text-xs text-gray-400">Y (meters)</label>
              <input
                type="number"
                value={destY}
                onChange={(e) => setDestY(Number(e.target.value))}
                className="w-full bg-zinc-800 rounded px-2 py-1"
              />
            </div>

            {/* Speed Controls */}
            <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4">
              <h3 className="text-indigo-400 mb-3 text-sm font-semibold">
                Speed Configuration
              </h3>

              <label className="text-xs text-gray-400">
                Base Speed ({baseSpeed})
              </label>
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={baseSpeed}
                onChange={(e) => setBaseSpeed(Number(e.target.value))}
                className="w-full accent-indigo-500 mb-4"
              />

              <label className="text-xs text-gray-400">
                Turn Speed ({turnSpeed})
              </label>
              <input
                type="range"
                min={0}
                max={3}
                step={0.1}
                value={turnSpeed}
                onChange={(e) => setTurnSpeed(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Control Buttons */}
            <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4">
              <button
                onClick={startNav}
                disabled={
                  connection !== "connected" || navState.running
                }
                className={`w-full py-2 rounded text-sm font-medium ${
                  navState.running
                    ? "bg-zinc-700 text-gray-400"
                    : "bg-emerald-500 hover:bg-emerald-400"
                }`}
              >
                {navState.running ? "Running…" : "Start Navigation"}
              </button>

              <button
                onClick={stopNav}
                disabled={connection !== "connected"}
                className="w-full mt-2 py-2 rounded text-sm bg-rose-600 hover:bg-rose-500 text-white"
              >
                Force Stop
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
