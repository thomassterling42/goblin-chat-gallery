import raw from "./goblins.json";

export type Goblin = {
  number: number;
  name: string;
  gang: string;
  room: string;
  theme: string;
  founder: boolean;
  monologue: string;
};

const cap = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

export const goblins: Goblin[] = (
  raw as { Number: number; Name: string; Gang: string; Room: string; Theme: string; Founder: string | null; Monologue: string }[]
).map((g) => ({
  number: g.Number,
  name: String(g.Name).trim(),
  gang: cap(String(g.Gang).trim().toLowerCase()),
  room: cap(String(g.Room).trim().toLowerCase()),
  theme: String(g.Theme).trim(),
  founder: !!g.Founder,
  monologue: String(g.Monologue).trim(),
}));

export const gangs = Array.from(new Set(goblins.map((g) => g.gang)));

export const gangHue = (gang: string) => Math.round((gangs.indexOf(gang) * 360) / gangs.length);

export const getGoblin = (n: number) => goblins.find((g) => g.number === n);
