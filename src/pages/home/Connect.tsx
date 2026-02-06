import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  createRover,
  deleteRover,
  fetchRovers,
  updateRoverConfig,
  type RoverDbRow,
} from "../../lib/roverApi";
import { useRover } from "../../context/RoverContext";
import RoverSelector from "../../components/RoverSelector";

/* ───────────────── Types ───────────────── */
interface GridPosition {
  row: number;
  col: number;
}

interface Waypoint {
  x: number;
  y: number;
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

interface RoverUIInstance {
  id: string;
  dbId?: string;
  displayName: string;
  ip: string;
  port: string;
  connection: ConnectionState;

  robotPos: GridPosition;
  waypoints: GridPosition[]; // UI / grid waypoints

  missionWaypoints?: Waypoint[]; // ⬅️ CSV / backend mission points

  nav: NavConfig;
  navTest: NavTestState;
  sdr: SDRConfig;
}

/* ───────────────── Defaults ───────────────── */
const DEFAULT_NAV: NavConfig = {
  baseSpeed: 0.6,
  turnSpeed: 1.0,
  positionEpsilon: 2,
  headingTolerance: 20,
};

const DEFAULT_SDR: SDRConfig = {
  frequency: 2400,
  bandwidth: 5,
  sampleRate: 5,
  gainMode: "auto",
  gainValue: 40,
  direction: "rx",
  channel: "A",
};

const GRID_CENTER = { row: 4, col: 4 }; // center of 10x10 grid

/* ───────────────── Utils ───────────────── */
const isValidIPv4 = (ip: string) =>
  /^(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)){3}$/.test(
    ip,
  );

const isValidPort = (port: string) => {
  const n = Number(port);
  return Number.isInteger(n) && n >= 1 && n <= 65535;
};

/* ───────────────── Decode helpers ───────────────── */
function parseCSVWaypoints(file: File): Promise<Waypoint[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const text = reader.result as string;
        const lines = text.split("\n").filter(Boolean);

        const points: Waypoint[] = lines.map((line, idx) => {
          const [x, y] = line.split(",").map(Number);

          if (Number.isNaN(x) || Number.isNaN(y)) {
            throw new Error(`Invalid coordinate on line ${idx + 1}`);
          }

          return { x, y };
        });

        resolve(points);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = reject;
    reader.readAsText(file);
  });
}

const decodeNavConfig = (raw: unknown): NavConfig => {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_NAV };
  const r = raw as any;
  return {
    baseSpeed: r.baseSpeed ?? DEFAULT_NAV.baseSpeed,
    turnSpeed: r.turnSpeed ?? DEFAULT_NAV.turnSpeed,
    positionEpsilon: r.positionEpsilon ?? DEFAULT_NAV.positionEpsilon,
    headingTolerance: r.headingTolerance ?? DEFAULT_NAV.headingTolerance,
  };
};

const decodeSDRConfig = (raw: unknown): SDRConfig => {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_SDR };
  const r = raw as any;
  return {
    frequency: r.frequency ?? DEFAULT_SDR.frequency,
    bandwidth: r.bandwidth ?? DEFAULT_SDR.bandwidth,
    sampleRate: r.sampleRate ?? DEFAULT_SDR.sampleRate,
    gainMode: r.gainMode ?? DEFAULT_SDR.gainMode,
    gainValue: r.gainValue ?? DEFAULT_SDR.gainValue,
    direction: r.direction ?? DEFAULT_SDR.direction,
    channel: r.channel ?? DEFAULT_SDR.channel,
  };
};

