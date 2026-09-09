import { useEffect, useMemo, useRef, useState } from "react";

import { AtAGlance } from "./components/AtAGlance";
import { AutomatedThisMorning } from "./components/AutomatedThisMorning";
import { BrewingLoader } from "./components/BrewingLoader";
import { CafePulse } from "./components/CafePulse";
import { CoffeeOrders } from "./components/CoffeeOrders";
import { MorningBrief } from "./components/MorningBrief";
import { SalesRhythm } from "./components/SalesRhythm";
import { StockWatch } from "./components/StockWatch";
import { TodaysPriorities } from "./components/TodaysPriorities";
import { ToastContainer, useToasts } from "./components/ToastContainer";
import { UploadPanel } from "./components/UploadPanel";
import { WhatChanged } from "./components/WhatChanged";
import { fetchBrief, fetchCopyBrief, pdfLink, seedData } from "./services/api";
import type { BriefResponse, ImportResult } from "./types";

const STORES = ["All stores", "Indiranagar", "Civil Lines", "Koregaon Park"];

function useNow() {
  const [now] = useState(() => new Date());
  return now;
}

function getGreeting(h: number) {
  if (h < 12) return "Good morning.";
  if (h < 17) return "Good afternoon.";
  return "Good evening.";
}

function App() {
  const [brief, setBrief]   = useState<BriefResponse | null>(null);
  const [store, setStore]   = useState("All stores");
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const { toasts, addToast, dismissToast } = useToasts();
  const now = useNow();

  // Track if this is the first load (seeding) vs a user-triggered brew
  const isFirstLoad = useRef(true);

  async function loadBrief(selectedStore = store, quiet = false) {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchBrief(selectedStore);
      setBrief(next);
      if (!quiet) {
        const obs = next.observations.length;
        const msg = obs === 0
          ? "Morning report ready. Nothing unusual today."
          : obs === 1
          ? "Morning report ready. 1 thing needs attention."
          : `Morning report ready. ${obs} things need attention.`;
        addToast(msg, "success");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load report";
      setError(msg);
      if (!quiet) addToast("Could not load report.", "warning");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try { await seedData(); } catch { /* ignore */ }
      await loadBrief(store, true); // quiet first load — no toast on page open
      isFirstLoad.current = false;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStoreChange(s: string) {
    setStore(s);
    await loadBrief(s, true);
  }

  async function handleCopy() {
    try {
      const { text } = await fetchCopyBrief(store);
      await navigator.clipboard.writeText(text);
      addToast("Report copied to clipboard.", "success");
    } catch {
      addToast("Could not copy report.", "warning");
    }
  }

  function handleImported(result: ImportResult) {
    addToast(
      `${result.imported_rows.toLocaleString()} orders processed.${result.warnings > 0 ? ` ${result.warnings} rows flagged.` : ""}`,
      result.warnings > 0 ? "warning" : "success"
    );
    loadBrief(store);
  }

  function handleChecklistDone(text: string) {
    addToast(`"${text}" marked done.`);
  }

  const currentPdfLink = useMemo(() => pdfLink(store), [store]);

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const greeting = getGreeting(now.getHours());

  return (
    <div className="min-h-screen bg-cream">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="border-b border-latte bg-paper">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-baseline gap-2.5">
            <span className="text-sm font-semibold text-espresso">Sidebrew</span>
            <span className="hidden text-xs text-espresso/40 sm:inline">
              Morning operations assistant
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-espresso/50 sm:inline">
              {dateStr} · {timeStr}
            </span>
            <div className="h-4 w-px bg-latte" />
            <select
              value={store}
              onChange={(e) => handleStoreChange(e.target.value)}
              className="
                cursor-pointer appearance-none rounded-sm border border-latte
                bg-cream py-1 pl-2 pr-5 text-xs text-espresso
                focus:border-caramel focus:outline-none
              "
              aria-label="Select store"
            >
              {STORES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────── */}
      <main className="mx-auto max-w-2xl px-5 pb-20">

        {/* ── Greeting ────────────────────────────────────── */}
        <div className="pb-2 pt-8">
          <h1 className="text-2xl font-semibold tracking-tight text-espresso">
            {greeting}
          </h1>
          {brief && !loading && (
            <p className="mt-1 text-sm text-espresso/50">
              {brief.observations.length === 0
                ? "Operations are tracking normally today."
                : brief.observations.length === 1
                ? "One thing needs your attention today."
                : `${brief.observations.length} things need your attention today.`}
            </p>
          )}
        </div>

        {/* ── Loading state ────────────────────────────────── */}
        {loading && (
          <div className="mt-4">
            <BrewingLoader visible={loading} />
          </div>
        )}

        {/* ── Error ────────────────────────────────────────── */}
        {!loading && error && (
          <div className="mt-4 rounded-sm border border-terra/30 bg-terra-light px-4 py-3 text-sm text-terra">
            {error}
          </div>
        )}

        {/* ── Content ──────────────────────────────────────── */}
        {!loading && !error && brief && (
          <div>

            {/* 1. AUTOMATED THIS MORNING */}
            <section className="mt-6 border-t border-latte pt-6">
              <AutomatedThisMorning brief={brief} />
            </section>

            {/* 2. TODAY AT A GLANCE */}
            <section className="mt-8 border-t border-latte pt-6">
              <AtAGlance brief={brief} />
            </section>

            {/* 3. COFFEE ORDERS */}
            {brief.top_products && Object.keys(brief.top_products).length > 0 && (
              <section className="mt-8 border-t border-latte pt-6">
                <CoffeeOrders brief={brief} />
              </section>
            )}

            {/* 4. SALES RHYTHM */}
            {brief.chart_series.length > 0 && (
              <section className="mt-8 border-t border-latte pt-6">
                <SalesRhythm chartSeries={brief.chart_series} />
              </section>
            )}

            {/* 5. WHAT CHANGED */}
            <section className="mt-8 border-t border-latte pt-6">
              <WhatChanged observations={brief.observations} />
            </section>

            {/* 6. TODAY'S CHECKLIST */}
            {brief.actions.length > 0 && (
              <section className="mt-8 border-t border-latte pt-6">
                <TodaysPriorities
                  actions={brief.actions}
                  onItemDone={handleChecklistDone}
                />
              </section>
            )}

            {/* 7. STOCK WATCH */}
            {brief.inventory_risks.length > 0 && (
              <section className="mt-8 border-t border-latte pt-6">
                <StockWatch inventory={brief.inventory_risks} />
              </section>
            )}

            {/* 8. CAFE PULSE */}
            <section className="mt-8 border-t border-latte pt-6">
              <CafePulse brief={brief} />
            </section>

            {/* 9. DAILY REPORT — the payoff */}
            <section className="mt-10 border-t-2 border-caramel/30 pt-8">
              <MorningBrief
                narrative={brief.narrative}
                generatedAt={brief.generated_at}
                syntheticDataNotice={brief.synthetic_data_notice}
                observationCount={brief.observations.length}
                onCopy={handleCopy}
                pdfUrl={currentPdfLink}
              />
            </section>

            {/* 10. IMPORT / BREW */}
            <section className="mt-10 border-t border-latte pt-8">
              <UploadPanel onImported={handleImported} />
            </section>

          </div>
        )}

        {/* ── Empty state ───────────────────────────────────── */}
        {!loading && !error && !brief && (
          <div className="mt-10">
            <p className="mb-6 text-sm text-espresso/50">
              No sales data yet. Import a CSV to generate your first report.
            </p>
            <UploadPanel onImported={handleImported} />
          </div>
        )}
      </main>

      {/* ── Toast notifications ───────────────────────────── */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
