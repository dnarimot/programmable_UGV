import { useState } from "react";

/* ───────────────── Types ───────────────── */
interface GridPosition {
  row: number;
  col: number;
}

interface NavConfig {
  baseSpeed: number;
  turnSpeed: number;
  positionEpsilon: number;
  headingTolerance: number;
}

interface SDRConfig {
  frequency: number;
  bandwidth: number;
  sampleRate: number;
  gainMode: "auto" | "manual";
  gainValue: number;
  direction: "rx" | "tx";
  channel: string;
}

interface NavTestState {
  running: boolean;
  lastResult?: "success" | "error";
}

type ConnectionState = "disconnected" | "connecting" | "connected";

interface RoverInstance {
  id: string;
  ip: string;
  port: string;
  connection: ConnectionState;
  robotPos: GridPosition;
  waypoints: GridPosition[];
  nav: NavConfig;
  navTest: NavTestState;
  sdr: SDRConfig;
}

/* ───────────────── Utils ───────────────── */
const isValidIPv4 = (ip: string) =>
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/.test(
    ip,
  );

/* ───────────────── Component ───────────────── */
export const Connect = () => {
  const gridSize = 10;

  const [instances, setInstances] = useState<RoverInstance[]>([
    {
      id: "rover-1",
      ip: "",
      port: "",
      connection: "disconnected",
      robotPos: { row: 4, col: 4 },
      waypoints: [],
      nav: {
        baseSpeed: 0.6,
        turnSpeed: 1.0,
        positionEpsilon: 2,
        headingTolerance: 20,
      },
      navTest: {
        running: false,
      },
      sdr: {
        frequency: 2400,
        bandwidth: 5,
        sampleRate: 5,
        gainMode: "auto",
        gainValue: 40,
        direction: "rx",
        channel: "A",
      },
    },
  ]);

  const [activeId, setActiveId] = useState("rover-1");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const active = instances.find((i) => i.id === activeId)!;
  const ipValid = isValidIPv4(active.ip);

  /* ───────────────── Helpers ───────────────── */
  const updateActive = (patch: Partial<RoverInstance>) =>
    setInstances((prev) =>
      prev.map((i) => (i.id === activeId ? { ...i, ...patch } : i)),
    );

  const updateNav = (patch: Partial<NavConfig>) =>
    setInstances((prev) =>
      prev.map((i) =>
        i.id === activeId ? { ...i, nav: { ...i.nav, ...patch } } : i,
      ),
    );

  const updateSDR = (patch: Partial<SDRConfig>) =>
    setInstances((prev) =>
      prev.map((i) =>
        i.id === activeId ? { ...i, sdr: { ...i.sdr, ...patch } } : i,
      ),
    );

  /* ───────────────── Connection ───────────────── */
  const connect = () => {
    if (!ipValid || !active.port) return;
    updateActive({ connection: "connecting" });
    setTimeout(() => updateActive({ connection: "connected" }), 700);
  };

  const disconnect = () => updateActive({ connection: "disconnected" });

  /* ───────────────── Movement Test (Test.tsx style) ───────────────── */
  const runMovementTest = async () => {
    if (active.connection !== "connected") return;

    updateActive({
      navTest: { running: true, lastResult: undefined },
    });

    try {
      const res = await fetch(
        `http://${active.ip}:${active.port}/test/movement`,
        { method: "POST" },
      );

      if (!res.ok) throw new Error("Request failed");

      updateActive({
        navTest: { running: false, lastResult: "success" },
      });
    } catch (err) {
      console.error(err);
      updateActive({
        navTest: { running: false, lastResult: "error" },
      });
    }
  };

  /* ───────────────── Instance Mgmt ───────────────── */
  const addInstance = () => {
    const id = `rover-${instances.length + 1}`;
    setInstances([
      ...instances,
      {
        ...instances[0],
        id,
        ip: "",
        port: "",
        connection: "disconnected",
        navTest: { running: false },
      },
    ]);
    setActiveId(id);
  };

  const deleteInstance = () => {
    if (!deleteTarget) return;
    const remaining = instances.filter((i) => i.id !== deleteTarget);
    setInstances(remaining);
    setActiveId(remaining[0].id);
    setDeleteTarget(null);
  };

  /* ───────────────── UI ───────────────── */
  return (
    <section className="h-screen bg-black text-gray-100 pt-20 px-4 overflow-hidden">
      {/* ───────── Connection Bar ───────── */}
      <div className="max-w-7xl mx-auto mb-3">
        <div className="flex items-center gap-3 bg-zinc-900/70 border border-white/10 rounded-xl px-4 py-2">
          <input
            value={active.ip}
            onChange={(e) => updateActive({ ip: e.target.value })}
            placeholder="IP Address"
            className={`bg-zinc-800 px-3 py-1 rounded text-sm w-40 ${
              active.ip && !ipValid ? "border border-rose-500" : ""
            }`}
          />
          <input
            value={active.port}
            onChange={(e) => updateActive({ port: e.target.value })}
            placeholder="Port"
            className="bg-zinc-800 px-3 py-1 rounded text-sm w-24"
          />

          {active.connection === "connected" ? (
            <button
              onClick={disconnect}
              className="px-4 py-1.5 rounded text-sm bg-rose-500/20 text-rose-400"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connect}
              disabled={!ipValid || !active.port}
              className={`px-4 py-1.5 rounded text-sm ${
                !ipValid || !active.port
                  ? "bg-zinc-700 text-gray-500"
                  : active.connection === "connecting"
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-indigo-500 hover:bg-indigo-400"
              }`}
            >
              {active.connection === "connecting" ? "Connecting…" : "Connect"}
            </button>
          )}

          <span className="text-xs text-gray-400">● {active.connection}</span>

          <div className="ml-auto flex gap-2">
            {instances.map((i) => (
              <div key={i.id} className="flex gap-1">
                <button
                  onClick={() => setActiveId(i.id)}
                  className={`px-3 py-1 text-xs rounded ${
                    i.id === activeId
                      ? "bg-indigo-500"
                      : "bg-zinc-800 text-gray-400"
                  }`}
                >
                  {i.id}
                </button>
                {instances.length > 1 && (
                  <button
                    onClick={() => setDeleteTarget(i.id)}
                    className="text-gray-500 hover:text-rose-400 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addInstance}
              className="px-2 py-1 text-xs rounded bg-zinc-800"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {deleteTarget && (
        <div className="max-w-7xl mx-auto mb-3 bg-rose-500/10 border border-rose-500/30 rounded px-4 py-3 flex justify-between">
          <span className="text-sm text-rose-300">
            Delete <b>{deleteTarget}</b>? This cannot be undone.
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setDeleteTarget(null)}
              className="px-3 py-1 text-xs bg-zinc-800 rounded"
            >
              Cancel
            </button>
            <button
              onClick={deleteInstance}
              className="px-3 py-1 text-xs bg-rose-500 text-white rounded"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* ───────── Main Layout ───────── */}
      <div
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4"
        style={{ height: "calc(100vh - 170px)" }}
      >
        {/* Grid */}
        <div className="bg-zinc-900/70 border border-white/10 rounded-2xl flex items-center justify-center">
          <div className="w-full max-w-[600px] aspect-square bg-zinc-800 rounded-lg overflow-hidden">
            {Array.from({ length: gridSize }).map((_, r) => (
              <div key={r} className="flex">
                {Array.from({ length: gridSize }).map((_, c) => {
                  const isRobot =
                    r === active.robotPos.row && c === active.robotPos.col;
                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() =>
                        updateActive({ robotPos: { row: r, col: c } })
                      }
                      className={`flex-1 aspect-square border border-zinc-700 ${
                        isRobot ? "bg-indigo-500" : "hover:bg-zinc-700"
                      }`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Right Rail */}
        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Navigation */}
          <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4">
            <h3 className="text-indigo-400 mb-2 text-sm font-semibold">
              Navigation
            </h3>

            <label className="text-xs text-gray-400">
              Base Speed ({active.nav.baseSpeed})
            </label>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={active.nav.baseSpeed}
              onChange={(e) => updateNav({ baseSpeed: Number(e.target.value) })}
              className="w-full accent-indigo-500 mb-2"
            />

            <label className="text-xs text-gray-400">
              Turn Speed ({active.nav.turnSpeed})
            </label>
            <input
              type="range"
              min={0}
              max={3}
              step={0.1}
              value={active.nav.turnSpeed}
              onChange={(e) => updateNav({ turnSpeed: Number(e.target.value) })}
              className="w-full accent-indigo-500 mb-2"
            />

            <label className="text-xs text-gray-400">
              Position Epsilon (m)
            </label>
            <input
              type="number"
              value={active.nav.positionEpsilon}
              onChange={(e) =>
                updateNav({ positionEpsilon: Number(e.target.value) })
              }
              className="w-full bg-zinc-800 rounded px-2 py-1 mb-2"
            />

            <label className="text-xs text-gray-400">
              Heading Tolerance (°)
            </label>
            <input
              type="range"
              min={0}
              max={180}
              value={active.nav.headingTolerance}
              onChange={(e) =>
                updateNav({ headingTolerance: Number(e.target.value) })
              }
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Test Rover Movement */}
          <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4">
            <h3 className="text-emerald-400 mb-2 text-sm font-semibold">
              Test Rover Movement
            </h3>

            <p className="text-xs text-gray-400 mb-3">
              Runs a predefined movement test using current navigation settings.
            </p>

            <button
              onClick={runMovementTest}
              disabled={
                active.connection !== "connected" || active.navTest.running
              }
              className={`w-full py-2 rounded text-sm font-medium ${
                active.navTest.running
                  ? "bg-zinc-700 text-gray-400"
                  : "bg-emerald-500 hover:bg-emerald-400"
              }`}
            >
              {active.navTest.running ? "Running Test…" : "Run Movement Test"}
            </button>

            {active.navTest.lastResult && (
              <p
                className={`text-xs mt-2 ${
                  active.navTest.lastResult === "success"
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {active.navTest.lastResult === "success"
                  ? "Movement test completed successfully"
                  : "Movement test failed"}
              </p>
            )}
          </div>

          {/* SDR */}
          <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4">
            <h3 className="text-pink-400 mb-2 text-sm font-semibold">
              SDR Configuration
            </h3>

            <input
              type="number"
              value={active.sdr.frequency}
              onChange={(e) => updateSDR({ frequency: Number(e.target.value) })}
              className="w-full bg-zinc-800 rounded px-2 py-1 mb-2"
            />

            <select
              value={active.sdr.bandwidth}
              onChange={(e) => updateSDR({ bandwidth: Number(e.target.value) })}
              className="w-full bg-zinc-800 rounded px-2 py-1 mb-2"
            >
              <option value={1}>1 MHz</option>
              <option value={5}>5 MHz</option>
              <option value={10}>10 MHz</option>
            </select>

            <select
              value={active.sdr.sampleRate}
              onChange={(e) =>
                updateSDR({ sampleRate: Number(e.target.value) })
              }
              className="w-full bg-zinc-800 rounded px-2 py-1 mb-2"
            >
              <option value={1}>1 MS/s</option>
              <option value={5}>5 MS/s</option>
              <option value={10}>10 MS/s</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};
