import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { goblins, gangs, gangHue } from "@/lib/goblins";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Goblin Guild — Pick a Goblin to Chat With" },
      { name: "description", content: "Scroll through all 120 goblins across 30 gangs and pick one to talk to." },
      { property: "og:title", content: "Goblin Guild — Pick a Goblin to Chat With" },
      { property: "og:description", content: "Scroll through all 120 goblins across 30 gangs and pick one to talk to." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [q, setQ] = useState("");
  const [gang, setGang] = useState<string | null>(null);
  const list = useMemo(() => {
    const t = q.toLowerCase();
    return goblins.filter(
      (g) =>
        (!gang || g.gang === gang) &&
        (!t || `${g.name} ${g.theme} ${g.room} ${g.gang}`.toLowerCase().includes(t)),
    );
  }, [q, gang]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-5xl text-primary md:text-7xl">Goblin Guild</h1>
        <p className="mt-3 text-lg text-muted-foreground">120 goblins. 30 gangs. Pick one and start talking.</p>
      </header>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, vibe, room…"
        className="mb-4 w-full rounded-full border-2 border-border bg-card px-5 py-3 text-lg outline-none focus:border-ring"
      />
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setGang(null)}
          className={`rounded-full px-3 py-1 text-sm font-bold ${!gang ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
        >
          All gangs
        </button>
        {gangs.map((g) => (
          <button
            key={g}
            onClick={() => setGang(gang === g ? null : g)}
            style={{ "--gang-hue": gangHue(g) } as React.CSSProperties}
            className={`rounded-full border-2 px-3 py-1 text-sm font-bold gang-tint ${gang === g ? "gang-ring" : "border-transparent"}`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((g) => (
          <Link
            key={g.number}
            to="/goblin/$id"
            params={{ id: String(g.number) }}
            style={{ "--gang-hue": gangHue(g.gang) } as React.CSSProperties}
            className="group flex flex-col rounded-2xl border-2 bg-card p-5 shadow-goblin transition-transform gang-ring hover:-translate-y-1"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-xl gang-tint">
                {g.name[0]}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-xl">{g.name}</h2>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {g.gang}
                  {g.founder && " · Founder"} · {g.room}
                </p>
              </div>
            </div>
            <p className="mt-3 font-bold text-accent">{g.theme}</p>
            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{g.monologue}</p>
            <span className="mt-4 text-sm font-bold text-primary group-hover:underline">Talk to {g.name} →</span>
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="text-center text-muted-foreground">No goblins here. Spooky.</p>}
    </main>
  );
}
