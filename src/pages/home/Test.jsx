import { useState } from "react";

export default function Test() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const [baseSpeed, setBaseSpeed] = useState(0.6);
  const [turnSpeed, setTurnSpeed] = useState(1.0);

  const API = "http://ROVER_IP:8000"; // replace later

  async function sendXY() {
    await fetch(`${API}/command/xy`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x, y }),
    });
  }

  async function sendConfig() {
    await fetch(`${API}/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base_speed: baseSpeed,
        turn_speed: turnSpeed,
        imu_frequency: 50,
      }),
    });
  }

  return (
    <section
      id="test"
      className="min-h-screen flex flex-col items-center justify-center bg-black text-white px-6"
    >
      <h2 className="text-4xl font-bold mb-8">Rover Test Control</h2>

      {/* Destination */}
      <div className="w-full max-w-md mb-8">
        <h3 className="text-xl font-semibold mb-2">Destination (XY meters)</h3>

        <div className="flex gap-4">
          <input
            type="number"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-900 border border-gray-700"
            placeholder="X"
          />
          <input
            type="number"
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            className="w-full p-2 rounded bg-gray-900 border border-gray-700"
            placeholder="Y"
          />
        </div>

        <button
          onClick={sendXY}
          className="mt-4 w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded"
        >
          Send Destination
        </button>
      </div>

      {/* Config */}
      <div className="w-full max-w-md">
        <h3 className="text-xl font-semibold mb-2">Speed Config</h3>

        <label className="block text-sm mb-1">Base Speed</label>
        <input
          type="number"
          step="0.1"
          value={baseSpeed}
          onChange={(e) => setBaseSpeed(Number(e.target.value))}
          className="w-full p-2 mb-3 rounded bg-gray-900 border border-gray-700"
        />

        <label className="block text-sm mb-1">Turn Speed</label>
        <input
          type="number"
          step="0.1"
          value={turnSpeed}
          onChange={(e) => setTurnSpeed(Number(e.target.value))}
          className="w-full p-2 mb-4 rounded bg-gray-900 border border-gray-700"
        />

        <button
          onClick={sendConfig}
          className="w-full bg-green-600 hover:bg-green-500 py-2 rounded"
        >
          Update Config
        </button>
      </div>
    </section>
  );
}
