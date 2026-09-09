import type { Observation } from "../types";

type Props = {
  observations: Observation[];
};

function parseObservation(obs: Observation): {
  direction: "up" | "down" | "warn";
  pct: string | null;
  subject: string;
  detail: string;
} {
  const lower = obs.explanation.toLowerCase();
  const direction: "up" | "down" | "warn" =
    lower.includes("above") ? "up" :
    lower.includes("below") ? "down" : "warn";

  const pctMatch = obs.explanation.match(/(\d+(?:\.\d+)?)%/);
  const pct = pctMatch ? `${Math.round(Number(pctMatch[1]))}%` : null;

  const word = direction === "up" ? "more" : direction === "down" ? "fewer" : "";
  const detail = pct && word
    ? `${pct} ${word} than usual`
    : obs.explanation.replace(/the recent \d+-day average\.?/, "usual.").trim();

  return { direction, pct, subject: obs.title, detail };
}

const dirIcon = {
  up:   { sym: "↑", textCls: "text-sage",    bgCls: "bg-sage-light" },
  down: { sym: "↓", textCls: "text-terra",   bgCls: "bg-terra-light" },
  warn: { sym: "!",  textCls: "text-caramel", bgCls: "bg-caramel/10" },
};

export function WhatChanged({ observations }: Props) {
  if (observations.length === 0) {
    return (
      <div>
        <p className="label mb-3 text-caramel">What changed?</p>
        <p className="text-sm text-espresso/45">
          Nothing unusual today. Operations are tracking normally.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="label mb-3 text-caramel">What changed?</p>
      <div className="space-y-3">
        {observations.slice(0, 4).map((obs, idx) => {
          const { direction, subject, detail } = parseObservation(obs);
          const icon = dirIcon[direction];

          return (
            <div
              key={`${obs.title}-${idx}`}
              className="flex items-start gap-3"
            >
              <span
                className={`
                  mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center
                  rounded-sm text-[10px] font-bold
                  ${icon.bgCls} ${icon.textCls}
                `}
                aria-hidden="true"
              >
                {icon.sym}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-espresso">
                  {subject}
                </p>
                <p className="mt-0.5 text-xs text-espresso/55">{detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
