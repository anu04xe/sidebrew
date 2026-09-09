import type { InventoryRisk } from "../types";

type Props = {
  inventory: InventoryRisk[];
  onAddToChecklist?: (item: string) => void;
};

type Level = "critical" | "warning" | "watch" | "ok";

function level(risk: InventoryRisk): Level {
  if (risk.reorder_recommended) {
    return risk.estimated_days_remaining !== null && risk.estimated_days_remaining <= 1
      ? "critical"
      : "warning";
  }
  if (risk.estimated_days_remaining !== null && risk.estimated_days_remaining <= 3) return "watch";
  return "ok";
}

const LEVEL_CONFIG = {
  critical: { label: "Reorder now", cls: "text-terra bg-terra-light" },
  warning:  { label: "Running low", cls: "text-caramel bg-caramel/10" },
  watch:    { label: "Watch",       cls: "text-espresso/60 bg-latte/50" },
  ok:       { label: "OK",          cls: "text-sage bg-sage-light" },
};

function fillPct(risk: InventoryRisk): number {
  if (risk.estimated_days_remaining === null) return 50;
  return Math.min(Math.max((risk.estimated_days_remaining / 7) * 100, 2), 100);
}

function barColor(l: Level): string {
  if (l === "critical") return "bg-terra";
  if (l === "warning")  return "bg-caramel";
  if (l === "watch")    return "bg-beige";
  return "bg-sage";
}

function daysText(days: number | null): string {
  if (days === null) return "";
  if (days < 1) return "Less than a day left";
  if (days < 2) return "About 1 day left";
  return `${Math.round(days)} days left`;
}

export function StockWatch({ inventory, onAddToChecklist }: Props) {
  if (inventory.length === 0) return null;

  return (
    <div>
      <p className="label mb-3 text-caramel">Stock watch</p>
      <div className="space-y-4">
        {inventory.slice(0, 5).map((risk) => {
          const l = level(risk);
          const cfg = LEVEL_CONFIG[l];
          const fill = fillPct(risk);
          const bar = barColor(l);

          return (
            <div key={risk.item}>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold text-espresso">{risk.item}</span>
                <div className="flex items-center gap-2">
                  {(l === "critical" || l === "warning") && onAddToChecklist && (
                    <button
                      onClick={() => onAddToChecklist(`Reorder ${risk.item.toLowerCase()}`)}
                      className="text-[10px] text-caramel underline underline-offset-2 hover:text-caramel/80"
                    >
                      + checklist
                    </button>
                  )}
                  <span className={`rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${cfg.cls}`}>
                    {cfg.label}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="progress-track mt-1.5">
                <div
                  className={`progress-fill ${bar}`}
                  style={{ width: `${fill}%` }}
                  role="progressbar"
                  aria-valuenow={Math.round(fill)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${risk.item} stock level`}
                />
              </div>

              <p className="mt-1 text-[11px] text-espresso/45">
                {risk.current_quantity} {risk.unit} remaining
                {risk.estimated_days_remaining !== null && (
                  <> · {daysText(risk.estimated_days_remaining)}</>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
