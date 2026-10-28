import { useMemo, useState } from "react";

const DAYS = 371; // 53 weeks
const DAY_LABELS = ["Mon", "Wed", "Fri"];

function dayKey(d) {
  const date = typeof d === "string" ? new Date(d) : d;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function ContributionGraph({ resolvedDates }) {
  const [hover, setHover] = useState(null);

  const counts = useMemo(() => {
    const map = new Map();
    for (const iso of resolvedDates) {
      if (!iso) continue;
      const k = dayKey(iso);
      map.set(k, (map.get(k) ?? 0) + 1);
    }
    return map;
  }, [resolvedDates]);

  const weeks = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));
    const start = new Date(end);
    start.setDate(end.getDate() - (DAYS - 1));

    const cells = [];
    for (let i = 0; i < DAYS; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const count = date > today ? 0 : (counts.get(dayKey(date)) ?? 0);
      const level = count === 0 ? 0 : count < 2 ? 1 : count < 4 ? 2 : count < 7 ? 3 : 4;
      cells.push({ date, count, level });
    }
    const out = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [counts]);

  const total = useMemo(
    () => weeks.flat().reduce((sum, c) => sum + c.count, 0),
    [weeks],
  );

  const streak = useMemo(() => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    const flat = weeks.flat().filter((c) => c.date <= now);
    let s = 0;
    for (let i = flat.length - 1; i >= 0; i -= 1) {
      if (flat[i].count > 0) s += 1;
      else if (i === flat.length - 1) continue;
      else break;
    }
    return s;
  }, [weeks]);

  const opacity = [0.06, 0.28, 0.5, 0.74, 1];

  return (
    <section className="mt-8 rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-semibold">
            {total.toLocaleString()} issues resolved in the last year
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Current streak: {streak} day{streak === 1 ? "" : "s"} · every square is an issue you
            closed
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          Less
          {opacity.map((o) => (
            <span
              key={o}
              className="size-3 rounded-[3px]"
              style={{ backgroundColor: `color-mix(in oklab, var(--primary) ${o * 100}%, var(--surface-elevated))` }}
            />
          ))}
          More
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <div className="hide-scrollbar flex flex-1 gap-[3px] overflow-x-auto pb-1">
          <div className="mr-1 flex shrink-0 flex-col justify-between py-[1px] text-[9px] text-muted-foreground">
            {DAY_LABELS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex shrink-0 flex-col gap-[3px]">
              {week.map((cell) => (
                <span
                  key={cell.date.toISOString()}
                  onMouseEnter={() => setHover(cell)}
                  onMouseLeave={() => setHover(null)}
                  className="size-[11px] rounded-[3px] transition-transform hover:scale-150"
                  style={{
                    backgroundColor: `color-mix(in oklab, var(--primary) ${opacity[cell.level] * 100}%, var(--surface-elevated))`,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 h-4 text-xs text-muted-foreground">
        {hover
          ? `${hover.count} issue${hover.count === 1 ? "" : "s"} resolved on ${hover.date.toDateString()}`
          : "Resolve issues on your projects to light up this graph."}
      </p>
    </section>
  );
}