/* ───────────────── Component ───────────────── */
export const Connect = () => {
  const toggleWaypoint = (row: number, col: number) => {
    // Don't allow waypoint on robot
    if (row === GRID_CENTER.row && col === GRID_CENTER.col) return;

    setInstances((prev) =>
      prev.map((i) => {
        if (i.id !== activeId) return i;

        const exists = i.waypoints.some((p) => p.row === row && p.col === col);

        return {
          ...i,
          waypoints: exists
            ? i.waypoints.filter((p) => !(p.row === row && p.col === col))
            : [...i.waypoints, { row, col }],
        };
      }),
    );
  };

  const gridSize = 10;
  const { setActiveRover } = useRover();

  const [userId, setUserId] = useState<string | null>(null);
  const [savedRovers, setSavedRovers] = useState<RoverDbRow[]>([]);
  const [statusMsg, setStatusMsg] = useState("");

  const [instances, setInstances] = useState<RoverUIInstance[]>([
    {
      id: "rover-1",
      displayName: "Rover 1",
      ip: "",
      port: "",
      connection: "disconnected",
      robotPos: { row: 4, col: 4 },
      waypoints: [],
      nav: { ...DEFAULT_NAV },
      navTest: { running: false },
      sdr: { ...DEFAULT_SDR },
    },
  ]);

  const [activeId, setActiveId] = useState("rover-1");

  const active = useMemo(
    () => instances.find((i) => i.id === activeId)!,
    [instances, activeId],
  );

  const ipValid = isValidIPv4(active.ip);
  const portValid = isValidPort(active.port);

  /* ───────────────── Helpers ───────────────── */
  const updateActive = (patch: Partial<RoverUIInstance>) =>
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

  /* ───────────────── Auth ───────────────── */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  /* ───────────────── Load saved rovers ───────────────── */
  useEffect(() => {
    if (!userId) return;
    fetchRovers(userId).then(({ data }) => {
      setSavedRovers((data ?? []) as RoverDbRow[]);
    });
  }, [userId]);

  /* ───────────────── Global rover sync ───────────────── */
  useEffect(() => {
    setActiveRover({
      name: active.displayName,
      ip: active.ip,
      port: active.port,
      dbId: active.dbId,
    });
  }, [active, setActiveRover]);

  /* ───────────────── Connection ───────────────── */
  const connect = () => {
    if (!ipValid || !portValid) return;
    updateActive({ connection: "connecting" });
    setTimeout(() => updateActive({ connection: "connected" }), 700);
  };

  const disconnect = () => updateActive({ connection: "disconnected" });

  /* ───────────────── Test Movement ───────────────── */
  const runMovementTest = async () => {
    if (active.connection !== "connected") return;

    updateActive({ navTest: { running: true } });

    try {
      const res = await fetch(
        `http://${active.ip}:${active.port}/test/movement`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error();

      updateActive({
        navTest: { running: false, lastResult: "success" },
      });
    } catch {
      updateActive({
        navTest: { running: false, lastResult: "error" },
      });
    }
  };

  const forceStop = async () => {
    if (active.connection !== "connected") return;

    try {
      await fetch(`http://${active.ip}:${active.port}/stop`, {
        method: "POST",
      });

      // Immediately reflect stopped state in UI
      updateActive({
        navTest: {
          running: false,
          lastResult: "error", // or omit if you prefer
        },
      });
    } catch (err) {
      console.error("Force stop failed", err);
    }
  };

  async function handleWaypointUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const points = await parseCSVWaypoints(file);
      updateActive({ missionWaypoints: points });
      setStatusMsg(`Loaded ${points.length} waypoints`);
    } catch (err) {
      console.error(err);
      setStatusMsg("Invalid CSV format");
    }
  }

  /* ───────────────── Save Config (CREATE or UPDATE) ───────────────── */
  async function saveActiveProfile() {
    if (!userId || !ipValid || !portValid) return;

    // UPDATE existing rover
    if (active.dbId) {
      await updateRoverConfig({
        userId,
        roverId: active.dbId,
        nav_config: active.nav,
        sdr_config: active.sdr,
      });

      setStatusMsg("Configuration updated");
      return;
    }

    // CREATE new rover
    const { data, error } = await createRover({
      userId,
      name: active.displayName,
      ip: active.ip,
      port: Number(active.port),
      nav_config: active.nav,
      sdr_config: active.sdr,
    });

    if (error) {
      console.error(error);

      // Postgres unique violation
      if ((error as any).code === "23505") {
        setStatusMsg("Rover with this IP and port already exists");
      } else {
        setStatusMsg("Save failed");
      }

      return;
    }

    const newDbId = data?.[0]?.id;
    if (newDbId) {
      setInstances((prev) =>
        prev.map((i) => (i.id === activeId ? { ...i, dbId: newDbId } : i)),
      );
    }

    setStatusMsg("Rover saved");
    fetchRovers(userId).then(({ data }) =>
      setSavedRovers((data ?? []) as RoverDbRow[]),
    );
  }
  /* ───────────────── Auto-save config changes ───────────────── */
  useEffect(() => {
    if (!userId || !active.dbId) return;

    const timeout = setTimeout(() => {
      updateRoverConfig({
        userId,
        roverId: active.dbId!,
        nav_config: active.nav,
        sdr_config: active.sdr,
      });
    }, 800); // debounce to avoid spam

    return () => clearTimeout(timeout);
  }, [active.nav, active.sdr, active.dbId, userId]);

  async function deleteInstance(instanceId: string) {
    const inst = instances.find((i) => i.id === instanceId);

    if (!inst) return;

    // Delete from DB if saved
    if (userId && inst.dbId) {
      await deleteRover({
        userId,
        roverId: inst.dbId,
      });
    }

    if (inst.connection === "connected") {
      alert("Disconnect rover before deleting");
      return;
    }

    // Remove from UI
    let remaining = instances.filter((i) => i.id !== instanceId);

    // Always keep at least one rover tab
    if (remaining.length === 0) {
      remaining = [
        {
          id: "rover-1",
          displayName: "Rover 1",
          ip: "",
          port: "",
          connection: "disconnected",
          robotPos: { row: 4, col: 4 },
          waypoints: [],
          nav: { ...DEFAULT_NAV },
          navTest: { running: false },
          sdr: { ...DEFAULT_SDR },
        },
      ];
    }

    setInstances(remaining);
    setActiveId(remaining[0].id);
  }

  /* ───────────────── Add Rover ───────────────── */
  const addInstance = () => {
    const id = `rover-${instances.length + 1}`;
    setInstances([
      ...instances,
      {
        id,
        displayName: `Rover ${instances.length + 1}`,
        ip: "",
        port: "",
        connection: "disconnected",
        robotPos: { row: 4, col: 4 },
        waypoints: [],
        nav: { ...DEFAULT_NAV },
        navTest: { running: false },
        sdr: { ...DEFAULT_SDR },
      },
    ]);
    setActiveId(id);
  };

  /* ───────────────── UI ───────────────── */
  return (
    <section className="min-h-screen bg-black text-gray-100 pt-20 px-4 overflow-hidden">
      {/* Saved Rover DB */}
      {savedRovers.length > 0 && (
        <div className="max-w-7xl mx-auto mb-2">
          <RoverSelector
            rovers={savedRovers}
            onSelect={(r) => {
              if (!r) return;
              const id = `rover-${instances.length + 1}`;
              setInstances((prev) => [
                {
                  id,
                  dbId: r.id,
                  displayName: r.name,
                  ip: r.ip_address,
                  port: String(r.port),
                  connection: "disconnected",
                  robotPos: { row: 4, col: 4 },
                  waypoints: [],
                  nav: decodeNavConfig(r.nav_config),
                  navTest: { running: false },
                  sdr: decodeSDRConfig(r.sdr_config),
                },
                ...prev,
              ]);
              setActiveId(id);
            }}
          />
        </div>
      )}

      {/* Rover Tabs */}
      <div className="max-w-7xl mx-auto mb-2 flex gap-2">
        {instances.map((r) => (
          <div key={r.id} className="flex items-center gap-1">
            <button
              onClick={() => setActiveId(r.id)}
              className={`px-3 py-1 rounded text-xs ${
                r.id === activeId
                  ? "bg-indigo-500 text-white"
                  : "bg-zinc-800 text-gray-300 hover:bg-zinc-700"
              }`}
            >
              {r.displayName}
            </button>

            <button
              onClick={() => deleteInstance(r.id)}
              className="text-xs text-gray-500 hover:text-rose-400"
              title="Delete rover"
            >
              ✕
            </button>
          </div>
        ))}

        <button
          onClick={addInstance}
          className="px-3 py-1 rounded text-xs bg-emerald-500/20 text-emerald-300"
        >
          + Add Rover
        </button>
      </div>

      {/* Connection Bar */}
      <div className="max-w-7xl mx-auto mb-3">
        <div className="flex items-center gap-3 bg-zinc-900/70 border border-white/10 rounded-xl px-4 py-2">
          <input
            value={active.displayName}
            onChange={(e) => updateActive({ displayName: e.target.value })}
            className="bg-zinc-800 px-3 py-1 rounded text-sm w-40"
          />

          <input
            value={active.ip}
            onChange={(e) => updateActive({ ip: e.target.value })}
            placeholder="IP"
            className={`bg-zinc-800 px-3 py-1 rounded text-sm w-40 ${
              active.ip && !ipValid ? "border border-rose-500" : ""
            }`}
          />

          <input
            value={active.port}
            onChange={(e) => updateActive({ port: e.target.value })}
            placeholder="Port"
            className={`bg-zinc-800 px-3 py-1 rounded text-sm w-24 ${
              active.port && !portValid ? "border border-rose-500" : ""
            }`}
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
              disabled={!ipValid || !portValid}
              className="px-4 py-1.5 rounded text-sm bg-indigo-500 hover:bg-indigo-400 disabled:bg-zinc-700 disabled:text-gray-500"
            >
              Connect
            </button>
          )}

          <button
            onClick={saveActiveProfile}
            className="px-3 py-1 text-xs bg-emerald-500/20 text-emerald-300 rounded"
          >
            Save Config
          </button>

          <span className="ml-auto text-xs text-gray-400">{statusMsg}</span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Grid */}
        <div className="bg-zinc-900/70 border border-white/10 rounded-2xl flex flex-col items-center justify-center">
          <div className="w-full max-w-[600px] aspect-square bg-zinc-800 rounded-lg overflow-hidden">
            {Array.from({ length: gridSize }).map((_, r) => (
              <div key={r} className="flex">
                {Array.from({ length: gridSize }).map((_, c) => {
                  const isRobot =
                    r === GRID_CENTER.row && c === GRID_CENTER.col;

                  const wpIndex = active.waypoints.findIndex(
                    (p) => p.row === r && p.col === c,
                  );

                  const isWaypoint = wpIndex !== -1;

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => toggleWaypoint(r, c)}
                      className={`flex-1 aspect-square border border-zinc-700 relative cursor-pointer
                ${
                  isRobot
                    ? "bg-indigo-500"
                    : isWaypoint
                      ? "bg-emerald-500/40 hover:bg-emerald-500/60"
                      : "hover:bg-zinc-700"
                }`}
                    >
                      {/* Robot */}
                      {isRobot && (
                        <div className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold">
                          0_0
                        </div>
                      )}

                      {/* Waypoint order */}
                      {isWaypoint && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-emerald-200 font-semibold">
                          {wpIndex + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Grid Legend */}
          <div className="flex gap-4 mt-3 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-indigo-500 rounded-sm" /> Robot
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-emerald-500/60 rounded-sm" /> Waypoint
            </span>
            <span>Click cells to add/remove nodes</span>
          </div>
        </div>

        {/* Right Rail */}
        <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-900">
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

            <label className="text-xs text-gray-400">Position Epsilon</label>
            <input
              type="number"
              value={active.nav.positionEpsilon}
              onChange={(e) =>
                updateNav({ positionEpsilon: Number(e.target.value) })
              }
              className="w-full bg-zinc-800 rounded px-2 py-1 mb-2"
            />

            <label className="text-xs text-gray-400">Heading Tolerance</label>
            <input
              type="range"
              min={0}
              max={180}
              value={active.nav.headingTolerance}
              onChange={(e) =>
                updateNav({
                  headingTolerance: Number(e.target.value),
                })
              }
              className="w-full accent-indigo-500"
            />
          </div>
          {/* Waypoint Upload */}
          <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4 space-y-2">
            <h3 className="text-cyan-400 mb-2 text-sm font-semibold">
              Waypoint Upload
            </h3>

            <p className="text-xs text-gray-400">
              Upload a CSV file containing coordinate points (x, y) that the
              rover will traverse in order.
            </p>

            <input
              type="file"
              accept=".csv"
              onChange={handleWaypointUpload}
              className="block w-full text-xs text-gray-400
               file:mr-4 file:py-2 file:px-4
               file:rounded file:border-0
               file:text-xs file:font-semibold
               file:bg-cyan-500/20 file:text-cyan-300
               hover:file:bg-cyan-500/30"
            />

            {active.missionWaypoints && (
              <div className="text-xs text-gray-400">
                Loaded <b>{active.missionWaypoints.length}</b> mission waypoints
              </div>
            )}
          </div>

          {/* Test Rover Movement */}
          <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4">
            <h3 className="text-emerald-400 mb-2 text-sm font-semibold">
              Test Rover Movement
            </h3>

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

            <button
              onClick={forceStop}
              disabled={active.connection !== "connected"}
              className="w-full mt-2 py-2 rounded text-sm
             bg-rose-600 hover:bg-rose-500
             text-white tracking-wide"
            >
              Force Stop
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
          <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4 space-y-2">
            <h3 className="text-pink-400 mb-2 text-sm font-semibold">
              SDR Configuration
            </h3>

            <label className="text-xs text-gray-400">Frequency (MHz)</label>
            <input
              type="number"
              value={active.sdr.frequency}
              onChange={(e) => updateSDR({ frequency: Number(e.target.value) })}
              className="w-full bg-zinc-800 rounded px-2 py-1"
            />

            <label className="text-xs text-gray-400">Bandwidth (MHz)</label>
            <input
              type="number"
              value={active.sdr.bandwidth}
              onChange={(e) => updateSDR({ bandwidth: Number(e.target.value) })}
              className="w-full bg-zinc-800 rounded px-2 py-1"
            />

            <label className="text-xs text-gray-400">Sample Rate (MS/s)</label>
            <input
              type="number"
              value={active.sdr.sampleRate}
              onChange={(e) =>
                updateSDR({ sampleRate: Number(e.target.value) })
              }
              className="w-full bg-zinc-800 rounded px-2 py-1"
            />

            <label className="text-xs text-gray-400">Gain Mode</label>
            <select
              value={active.sdr.gainMode}
              onChange={(e) =>
                updateSDR({ gainMode: e.target.value as "auto" | "manual" })
              }
              className="w-full bg-zinc-800 rounded px-2 py-1"
            >
              <option value="auto">Auto</option>
              <option value="manual">Manual</option>
            </select>

            {active.sdr.gainMode === "manual" && (
              <>
                <label className="text-xs text-gray-400">Gain (dB)</label>
                <input
                  type="number"
                  value={active.sdr.gainValue}
                  onChange={(e) =>
                    updateSDR({ gainValue: Number(e.target.value) })
                  }
                  className="w-full bg-zinc-800 rounded px-2 py-1"
                />
              </>
            )}

            <label className="text-xs text-gray-400">Direction</label>
            <select
              value={active.sdr.direction}
              onChange={(e) =>
                updateSDR({ direction: e.target.value as "rx" | "tx" })
              }
              className="w-full bg-zinc-800 rounded px-2 py-1"
            >
              <option value="rx">Receive</option>
              <option value="tx">Transmit</option>
            </select>

            <label className="text-xs text-gray-400">Channel</label>
            <input
              value={active.sdr.channel}
              onChange={(e) => updateSDR({ channel: e.target.value })}
              className="w-full bg-zinc-800 rounded px-2 py-1"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
