import { Dispatch, SetStateAction } from "react";

export interface MenuProps {
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
}

export interface LoadingScreenProps {
  onComplete: () => void;
}
