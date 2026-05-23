/**
 * Pure countdown computation for the prelaunch page.
 * Mirrors the pattern from home-countdown.tsx.
 */

export type PrelaunchUnit = {
  display: string;
  unit: "days" | "hours" | "minutes";
};

export type PrelaunchCountdownState = {
  units: PrelaunchUnit[];
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Compute countdown from now to target.
 *
 * - null/invalid targetIso → display "00" for all units
 * - past target → display "00" for all units
 * - future target → real diff values
 */
export function computePrelaunchState(
  targetIso: string | null | undefined,
  now: number,
): PrelaunchCountdownState {
  const zero = (): PrelaunchCountdownState => ({
    units: [
      { display: "00", unit: "days" },
      { display: "00", unit: "hours" },
      { display: "00", unit: "minutes" },
    ],
  });

  if (!targetIso) return zero();

  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return zero();

  const diff = target - now;
  if (diff <= 0) return zero();

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const totalHours = Math.floor(totalMinutes / 60);

  return {
    units: [
      { display: pad(Math.floor(totalHours / 24)), unit: "days" },
      { display: pad(totalHours % 24), unit: "hours" },
      { display: pad(totalMinutes % 60), unit: "minutes" },
    ],
  };
}
