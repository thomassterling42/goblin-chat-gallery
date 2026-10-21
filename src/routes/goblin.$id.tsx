import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { getGoblin, gangHue } from "@/lib/goblins";

export const Route = createFileRoute("/goblin/$id")({
  loader: ({ params }) => {
    const g = getGoblin(Number(params.id));
    if (!g) throw notFound();
    return g;
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `Chat with ${loaderData.name} — Goblin Guild` : "Goblin Guild";
    const d = loaderData ? `${loaderData.name}, ${loaderData.theme.toLowerCase()} of the ${loaderData.gang}.` : "";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: GoblinChat,
});

function GoblinChat() {
  const g = Route.useLoaderData();
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: { goblin: g.number } }), [g.number]);
  const { messages, sendMessage, status, error, stop } = useChat({ id: `goblin-${g.number}`, transport });
  const [input, setInput] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || busy) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <main
      style={{ "--gang-hue": gangHue(g.gang) } as React.CSSProperties}
      className="mx-auto flex h-dvh max-w-3xl flex-col px-4"
    >
      <header className="flex items-center gap-3 border-b-2 py-4 gang-ring">
        <Link to="/" className="rounded-full bg-secondary px-3 py-1 text-sm font-bold">← All goblins</Link>
        <span className="flex h-11 w-11 items-center justify-center rounded-full font-display text-lg gang-tint">{g.name[0]}</span>
        <div className="min-w-0">
          <h1 className="truncate text-2xl">{g.name}</h1>
          <p className="truncate text-xs uppercase tracking-wide text-muted-foreground">
            {g.gang}{g.founder && " · Founder"} · {g.room} · {g.theme}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto py-6">
        <div className="rounded-2xl border-2 bg-card p-4 text-sm italic text-muted-foreground gang-ring">“{g.monologue}”</div>
        {messages.map((m) => {
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          if (!text) return null;
          return m.role === "user" ? (
            <div key={m.id} className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground">
              {text}
            </div>
          ) : (
            <div key={m.id} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-display text-sm gang-tint">{g.name[0]}</span>
              <div className="prose-sm max-w-[85%] leading-relaxed [&_p]:mb-2">
                <ReactMarkdown>{text}</ReactMarkdown>
              </div>
            </div>
          );
        })}
        {status === "submitted" && <p className="animate-pulse text-sm text-muted-foreground">{g.name} is thinking…</p>}
        {error && <p className="rounded-xl bg-destructive px-4 py-2 text-sm text-destructive-foreground">{error.message || "Something went wrong."}</p>}
        <div ref={end} />
      </div>

      <form onSubmit={submit} className="flex gap-2 pb-5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Say something to ${g.name}…`}
          className="flex-1 rounded-full border-2 border-border bg-card px-5 py-3 outline-none focus:border-ring"
        />
        {busy ? (
          <button type="button" onClick={stop} className="rounded-full bg-secondary px-5 font-bold">Stop</button>
        ) : (
          <button type="submit" className="rounded-full bg-primary px-6 font-bold text-primary-foreground shadow-goblin">Send</button>
        )}
      </form>
    </main>
  );
}
