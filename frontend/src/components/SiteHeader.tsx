import { useMemo } from "react";

const STORES = ["All stores", "Indiranagar", "Civil Lines", "Koregaon Park"];

type Props = {
  store: string;
  onStoreChange: (store: string) => void;
};

export function SiteHeader({ store, onStoreChange }: Props) {
  const dateLabel = useMemo(() => {
    return new Date().toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }, []);

  const timeLabel = useMemo(() => {
    return new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }, []);

  return (
    <header className="border-b border-latte bg-paper py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4">
        {/* Brand */}
        <div className="flex items-baseline gap-3">
          <span className="text-base font-semibold tracking-tight text-espresso">
            Sidebrew
          </span>
          <span className="hidden text-xs text-espresso/50 sm:inline">
            Morning operations assistant
          </span>
        </div>

        {/* Right side: date / time / store */}
        <div className="flex items-center gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-xs font-medium text-espresso/80">{dateLabel}</p>
            <p className="label mt-0.5 text-caramel">{timeLabel}</p>
          </div>

          {/* Divider */}
          <div className="hidden h-6 w-px bg-latte sm:block" />

          {/* Store selector */}
          <label className="flex items-center gap-2 text-xs">
            <span className="label text-caramel">Store</span>
            <select
              value={store}
              onChange={(e) => onStoreChange(e.target.value)}
              className="
                border border-latte bg-cream py-1 pl-2 pr-6 text-xs
                text-espresso focus:border-caramel focus:outline-none
                cursor-pointer appearance-none rounded-sm
                bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%234A3026%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')]
                bg-[right_6px_center] bg-no-repeat
              "
            >
              {STORES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </header>
  );
}
