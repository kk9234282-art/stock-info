"use client";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
const subscribe = (callback: () => void) => {
  window.addEventListener("atlas-theme", callback);
  return () => window.removeEventListener("atlas-theme", callback);
};
export default function Theme() {
  const dark = useSyncExternalStore(
    subscribe,
    () => document.documentElement.classList.contains("dark"),
    () => true,
  );
  return (
    <button
      aria-label="Toggle color theme"
      aria-pressed={dark}
      className="icon-button"
      onClick={() => {
        document.documentElement.classList.toggle("dark");
        window.dispatchEvent(new Event("atlas-theme"));
      }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
