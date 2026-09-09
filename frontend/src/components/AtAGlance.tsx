import type { BriefResponse, KPI } from "../types";

type Props = {
  brief: BriefResponse;
};

function trendText(change_pct: number | null): { text: string; cls: string } {
  if (change_pct === null) return { text: "", cls: "" };
  if (Math.abs(change_pct) < 3) return { text: "Same as usual", cls: "text-espresso/40" };
  const dir = change_pct > 0 ? "↑" : "↓";
  const mag = Math.abs(change_pct).toFixed(0);
  return {
    text: `${dir} ${mag}% from usual`,
    cls: change_pct > 0 ? "text-sage" : "text-terra",
  };
}

function StatBlock({ kpi }: { kpi: KPI }) {
  const trend = trendText(kpi.change_pct);
  return (
    <div className="min-w-0">
      <p className="text-2xl font-semibold tracking-tight text-espresso">
        {kpi.formatted}
      </p>
      <p className="mt-0.5 text-xs text-espresso/50">{kpi.label}</p>
      {trend.text && (
        <p className={`mt-0.5 text-[11px] ${trend.cls}`}>{trend.text}</p>
      )}
    </div>
  );
}

export function AtAGlance({ brief }: Props) {
  const { kpis, busiest_hour, coffee_order_count } = brief;
  if (kpis.length === 0) return null;

  const revenue = kpis.find((k) => k.label === "Revenue");
  const orders  = kpis.find((k) => k.label === "Orders");
  const aov     = kpis.find((k) => k.label === "AOV");

  return (
    <div>
      <p className="label mb-4 text-caramel">Today at a glance</p>

      {/* Primary stats row */}
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {revenue && <StatBlock kpi={revenue} />}
        {orders  && <StatBlock kpi={orders} />}
        {aov     && <StatBlock kpi={aov} />}
      </div>

      {/* Secondary detail strip */}
      {(coffee_order_count > 0 || busiest_hour) && (
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-latte pt-4">
          {coffee_order_count > 0 && (
            <div>
              <p className="text-sm font-medium text-espresso">{coffee_order_count}</p>
              <p className="text-xs text-espresso/45">Coffee orders</p>
            </div>
          )}
          {busiest_hour && (
            <div>
              <p className="text-sm font-medium text-espresso">{busiest_hour}</p>
              <p className="text-xs text-espresso/45">Busiest hour</p>
            </div>
          )}
          {orders && coffee_order_count > 0 && (
            <div>
              <p className="text-sm font-medium text-espresso">
                {Math.round((coffee_order_count / Number(orders.formatted.replace(/,/g, ""))) * 100)}%
              </p>
              <p className="text-xs text-espresso/45">Coffee share</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
