import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartPoint = { hour: string; revenue: number; baseline: number };
type Props = { chartSeries: ChartPoint[] };

function summary(series: ChartPoint[]): string {
  if (!series.length) return "";
  const rev = series.reduce((s, p) => s + p.revenue, 0);
  const base = series.reduce((s, p) => s + p.baseline, 0);
  if (!base) return "";
  const pct = ((rev - base) / base) * 100;
  if (Math.abs(pct) < 4) return "Tracking close to the usual daily pattern.";
  return pct > 0
    ? `Running ${pct.toFixed(0)}% above the recent daily pattern.`
    : `Running ${Math.abs(pct).toFixed(0)}% below the recent daily pattern.`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Tip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rev  = payload.find((p: any) => p.dataKey === "revenue");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const base = payload.find((p: any) => p.dataKey === "baseline");
  return (
    <div className="rounded-sm border border-latte bg-paper px-3 py-2 text-xs shadow-card">
      <p className="label mb-1 text-caramel">{label}</p>
      {rev  && <p className="text-espresso">Today  <span className="font-semibold">₹{Number(rev.value).toLocaleString("en-IN")}</span></p>}
      {base && <p className="text-espresso/45">Usual  ₹{Number(base.value).toLocaleString("en-IN")}</p>}
    </div>
  );
}

export function SalesRhythm({ chartSeries }: Props) {
  if (!chartSeries.length) return null;

  const labelSet = new Set(["08:00", "12:00", "16:00", "20:00"]);
  const ticks = chartSeries.map((p) => p.hour).filter((h) => labelSet.has(h));

  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-3">
        <p className="label text-caramel">Sales rhythm</p>
        <div className="flex gap-4 text-[10px] text-espresso/40">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-px w-4 bg-caramel" />Today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-px w-4 border-t border-dashed border-beige" />Usual
          </span>
        </div>
      </div>

      {summary(chartSeries) && (
        <p className="mb-3 text-xs text-espresso/50">{summary(chartSeries)}</p>
      )}

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartSeries} margin={{ top: 2, right: 2, bottom: 0, left: 0 }}>
            <XAxis
              dataKey="hour"
              ticks={ticks}
              tick={{ fontSize: 9, fill: "#4A3026", opacity: 0.35 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<Tip />} />
            <Line type="monotone" dataKey="revenue"  stroke="#B97950" strokeWidth={2}   dot={false} activeDot={{ r: 3, fill: "#B97950", stroke: "#FFFDF9", strokeWidth: 2 }} />
            <Line type="monotone" dataKey="baseline" stroke="#D5BCA5" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
