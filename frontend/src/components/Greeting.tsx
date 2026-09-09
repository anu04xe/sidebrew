import { useMemo } from "react";

type Props = {
  store: string;
  observationCount: number;
};

function getGreeting(hour: number): string {
  if (hour < 12) return "Good morning.";
  if (hour < 17) return "Good afternoon.";
  return "Good evening.";
}

function getContext(observationCount: number, store: string): string {
  const storeLabel = store === "All stores" ? "across your cafes" : `at ${store}`;
  if (observationCount === 0) {
    return `Operations look steady ${storeLabel} today.`;
  }
  if (observationCount === 1) {
    return `One thing needs your attention ${storeLabel}.`;
  }
  return `${observationCount} things need your attention ${storeLabel}.`;
}

export function Greeting({ store, observationCount }: Props) {
  const hour = new Date().getHours();
  const greeting = useMemo(() => getGreeting(hour), [hour]);
  const context = useMemo(() => getContext(observationCount, store), [observationCount, store]);

  return (
    <div className="py-5">
      <h2 className="text-2xl font-semibold tracking-tight text-espresso">
        {greeting}
      </h2>
      <p className="mt-1 text-sm text-espresso/60">{context}</p>
    </div>
  );
}
