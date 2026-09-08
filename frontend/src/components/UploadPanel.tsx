import { useRef, useState } from "react";

import { importCsv } from "../services/api";
import type { ImportResult } from "../types";

type Props = {
  onImported: () => Promise<void>;
};

export function UploadPanel({ onImported }: Props) {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const imported = await importCsv(file);
      setResult(imported);
      await onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border border-line bg-paper p-3 shadow-sheet">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-wider text-coffee">CSV Import</p>
          <p className="text-sm text-ink/80">Validate, preview, and import daily sales rows.</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="text-xs" />
          <button
            onClick={handleUpload}
            disabled={loading}
            className="border border-coffee px-3 py-1 text-xs uppercase tracking-wider hover:bg-coffee hover:text-ivory disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import CSV"}
          </button>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-warning">{error}</p>}

      {result && (
        <div className="mt-3 border-t border-line pt-3 text-xs text-ink/85">
          <p className="font-mono uppercase tracking-wide">{result.file_name}</p>
          <p>
            {result.total_rows} rows · {result.valid_rows} valid · {result.warnings} warnings · {result.duplicates_skipped} duplicates skipped
          </p>
          {result.preview.length > 0 && (
            <div className="mt-2 overflow-x-auto">
              <table className="min-w-full border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-line text-left">
                    <th className="pr-3">Timestamp</th>
                    <th className="pr-3">Item</th>
                    <th className="pr-3">Qty</th>
                    <th className="pr-3">Store</th>
                  </tr>
                </thead>
                <tbody>
                  {result.preview.slice(0, 5).map((row, i) => (
                    <tr key={`${row.timestamp}-${i}`} className="border-b border-line/50">
                      <td className="pr-3">{new Date(row.timestamp).toLocaleString()}</td>
                      <td className="pr-3">{row.item}</td>
                      <td className="pr-3">{row.quantity}</td>
                      <td className="pr-3">{row.store}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
