import { useEffect, useRef, useState } from "react";

/**
 * Animated Vanta.js FOG background. Client-only (WebGL + THREE).
 * Sits fixed behind all content.
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
      const FOG = (await import("vanta/dist/vanta.fog.min")).default;
      if (cancelled || !ref.current) return;
      localEffect = FOG({
        el: ref.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        highlightColor: 0xffc7d9,
        midtoneColor: 0x8aa9ff,
        lowlightColor: 0x6ee7d0,
        baseColor: 0xf5f2ea,
        blurFactor: 0.6,
        speed: 1.2,
        zoom: 0.9,
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
