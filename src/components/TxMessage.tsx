import { useState } from "react";

interface TxMessageProps {
  isVisible: boolean;
  roverIp: string;
  roverPort: string;
}

export const TxMessage = ({
  isVisible,
  roverIp,
  roverPort,
}: TxMessageProps) => {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSentTime, setLastSentTime] = useState<number | null>(null);

  const handleSend = async () => {
    if (!roverIp || !roverPort) {
      setError("Rover not connected");
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const response = await fetch(
        `http://${roverIp}:${roverPort}/sdr/txgps`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to trigger GPS transmission");
      }

      setLastSentTime(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSending(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4 space-y-3">
      <h3 className="text-cyan-400 text-sm font-semibold">TX GPS</h3>

      <button
        onClick={handleSend}
        disabled={isSending}
        className="w-full px-4 py-2 rounded text-sm bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-700 disabled:text-gray-500"
      >
        {isSending ? "Sending..." : "Send"}
      </button>

      {lastSentTime && (
        <div className="text-xs text-emerald-400">
          Last transmission:{" "}
          {new Date(lastSentTime).toLocaleTimeString()}
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-400">
          {error}
        </div>
      )}
    </div>
  );
};
