type Props = {
  narrative: string;
  generatedAt: string;
  syntheticDataNotice: string;
  observationCount: number;
  onCopy: () => void;
  pdfUrl: string;
};

export function MorningBrief({
  narrative,
  generatedAt,
  syntheticDataNotice,
  observationCount,
  onCopy,
  pdfUrl,
}: Props) {
  const updatedTime = new Date(generatedAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const paragraphs = narrative
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const attentionLine =
    observationCount === 0
      ? "Nothing unusual today. Operations are tracking normally."
      : observationCount === 1
      ? "1 thing needs your attention today."
      : `${observationCount} things need your attention today.`;

  return (
    <div>
      {/* Report header */}
      <div className="mb-1 flex items-start justify-between gap-4">
        <div>
          <p className="label text-caramel">Daily report</p>
          <p className="mt-1 text-[13px] font-medium text-espresso/60">
            {attentionLine}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-espresso/35">Generated</p>
          <p className="text-[11px] text-espresso/50">{updatedTime}</p>
        </div>
      </div>

      {/* Thin rule */}
      <div className="my-4 h-px bg-latte" />

      {/* Narrative */}
      <div className="space-y-2.5">
        {paragraphs.map((para, idx) => (
          <p
            key={idx}
            className={`leading-relaxed ${
              idx === 0
                ? "text-[15px] font-medium text-espresso"
                : "text-sm text-espresso/70"
            }`}
          >
            {para}
          </p>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button onClick={onCopy} className="btn-primary">
          Copy report
        </button>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
        >
          Export PDF
        </a>
      </div>

      {/* Data notice */}
      <p className="mt-3 text-[10px] text-espresso/25">{syntheticDataNotice}</p>
    </div>
  );
}
