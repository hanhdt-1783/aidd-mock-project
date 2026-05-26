// Shared countdown state machine used by /home hero and /prelaunch page.
// Single source of truth for placeholder semantics so the two screens stay aligned.
//
// Semantics:
//   - null / undefined / invalid target → "--" tiles, hide "Coming soon"
//   - past target                        → "00" tiles, hide "Coming soon"
//   - future target                      → real diff,  show "Coming soon"

export type CountdownUnit = {
  display: string;
  unit: "days" | "hours" | "minutes";
};

export type CountdownState = {
  units: CountdownUnit[];
  showComingSoon: boolean;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function computeCountdownState(
  targetIso: string | null | undefined,
  now: number,
): CountdownState {
  const placeholder = (display: string): CountdownState => ({
    units: [
      { display, unit: "days" },
      { display, unit: "hours" },
      { display, unit: "minutes" },
    ],
    showComingSoon: false,
  });

  if (!targetIso) return placeholder("--");
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return placeholder("--");

  const diff = target - now;
  if (diff <= 0) return placeholder("00");

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  return {
    units: [
      { display: pad(Math.floor(totalHours / 24)), unit: "days" },
      { display: pad(totalHours % 24), unit: "hours" },
      { display: pad(totalMinutes % 60), unit: "minutes" },
    ],
    showComingSoon: true,
  };
}
