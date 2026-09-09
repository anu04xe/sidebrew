import type { BriefResponse } from "../types";

type Props = {
  brief: BriefResponse;
};

// Items that are coffee drinks
const COFFEE_ITEMS = new Set([
  "espresso", "cappuccino", "latte", "flat white", "cold coffee",
  "americano", "mocha", "iced latte", "macchiato", "cortado",
]);

function isCoffee(name: string): boolean {
  return COFFEE_ITEMS.has(name.toLowerCase());
}

export function CoffeeOrders({ brief }: Props) {
  const { top_products } = brief;

  if (!top_products || Object.keys(top_products).length === 0) return null;

  // Filter to coffee items, sort by quantity desc
  const coffeeItems = Object.entries(top_products)
    .filter(([name]) => isCoffee(name))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);

  // If no coffee items identified, show all top products
  const items = coffeeItems.length > 0
    ? coffeeItems
    : Object.entries(top_products).sort(([, a], [, b]) => b - a).slice(0, 6);

  if (items.length === 0) return null;

  const maxQty = items[0][1];

  return (
    <div>
      <p className="label mb-4 text-caramel">Coffee orders</p>
      <div className="space-y-3">
        {items.map(([name, qty]) => {
          const pct = maxQty > 0 ? (qty / maxQty) * 100 : 0;
          return (
            <div key={name} className="group">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="font-medium text-espresso capitalize">{name}</span>
                <span className="tabular-nums text-espresso/50">{qty}</span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-sm bg-latte/50">
                <div
                  className="h-full rounded-sm bg-caramel transition-all duration-700"
                  style={{ width: `${pct}%` }}
                  role="presentation"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Top seller callout */}
      {items.length > 0 && (
        <p className="mt-4 text-xs text-espresso/50">
          <span className="font-medium capitalize text-espresso/70">{items[0][0]}</span>
          {" "}is the most ordered coffee today.
        </p>
      )}
    </div>
  );
}
