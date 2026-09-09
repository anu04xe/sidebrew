import type { BriefResponse } from "../types";

type Props = {
  brief: BriefResponse;
};

export function AutomatedThisMorning({ brief }: Props) {
  const ordersKpi = brief.kpis.find((k) => k.label === "Orders");
  const orderCount = ordersKpi ? ordersKpi.formatted : "—";
  const days = 7; // baseline window

  const steps = [
    { label: "Sales data processed", detail: null },
    { label: `${orderCount} orders checked`, detail: null },
    { label: `${days}-day patterns compared`, detail: null },
    { label: "Inventory checked", detail: null },
    { label: "Morning report generated", detail: null },
  ];

  return (
    <div className="py-1">
      <p className="label mb-3 text-caramel">Automated this morning</p>
      <ol className="space-y-2">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-3">
            <span className="text-sm text-sage" aria-hidden="true">✓</span>
            <span className="text-sm text-espresso/70">{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
