import { useState } from "react";

export default function Test() {
  const API = "http://192.168.0.159:8000"; // replace with Pi IP
  const [status, setStatus] = useState("");

  async function runMovementTest() {
    setStatus("Sending command...");

    try {
      const res = await fetch(`${API}/test/movement`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Request failed");

      setStatus("Movement test started 🚗");
    } catch (err) {
      console.error(err);
      setStatus("Failed to trigger test ❌");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        fontFamily: "sans-serif",
      }}
    >
      <h2>Rover Navigation Test</h2>

      <button
        onClick={runMovementTest}
        style={{
          padding: "14px 28px",
          fontSize: "16px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#2563eb",
          color: "white",
          cursor: "pointer",
        }}
      >
        Run Movement Test
      </button>

      {status && <p>{status}</p>}
    </div>
  );
}
