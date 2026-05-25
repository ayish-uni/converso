import { useEffect, useRef } from "react";
import { startAmbientSoundtrack } from "../utils/audio";

export function useAmbientSoundtrack() {
  const soundtrackRef = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    // We don't auto-start because browsers require user interaction
    // But we want to clean up when the component unmounts
    return () => {
      if (soundtrackRef.current) {
        soundtrackRef.current.stop();
        soundtrackRef.current = null;
        startedRef.current = false;
      }
    };
  }, []);

  const activate = () => {
    if (startedRef.current) {
      soundtrackRef.current?.context?.resume?.().catch(() => {});
      return;
    }

    if (!soundtrackRef.current) {
      soundtrackRef.current = startAmbientSoundtrack();
    }

    if (soundtrackRef.current?.context) {
      soundtrackRef.current.context
        .resume()
        .then(() => {
          startedRef.current = true;
          console.log("Ambient soundtrack activated.");
        })
        .catch((err) => {
          console.error("Ambient soundtrack failed to resume:", err);
        });
    }
  };

  return { activate };
}
