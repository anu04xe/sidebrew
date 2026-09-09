import { useRef, useState } from "react";

import { importCsv } from "../services/api";
import type { ImportResult } from "../types";

type Props = {
  onImported: (result: ImportResult) => void;
};

export function UploadPanel({ onImported }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function pickFile(f: File | null | undefined) {
    if (!f) return;
    setSelectedFile(f);
    setResult(null);
    setError(null);
  }

  async function brew() {
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    try {
      const imported = await importCsv(selectedFile);
      setResult(imported);
      onImported(imported);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="label mb-1 text-caramel">Automate today's report</p>
      <p className="mb-4 text-xs text-espresso/50">
        Drop yesterday's sales CSV and Sidebrew will do the rest.
      </p>

      {/* Drop zone */}
      <div
        className={`drop-zone rounded-sm p-5 text-center ${dragOver ? "drag-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f?.name.endsWith(".csv")) pickFile(f);
          else if (f) setError("Please drop a .csv file.");
        }}
        role="region"
        aria-label="Drop zone for CSV sales file"
      >
        {selectedFile ? (
          <div className="space-y-1">
            <p className="text-xs font-semibold text-espresso">{selectedFile.name}</p>
            <p className="text-xs text-espresso/45">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
            {!result && (
              <p className="text-[11px] text-sage">✓ Ready to analyse</p>
            )}
            {!loading && (
              <button
                onClick={() => { setSelectedFile(null); setResult(null); setError(null); if (fileRef.current) fileRef.current.value = ""; }}
                className="mt-1 text-[11px] text-espresso/35 underline underline-offset-2 hover:text-espresso/60"
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-espresso/40">
              Drop yesterday's sales here
            </p>
            <p className="text-[11px] text-espresso/30">or</p>
            <label className="cursor-pointer">
              <span className="text-xs text-caramel underline underline-offset-2 hover:text-caramel/70">
                choose a CSV file
              </span>
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                className="sr-only"
                onChange={(e) => pickFile(e.target.files?.[0])}
                aria-label="Choose a CSV sales file"
              />
            </label>
          </div>
        )}
      </div>

      {/* CTA */}
      <button
        onClick={brew}
        disabled={!selectedFile || loading}
        className="btn-primary mt-3 w-full"
        aria-label="Import CSV and brew the report"
      >
        {loading ? (
          <>
            <span className="blink inline-block h-1.5 w-1.5 rounded-full bg-cream/60" aria-hidden="true" />
            Brewing…
          </>
        ) : (
          "Brew the report"
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-3 rounded-sm border border-terra/30 bg-terra-light px-3 py-2 text-xs text-terra">
          {error}
        </div>
      )}

      {/* Success summary */}
      {result && !loading && (
        <div className="mt-3 rounded-sm border border-sage/30 bg-sage-light px-3 py-2.5">
          <p className="text-xs font-semibold text-espresso">
            {result.imported_rows.toLocaleString()} orders processed
          </p>
          <p className="mt-0.5 text-[11px] text-espresso/50">
            {result.file_name}
            {result.warnings > 0 && ` · ${result.warnings} warnings`}
            {result.duplicates_skipped > 0 && ` · ${result.duplicates_skipped} duplicates skipped`}
          </p>
        </div>
      )}
    </div>
  );
}
