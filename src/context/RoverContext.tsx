import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export type ActiveRover = {
  name: string;
  ip: string;
  port: string;
  dbId?: string; // optional: DB row id if saved
};

type RoverContextType = {
  activeRover: ActiveRover | null;
  setActiveRover: (r: ActiveRover | null) => void;
};

const RoverContext = createContext<RoverContextType | undefined>(undefined);

export function RoverProvider({ children }: { children: ReactNode }) {
  const [activeRover, setActiveRover] = useState<ActiveRover | null>(null);

  const value = useMemo(() => ({ activeRover, setActiveRover }), [activeRover]);

  return (
    <RoverContext.Provider value={value}>{children}</RoverContext.Provider>
  );
}

export function useRover() {
  const ctx = useContext(RoverContext);
  if (!ctx) throw new Error("useRover must be used within RoverProvider");
  return ctx;
}
