// Pure Ludo rules. Progress p per token: -1 yard, 0..50 shared track, 51..55 home column, 56 finished.
export type Color = 0 | 1 | 2 | 3;
export const TRACK = 52, START = [0, 13, 26, 39], FINISH = 56;
export const SAFE = new Set<number>([0, 8, 13, 21, 26, 34, 39, 47]); // starts + stars
export type Game = { players: Color[]; tokens: Record<number, number[]>; turn: number; sixes: number; roll: number | null; winners: Color[]; };
export const newGame = (players: Color[] = [0, 1, 2, 3]): Game => ({ players, tokens: Object.fromEntries(players.map((c) => [c, [-1, -1, -1, -1]])), turn: 0, sixes: 0, roll: null, winners: [] });
export const cellOf = (c: Color, p: number): number | null => (p >= 0 && p <= 50 ? (START[c] + p) % TRACK : null);
export function legalMoves(g: Game, roll: number): number[] {
  const c = g.players[g.turn], t = g.tokens[c]; const out: number[] = [];
  t.forEach((p, i) => { if (p === FINISH) return; if (p === -1) { if (roll === 6) out.push(i); } else if (p + roll <= FINISH) out.push(i); });
  return out;
}
const nextTurn = (g: Game): Game => { let turn = g.turn; for (let i = 0; i < g.players.length; i++) { turn = (turn + 1) % g.players.length; if (!g.winners.includes(g.players[turn])) break; } return { ...g, turn, sixes: 0, roll: null }; };
export type Result = { game: Game; captured: { color: Color; token: number }[]; extra: boolean };
export function applyRoll(g: Game, roll: number): Game { return { ...g, roll }; }
/** Move token `i` using g.roll. If no legal move exists pass `i = -1` to end the turn. */
export function move(g: Game, i: number): Result {
  const roll = g.roll!; const c = g.players[g.turn];
  if (i < 0) return { game: roll === 6 && g.sixes < 2 ? { ...g, sixes: g.sixes + 1, roll: null } : nextTurn(g), captured: [], extra: false };
  if (!legalMoves(g, roll).includes(i)) throw new Error('illegal move');
  const tokens: Record<number, number[]> = Object.fromEntries(Object.entries(g.tokens).map(([k, v]) => [k, [...v]]));
  const from = tokens[c][i]; const to = from === -1 ? 0 : from + roll; tokens[c][i] = to;
  const captured: Result['captured'] = []; const cell = cellOf(c, to);
  if (cell !== null && !SAFE.has(cell)) for (const o of g.players) if (o !== c) tokens[o].forEach((p, j) => { if (cellOf(o as Color, p) === cell) { tokens[o][j] = -1; captured.push({ color: o as Color, token: j }); } });
  const winners = tokens[c].every((p) => p === FINISH) && !g.winners.includes(c) ? [...g.winners, c] : g.winners;
  const extra = roll === 6 || captured.length > 0 || to === FINISH;
  let ng: Game = { ...g, tokens, winners, roll: null };
  if (roll === 6 && g.sixes + 1 >= 3) return { game: nextTurn({ ...ng }), captured, extra: false }; // third six: still keep this move, then pass
  if (extra && !winners.includes(c)) ng = { ...ng, sixes: roll === 6 ? g.sixes + 1 : 0 }; else ng = nextTurn(ng);
  return { game: ng, captured, extra };
}
export const isOver = (g: Game) => g.winners.length >= g.players.length - 1;
/** Simple bot: finish > capture > leave yard > furthest token. */
export function botPick(g: Game): number {
  const roll = g.roll!, c = g.players[g.turn]; const m = legalMoves(g, roll); if (!m.length) return -1;
  const score = (i: number) => { const p = g.tokens[c][i], to = p === -1 ? 0 : p + roll; let s = p; if (to === FINISH) s += 1000; const cell = cellOf(c, to);
    if (cell !== null && !SAFE.has(cell) && g.players.some((o) => o !== c && g.tokens[o].some((q) => cellOf(o as Color, q) === cell))) s += 500; if (p === -1) s += 200; return s; };
  return m.sort((a, b) => score(b) - score(a))[0];
}
