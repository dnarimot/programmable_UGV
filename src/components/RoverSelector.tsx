import type { RoverDbRow } from "../lib/roverApi";

interface Props {
  rovers: RoverDbRow[];
  onSelect: (rover: RoverDbRow | null) => void;
}

export default function RoverSelector({ rovers, onSelect }: Props) {
  return (
    <select
      className="w-full bg-gray-800 border border-gray-700 rounded p-2"
      onChange={(e) => {
        const rover =
          rovers.find((r) => r.id === e.target.value) ?? null;
        onSelect(rover);
      }}
    >
      <option value="">Select saved rover</option>
      {rovers.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name} ({r.ip_address}:{r.port})
        </option>
      ))}
    </select>
  );
}
