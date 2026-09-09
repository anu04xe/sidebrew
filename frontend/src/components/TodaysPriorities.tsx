import { useState } from "react";

type Props = {
  actions: string[];
  onItemDone?: (text: string) => void;
};

type Item = { id: string; text: string; done: boolean };

// State is initialised once from props on mount — the checklist is for the
// current session only, so resetting on parent re-render would be wrong.
export function TodaysPriorities({ actions, onItemDone }: Props) {
  const [items, setItems] = useState<Item[]>(() =>
    actions.map((text, i) => ({ id: String(i), text, done: false }))
  );

  function toggle(id: string) {
    setItems((prev) => {
      return prev.map((item) => {
        if (item.id !== id) return item;
        const nowDone = !item.done;
        if (nowDone && onItemDone) onItemDone(item.text);
        return { ...item, done: nowDone };
      });
    });
  }

  if (items.length === 0) return null;

  const allDone = items.every((i) => i.done);

  return (
    <div>
      <p className="label mb-3 text-caramel">Today's checklist</p>
      <ul className="space-y-2.5" role="list">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-3">
            <input
              id={`check-${item.id}`}
              type="checkbox"
              checked={item.done}
              onChange={() => toggle(item.id)}
              className="checklist-checkbox mt-0.5"
            />
            <label
              htmlFor={`check-${item.id}`}
              className={`
                cursor-pointer select-none text-sm leading-snug transition-all duration-200
                ${item.done
                  ? "text-espresso/30 line-through decoration-espresso/20"
                  : "text-espresso/75"
                }
              `}
            >
              {item.text}
            </label>
          </li>
        ))}
      </ul>

      {allDone && (
        <p className="mt-3 text-xs text-sage">✓ All done for today.</p>
      )}
    </div>
  );
}
