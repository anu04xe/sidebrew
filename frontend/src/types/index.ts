export type KPI = {
  label: string;
  value: number;
  formatted: string;
  change_pct: number | null;
};

export type Observation = {
  title: string;
  explanation: string;
  severity: "high" | "medium" | "low" | string;
};

export type InventoryRisk = {
  item: string;
  current_quantity: number;
  unit: string;
  average_daily_usage: number;
  estimated_days_remaining: number | null;
  reorder_recommended: boolean;
  supplier: string;
  note: string;
};

export type BriefResponse = {
  generated_at: string;
  synthetic_data_notice: string;
  scope_store: string;
  kpis: KPI[];
  observations: Observation[];
  actions: string[];
  chart_series: { hour: string; revenue: number; baseline: number }[];
  inventory_risks: InventoryRisk[];
  narrative: string;
};

export type ImportResult = {
  file_name: string;
  total_rows: number;
  valid_rows: number;
  warnings: number;
  duplicates_skipped: number;
  imported_rows: number;
  invalid_rows: { row_number: number; reason: string }[];
  preview: {
    timestamp: string;
    item: string;
    category: string;
    quantity: number;
    unit_price: number;
    payment_method: string;
    store: string;
    order_type: string;
  }[];
};
