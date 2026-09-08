import { useEffect, useMemo, useState } from "react";

import { BriefPanel } from "./components/BriefPanel";
import { UploadPanel } from "./components/UploadPanel";
import { fetchBrief, fetchCopyBrief, pdfLink, seedData } from "./services/api";
import type { BriefResponse } from "./types";

const STORES = ["All stores", "Indiranagar", "Civil Lines", "Koregaon Park"];

function App() {
  const [brief, setBrief] = useState<BriefResponse | null>(null);
  const [store, setStore] = useState<string>("All stores");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadBrief(selectedStore = store) {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchBrief(selectedStore);
      setBrief(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load brief");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        await seedData();
      } catch {
        // ignore when already seeded
      }
      await loadBrief();
    })();
  }, []);

  async function handleCopy() {
    const { text } = await fetchCopyBrief(store);
    await navigator.clipboard.writeText(text);
    alert("Brief copied to clipboard");
  }

  const nowLabel = useMemo(
    () =>
      new Date().toLocaleString([], {
        weekday: "long",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    [],
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 text-ink">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
        <div>
          <p className="text-lg font-semibold tracking-tight">Sidebrew</p>
          <p className="text-sm text-ink/70">Morning operations assistant</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink/75">
          <span>{nowLabel}</span>
          <label className="flex items-center gap-1">
            Store
            <select
              className="border border-line bg-paper px-2 py-1"
              value={store}
              onChange={async (e) => {
                const value = e.target.value;
                setStore(value);
                await loadBrief(value);
              }}
            >
              {STORES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <div className="space-y-4">
        <UploadPanel onImported={() => loadBrief(store)} />

        {loading && <section className="border border-line bg-paper p-8 text-sm">Loading latest morning brief…</section>}
        {error && <section className="border border-warning bg-paper p-4 text-sm text-warning">{error}</section>}
        {!loading && !error && brief && <BriefPanel brief={brief} onCopy={handleCopy} pdfUrl={pdfLink(store)} />}
      </div>
    </main>
  );
}

export default App;
