import { useEffect } from "react";

export const useScanDetection = (onScan: (code: string) => void) => {
  useEffect(() => {
    let buffer = "";
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      
      // Ignore scan events if the user is typing in a search box manually
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      // If keys are pressed slower than 30ms apart, it's a human typing, reset buffer
      if (currentTime - lastKeyTime > 30) {
        buffer = "";
      }

      lastKeyTime = currentTime;

      if (e.key === "Enter") {
        if (buffer.length > 2) { // Minimum barcode length check
          onScan(buffer);
          buffer = "";
        }
      } else if (e.key.length === 1) { // Only capture printable characters
        buffer += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan]);
};