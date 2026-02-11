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
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState({ queued: 0, total: 0 });
  const [lastSentMessage, setLastSentMessage] = useState<{
    text: string;
    timestamp: number;
  } | null>(null);

  const handleSend = async () => {
    if (!messageInput.trim()) {
      setError("Message cannot be empty");
      return;
    }

    if (!roverIp || !roverPort) {
      setError("Rover not connected");
      return;
    }

    setIsSending(true);
    setError(null);

      try {
      // TODO: BACKEND PLACEHOLDER - Endpoint and rover identifier
      // - Replace `/sdr/transmit/rover-1` with the actual endpoint your backend exposes.
      //   Examples of replacements you might need:
      //     - `/sdr/transmit/{ROVER_ID}` where `{ROVER_ID}` is provided by the backend (e.g. 'rover-42')
      //     - If your group uses a different path, replace the entire path (e.g. `/sdr/apply`).
      // - If your backend expects a different request format (field names), update the body below.
      //   Currently this component sends `{ data: string, priority: number }`.
      //   Replace `data` with the backend's expected key (e.g. `payload` or `message`) if necessary.
      // - If your backend requires authentication headers or a different Content-Type, add them here.
      // Example final URL (replace placeholders):
      //   `http://${roverIp}:${roverPort}/sdr/transmit/${actualRoverId}`
      const response = await fetch(
        `http://${roverIp}:${roverPort}/sdr/transmit/rover-1`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // TODO: BACKEND PLACEHOLDER - Request body key
            // - Replace `data` below with whatever key the backend expects.
            //   e.g. `{ payload: messageInput }` or `{ message: messageInput }`.
            data: messageInput,
            priority: 0,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      // Update queue status
      setQueueStatus({
        queued: data.queue_size || 0,
        total: data.queue_size || 0,
      });

      // Record sent message
      setLastSentMessage({
        text: messageInput,
        timestamp: Date.now(),
      });

      // Clear input
      setMessageInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isSending) {
      handleSend();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-zinc-900/70 border border-white/10 rounded-2xl p-4 space-y-2">
      <h3 className="text-cyan-400 mb-2 text-sm font-semibold">TX Message</h3>

      <label className="text-xs text-gray-400">Message to Send</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter message (converted to hex)"
          disabled={isSending}
          className="flex-1 bg-zinc-800 rounded px-3 py-2 text-sm disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={isSending || !messageInput.trim()}
          className="px-4 py-2 rounded text-sm bg-cyan-600 hover:bg-cyan-500 disabled:bg-zinc-700 disabled:text-gray-500 whitespace-nowrap"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </div>

      {/* No hex conversion in frontend; backend will handle encoding */}

      {/* Queue status */}
      {queueStatus.queued > 0 && (
        <div className="text-xs text-cyan-300">
          Queue: {queueStatus.queued} message(s) pending transmission
        </div>
      )}

      {/* Last sent message */}
      {lastSentMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded p-2 text-xs">
          <div className="text-emerald-300 mb-1">Last Sent:</div>
          <div className="text-gray-300">{lastSentMessage.text}</div>
          <div className="text-gray-500 text-[11px] mt-1">
            {new Date(lastSentMessage.timestamp).toLocaleTimeString()}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && <div className="text-xs text-rose-400">{error}</div>}
    </div>
  );
};
