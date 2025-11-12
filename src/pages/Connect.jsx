import { useState } from "react";

export const Connect = () => {
  const gridSize = 10;
  const [port, setPort] = useState("");

  // --- Simulation State ---
  const [robotPos, setRobotPos] = useState({ row: 4, col: 4 });
  const [waypoints, setWaypoints] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // --- Handle Grid Clicks ---
  const handleCellClick = (row, col, e) => {
    if (isRunning) return;

    // Shift+Click → Move robot
    if (e.shiftKey) {
      setRobotPos({ row, col });
      return;
    }

    // Click → Toggle waypoint
    const exists = waypoints.some((p) => p.row === row && p.col === col);
    if (exists) {
      setWaypoints(waypoints.filter((p) => !(p.row === row && p.col === col)));
    } else {
      setWaypoints([...waypoints, { row, col }]);
    }
  };

  // --- Simulate Robot Movement ---
  const runSimulation = async () => {
    if (waypoints.length === 0) return;
    setIsRunning(true);
    for (let i = 0; i < waypoints.length; i++) {
      const { row, col } = waypoints[i];
      await new Promise((r) => setTimeout(r, 500)); // 0.5s per move
      setRobotPos({ row, col });
    }
    setIsRunning(false);
  };

  // --- Clear All Waypoints ---
  const clearWaypoints = () => {
    if (isRunning) return;
    setWaypoints([]);
  };

  return (
    <section className="min-h-screen bg-black text-gray-100 flex flex-col items-center px-6 py-10 pt-24">
      {/* --- Header --- */}
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-500 to-blue-400 bg-clip-text text-transparent">
        Rovera Connection Interface
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl">
        {/* --- Left Panel: Connection & Simulation --- */}
        <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-indigo-400">
            Connection Setup
          </h2>

          <label className="text-sm text-gray-400 mb-2">Enter Port Number</label>
          <input
            type="text"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="e.g., 8080"
            className="p-2 rounded bg-gray-800 text-gray-200 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 rounded transition">
            Connect
          </button>

          <div className="mt-6 text-sm text-gray-400">
            <p>Status: <span className="text-yellow-400">Disconnected</span></p>
          </div>

          {/* Run + Clear Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={runSimulation}
              disabled={isRunning || waypoints.length === 0}
              className={`py-2 rounded font-medium transition ${
                isRunning
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-500"
              }`}
            >
              {isRunning ? "Running..." : "Run Simulation"}
            </button>

            <button
              onClick={clearWaypoints}
              disabled={waypoints.length === 0 || isRunning}
              className={`py-2 rounded font-medium transition ${
                waypoints.length === 0 || isRunning
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-500"
              }`}
            >
              Clear Waypoints
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            💡 Tip: Hold <span className="text-indigo-400">Shift</span> and click a cell to move
            the robot. Click normally to add or remove waypoints.
          </p>
        </div>

        {/* --- Middle: Simulation Grid --- */}
        <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700 shadow-lg flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-green-400">
            Test Grid Area
          </h2>

          <div
            className="flex flex-col aspect-square bg-gray-800 rounded-lg"
            style={{ width: "100%" }}
          >
            {Array.from({ length: gridSize }).map((_, row) => (
              <div key={row} className="flex flex-1">
                {Array.from({ length: gridSize }).map((_, col) => {
                  const isRobot = row === robotPos.row && col === robotPos.col;
                  const isWaypoint = waypoints.some(
                    (p) => p.row === row && p.col === col
                  );
                  return (
                    <div
                      key={`${row}-${col}`}
                      onClick={(e) => handleCellClick(row, col, e)}
                      className={`flex-1 border border-gray-700 cursor-pointer flex items-center justify-center transition ${
                        isRobot
                          ? "bg-blue-500"
                          : isWaypoint
                          ? "bg-yellow-500"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      {isRobot && (
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                      {isWaypoint && !isRobot && (
                        <div className="w-2 h-2 bg-black rounded-full"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-400 mt-3 text-center">
            Blue = Robot | Yellow = Waypoint | Shift+Click = Move Robot
          </p>
        </div>

        {/* --- Right: Controls + SDR Panels --- */}
        <div className="flex flex-col gap-6">
          {/* Controls Panel */}
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-400">Controls</h2>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 py-1 rounded-md transition">
                Way Point Mode
              </button>
              <button className="bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm px-3 py-1 rounded-md transition">
                Manual Drive
              </button>
            </div>

            {/* Speed */}
            <div className="mb-5">
              <label className="text-sm text-gray-400 mb-1 block">Speed</label>
              <input type="range" min="0" max="100" className="w-full accent-indigo-500" />
            </div>

            {/* Direction */}
            <div className="mb-5">
              <label className="text-sm text-gray-400 mb-1 block">Drive Direction</label>
              <select className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Forward</option>
                <option>Reverse</option>
              </select>
            </div>

            {/* Upload CSV */}
            <div className="mb-5">
              <label className="text-sm text-gray-400 mb-1 block">Trajectory Upload</label>
              <button className="border border-indigo-400 text-indigo-400 text-sm px-3 py-2 rounded-md hover:bg-indigo-500/10 transition">
                Upload CSV File
              </button>
            </div>

            <div className="flex justify-between items-center mt-4">
              <button className="border border-yellow-500 text-yellow-400 text-sm px-4 py-1 rounded-md hover:bg-yellow-500/10 transition">
                Reset
              </button>
              <button className="border border-green-500 text-green-400 text-sm px-4 py-1 rounded-md hover:bg-green-500/10 transition">
                Apply
              </button>
            </div>
          </div>

          {/* SDR Panel */}
          <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-700 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-pink-400">SDR</h2>

            {/* Frequency Control */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1">
                <label className="text-sm text-gray-400">Frequency Control</label>
                <span className="text-xs text-gray-500">100 MHz – 6 GHz</span>
              </div>
              <input
                type="number"
                placeholder="2400"
                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-gray-200 mb-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <button className="w-full bg-pink-600 hover:bg-pink-500 text-white text-sm py-1 rounded-md transition">
                Set Frequency
              </button>
            </div>

            {/* Presets */}
            <div className="mb-5">
              <label className="text-sm text-gray-400 mb-2 block">Preset</label>
              <div className="flex justify-between gap-2">
                {["FM", "LTE", "GPS"].map((preset) => (
                  <button
                    key={preset}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-200 py-1 rounded-md text-sm transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <button className="mt-2 border border-pink-500 text-pink-400 text-sm px-3 py-1 rounded-md hover:bg-pink-500/10 transition">
                Apply Preset
              </button>
            </div>

            {/* Power & Gain */}
            <div className="mb-5">
              <label className="text-sm text-gray-400 mb-1 block">Power / RX Gain</label>
              <input type="range" min="0" max="100" className="w-full accent-pink-500" />
              <button className="mt-2 border border-pink-500 text-pink-400 text-sm px-3 py-1 rounded-md hover:bg-pink-500/10 transition">
                Apply
              </button>
            </div>

            {/* Bandwidth */}
            <div className="mb-5">
              <label className="text-sm text-gray-400 mb-1 block">Bandwidth & Sampling</label>
              <select className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-gray-200 mb-2 focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option>1 MHz / 1 MS/s</option>
                <option>5 MHz / 5 MS/s</option>
                <option>10 MHz / 10 MS/s</option>
              </select>
              <button className="border border-pink-500 text-pink-400 text-sm px-3 py-1 rounded-md hover:bg-pink-500/10 transition">
                Apply
              </button>
            </div>

            {/* Modulation Type */}
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Modulation Type</label>
              <select className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-gray-200 mb-2 focus:outline-none focus:ring-2 focus:ring-pink-500">
                <option>AM</option>
                <option>FM</option>
                <option>PSK</option>
                <option>QAM</option>
              </select>
              <button className="border border-pink-500 text-pink-400 text-sm px-3 py-1 rounded-md hover:bg-pink-500/10 transition">
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
