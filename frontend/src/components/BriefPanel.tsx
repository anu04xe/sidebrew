import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { BriefResponse } from "../types";

type Props = {
  brief: BriefResponse;
  onCopy: () => Promise<void>;
  pdfUrl: string;
};

function severityClass(severity: string) {
  if (severity === "high") return "text-warning";
  if (severity === "medium") return "text-coffee";
  return "text-ink";
}

export function BriefPanel({ brief, onCopy, pdfUrl }: Props) {
  return (
    <section className="border border-line bg-paper p-5 shadow-sheet">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line pb-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-coffee">Sidebrew</p>
          <h1 className="text-xl font-semibold tracking-tight text-ink">Morning Brief</h1>
          <p className="text-xs text-ink/70">{brief.synthetic_data_notice}</p>
        </div>
        <div className="text-right text-xs text-ink/70">
          <p>Last updated {new Date(brief.generated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
          <p>{brief.observations.length} things need attention</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {brief.kpis.map((kpi) => (
          <div key={kpi.label} className="border border-line p-3">
            <p className="font-mono text-[10px] uppercase tracking-wider text-coffee">{kpi.label}</p>
            <p className="text-lg font-semibold">{kpi.formatted}</p>
            <p className="text-xs text-ink/70">{kpi.change_pct === null ? "vs baseline N/A" : `${kpi.change_pct > 0 ? "+" : ""}${kpi.change_pct}% vs baseline`}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-coffee">Things worth noticing</p>
          <ul className="mt-2 space-y-2 text-sm">
            {brief.observations.length === 0 && <li className="text-ink/70">No significant anomalies detected.</li>}
            {brief.observations.map((obs, idx) => (
              <li key={`${obs.title}-${idx}`} className="border-l border-line pl-3">
                <p className="font-semibold text-ink">
                  {(idx + 1).toString().padStart(2, "0")} {obs.title}
                </p>
                <p className={`text-sm ${severityClass(obs.severity)}`}>{obs.explanation}</p>
              </li>
            ))}
          </ul>

          <p className="mt-5 font-mono text-xs uppercase tracking-wider text-coffee">Today's actions</p>
          <ul className="mt-2 space-y-1 text-sm">
            {brief.actions.map((action, idx) => (
              <li key={idx}>→ {action}</li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <button onClick={onCopy} className="border border-ink px-3 py-1 text-xs uppercase tracking-wider hover:bg-ink hover:text-ivory">
              Copy Brief
            </button>
            <a href={pdfUrl} target="_blank" rel="noreferrer" className="border border-coffee px-3 py-1 text-xs uppercase tracking-wider hover:bg-coffee hover:text-ivory">
              Export PDF
            </a>
          </div>
        </div>

        <div className="border border-line p-3">
          <p className="font-mono text-xs uppercase tracking-wider text-coffee">Sales rhythm vs baseline</p>
          <div className="mt-3 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={brief.chart_series}>
                <XAxis dataKey="hour" hide />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#6f4f37" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="baseline" stroke="#9da58d" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <p className="font-mono uppercase tracking-wider text-coffee">Inventory warnings</p>
            {brief.inventory_risks.slice(0, 4).map((risk) => (
              <div key={risk.item} className="border border-line px-2 py-1">
                <p className="font-semibold">{risk.item}</p>
                <p className="text-ink/70">
                  {risk.current_quantity} {risk.unit} · {risk.average_daily_usage} {risk.unit}/day · {risk.estimated_days_remaining ?? "N/A"} days
                </p>
                {risk.reorder_recommended && <p className="text-warning">Reorder recommended</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
