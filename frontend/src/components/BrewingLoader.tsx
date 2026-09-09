import { useEffect, useState } from "react";

const STEPS = [
  { icon: "☕", label: "Reading orders…" },
  { icon: "✓",  label: "Comparing recent sales…" },
  { icon: "✓",  label: "Checking inventory…" },
  { icon: "✓",  label: "Finding unusual changes…" },
  { icon: "✓",  label: "Writing report…" },
];

type StepState = "done" | "active" | "pending";

type Props = { visible: boolean };

export function BrewingLoader({ visible }: Props) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!visible) { setStep(0); return; }
    setStep(0);
    let s = 0;
    const id = setInterval(() => {
      s += 1;
      if (s < STEPS.length) setStep(s);
      else clearInterval(id);
    }, 340);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible) return null;

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div
      className="py-6"
      role="status"
      aria-live="polite"
      aria-label="Brewing your morning report"
    >
      <p className="label mb-1 text-caramel">Brewing your report</p>
      <p className="mb-4 text-xs text-espresso/45">Analysing sales, checking inventory, writing brief…</p>

      {/* Progress bar */}
      <div className="progress-track mb-5">
        <div
          className="progress-fill bg-caramel"
          style={{ width: `${progress}%`, transitionDuration: "320ms" }}
        />
      </div>

      {/* Steps */}
      <ol className="space-y-2.5">
        {STEPS.map(({ icon, label }, idx) => {
          const state: StepState =
            idx < step ? "done" : idx === step ? "active" : "pending";

          return (
            <li key={label} className="flex items-center gap-3 text-xs">
              <span
                className={`
                  w-4 shrink-0 font-mono
                  ${state === "done"    ? "text-sage" : ""}
                  ${state === "active"  ? "text-caramel blink" : ""}
                  ${state === "pending" ? "text-espresso/20" : ""}
                `}
                aria-hidden="true"
              >
                {state === "done" ? "✓" : state === "active" ? icon : "○"}
              </span>
              <span
                className={`
                  ${state === "done"    ? "text-espresso/40" : ""}
                  ${state === "active"  ? "font-medium text-espresso" : ""}
                  ${state === "pending" ? "text-espresso/20" : ""}
                `}
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
