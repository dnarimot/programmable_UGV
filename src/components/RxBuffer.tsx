import { useEffect, useRef, useState } from "react";

interface BufferMessage {
  seq: number;
  // TODO: BACKEND PLACEHOLDER - Data encoding
  // - The backend may return data as a raw string or as hex-encoded bytes.
  // - Replace this comment and, if needed, update UI decoding logic depending on what the backend returns.
  //   - If backend returns raw strings: `data` will be the message string and can be displayed directly.
  //   - If backend returns hex: frontend will need to decode hex to text before displaying (or the backend can decode first).
  data: string;
  timestamp: number;
  direction: "rx" | "tx";
  length: number;
}

interface RxBufferProps {
  isVisible: boolean;
  roverIp: string;
  roverPort: string;
}

export const RxBuffer = ({ isVisible, roverIp, roverPort }: RxBufferProps) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<BufferMessage[]>([]);
  const [lastSeq, setLastSeq] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for new messages when visible and connected
  useEffect(() => {
    if (!isVisible || !roverIp || !roverPort) {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const fetchMessages = async () => {
      try {
        setError(null);
        // TODO: BACKEND PLACEHOLDER - Endpoint, rover id and query parameter names
        // - Replace `/sdr/buffer/rover-1` with your group's buffer endpoint.
        //   Examples:
        //     - `/sdr/buffer/{ROVER_ID}?since_seq={LAST_SEQ}` (current implementation)
        //     - If your backend uses different query param names, modify `since_seq` accordingly
        //       (e.g. `?since=${lastSeq}` or `?last_seq=${lastSeq}`).
        // - The front-end expects the JSON response to include:
        //     { messages: [ { seq, data, timestamp, length } ], max_seq }
        //   If your backend uses different keys, update the handler below to map fields.
        const response = await fetch(
          `http://${roverIp}:${roverPort}/sdr/buffer/rover-1?since_seq=${lastSeq}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch buffer");
        }

        const data = await response.json();

        if (data.messages && data.messages.length > 0) {
          // TODO: BACKEND PLACEHOLDER - Response field mapping
          // - If the backend returns items with different key names (e.g. `seq_num`, `payload`, `ts`), map them here.
          // - Example mapping if backend returns `{ seq_num, payload, ts }`:
          //     const mapped = data.messages.map(m => ({ seq: m.seq_num, data: m.payload, timestamp: m.ts, length: m.length }));
          //     setMessages(prev => [...prev, ...mapped]);
          setMessages((prev) => [...prev, ...data.messages]);
          setLastSeq(data.max_seq);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchMessages();

    // Poll every 500ms for new messages
    pollIntervalRef.current = setInterval(fetchMessages, 500);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [isVisible, roverIp, roverPort, lastSeq]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts * 1000);
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  };

  const formatHex = (hex: string, maxLength = 32) => {
    if (hex.length > maxLength) {
      return `${hex.substring(0, maxLength)}...`;
    }
    return hex;
  };

  return (
    <div
      className={`bg-zinc-900/70 border border-white/10 rounded-2xl p-4 transition-all duration-300 overflow-hidden ${
        isVisible ? "opacity-100 max-h-96" : "opacity-0 max-h-0"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-cyan-400 text-sm font-semibold">RX Buffer</h3>
        {isLoading && (
          <span className="text-[11px] text-cyan-400 animate-pulse">
            Polling...
          </span>
        )}
      </div>

      <div
        ref={terminalRef}
        className="bg-black/50 border border-cyan-500/30 rounded font-mono text-xs text-cyan-300 p-3 h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-600/50 scrollbar-track-black/20"
      >
        {messages.length === 0 && !error && (
          <div className="text-cyan-300/50">
            {isVisible ? "Waiting for messages..." : "Connect to view buffer"}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.seq}
            className="text-cyan-300/80 whitespace-pre-wrap break-words mb-1 py-0.5 border-l-2 border-cyan-500/40 pl-2"
          >
            <span className="text-cyan-400">
              [{formatTimestamp(msg.timestamp)}]
            </span>
            {" "}
            <span className="text-cyan-200">[SEQ:{msg.seq}]</span>
            {" "}
            <span className="text-cyan-500">[{msg.length}B]</span>
            <br />
            <span className="text-cyan-300">
              {formatHex(msg.data.toUpperCase())}
            </span>
          </div>
        ))}

        {messages.length > 0 && (
          <div className="inline-block animate-pulse text-cyan-400">█</div>
        )}
      </div>

      {error && (
        <p className="text-[11px] text-rose-400 mt-2">Error: {error}</p>
      )}

      {!error && (
        <p className="text-[11px] text-gray-500 mt-2">
          {messages.length > 0
            ? `${messages.length} message${messages.length !== 1 ? "s" : ""} received`
            : "No messages yet"}
        </p>
      )}
    </div>
  );
};
