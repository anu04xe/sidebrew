import type { BriefResponse } from "../types";

type Props = {
  brief: BriefResponse;
};

type Status = "busy" | "active" | "steady" | "quiet";

const STATUS_CONFIG: Record<Status, { label: string; dotCls: string; textCls: string; pulse: boolean }> = {
  busy:   { label: "Busy",   dotCls: "bg-caramel", textCls: "text-caramel",    pulse: true  },
  active: { label: "Active", dotCls: "bg-sage",    textCls: "text-sage",       pulse: true  },
  steady: { label: "Steady", dotCls: "bg-beige",   textCls: "text-espresso/50",pulse: false },
  quiet:  { label: "Quiet",  dotCls: "bg-latte",   textCls: "text-espresso/40",pulse: false },
};

const KNOWN_STORES = ["Indiranagar", "Civil Lines", "Koregaon Park"];

function deriveStatus(storeName: string, brief: BriefResponse): Status {
  const obs = brief.observations;

  // Explicit store-level observation
  const storeObs = obs.find(
    (o) => o.title.toLowerCase() === storeName.toLowerCase()
  );
  if (storeObs && storeObs.explanation.toLowerCase().includes("below")) return "quiet";

  // High-severity item means things are busy
  const hasHigh = obs.some((o) => o.severity === "high");
  if (hasHigh) return "busy";
  if (obs.length >= 2) return "active";
  return "steady";
}

export function CafePulse({ brief }: Props) {
  const statuses = KNOWN_STORES.map((name) => ({
    name,
    status: deriveStatus(name, brief),
  }));

  return (
    <div>
      <p className="label mb-3 text-caramel">Cafe pulse</p>
      <div className="space-y-2">
        {statuses.map(({ name, status }) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={name} className="flex items-center justify-between gap-3">
              <span className="text-xs text-espresso/70">{name}</span>
              <div className="flex items-center gap-2">
                <span className={`label ${cfg.textCls}`}>{cfg.label}</span>
                <span
                  className={`
                    pulse-ring ${
                      status === "busy" ? "pulse-ring-caramel" :
                      status === "active" ? "pulse-ring-sage" : ""
                    }
                  `}
                  aria-hidden="true"
                >
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${cfg.dotCls}`}
                  />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
