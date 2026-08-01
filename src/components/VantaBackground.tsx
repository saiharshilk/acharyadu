import { useEffect, useRef, useState } from "react";

/**
 * Animated Vanta.js FOG background — brutalist monochrome edition.
 * Client-only (WebGL + THREE). Sits fixed behind the dark hero.
 */
export function VantaBackground() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [effect, setEffect] = useState<{ destroy: () => void } | null>(null);

  useEffect(() => {
    let cancelled = false;
    let localEffect: { destroy: () => void } | null = null;

    (async () => {
      const THREE = await import("three");
      // @ts-expect-error - vanta has no bundled types
      const mod = await import("vanta/dist/vanta.fog.min");
      const FOG = typeof mod.default === "function" ? mod.default : mod.default?.default;
      if (!FOG || cancelled || !ref.current) return;
      localEffect = FOG({
        el: ref.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0xff6436,
        midtoneColor: 0x3c3a3e,
        lowlightColor: 0x161616,
        baseColor: 0x161616,
        blurFactor: 0.5,
        speed: 0.8,
        zoom: 0.95,
      });
      setEffect(localEffect);
    })();

    return () => {
      cancelled = true;
      if (localEffect) localEffect.destroy();
    };
  }, []);

  // Silence unused-var warning; effect is tracked for HMR/debug.
  void effect;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none"
    />
  );
}
