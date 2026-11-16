import test from 'node:test'; import assert from 'node:assert/strict';
import { PATH, HOME_CELLS } from '../src/board'; import { START } from '../src/engine';
test('track is a closed loop of 52 distinct adjacent cells', () => {
  assert.equal(new Set(PATH.map((p) => p.join())).size, 52);
  PATH.forEach(([r, c], i) => { const [r2, c2] = PATH[(i + 1) % 52]; assert.equal(Math.max(Math.abs(r - r2), Math.abs(c - c2)), 1, `gap after ${i}`); });
});
test('home columns connect to the track and do not overlap it', () => {
  const track = new Set(PATH.map((p) => p.join()));
  HOME_CELLS.forEach((col, c) => { col.forEach((p) => assert.ok(!track.has(p.join()))); const last = PATH[(START[c] + 50) % 52]; const first = col[0]; assert.equal(Math.abs(last[0] - first[0]) + Math.abs(last[1] - first[1]), 1, `colour ${c} entry`); });
});
