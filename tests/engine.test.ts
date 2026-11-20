import test from 'node:test'; import assert from 'node:assert/strict';
import { sha256, rollFor, commit, verify, newSeed } from '../src/fair';
import { newGame, applyRoll, legalMoves, move, botPick, isOver, FINISH, SNAKES, SAFE, START, cellOf } from '../src/engine';
test('sha256 vectors', () => { assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'); assert.equal(sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'); });
test('rolls are verifiable and fair', () => { const s = newSeed(); const rolls = Array.from({ length: 6000 }, (_, i) => rollFor(s, i)); assert.ok(verify(s, commit(s), rolls)); assert.ok(!verify(s, commit(s), [...rolls.slice(0, 5), rolls[5] === 1 ? 2 : 1])); for (let f = 1; f <= 6; f++) { const n = rolls.filter((r) => r === f).length; assert.ok(n > 850 && n < 1150, `face ${f}: ${n}`); } });
test('need a six to leave yard', () => { const g = newGame(); assert.deepEqual(legalMoves({ ...g, roll: 3 }, 3), []); assert.equal(legalMoves({ ...g, roll: 6 }, 6).length, 4); });
test('capture sends token home and grants extra turn', () => { let g = newGame([0, 1]); g.tokens[0][0] = 5; g.tokens[1] = [-1, -1, -1, -1]; g.tokens[1][0] = ((5 + 2) - 13 + 52) % 52; g = applyRoll(g, 2); const r = move(g, 0); assert.equal(r.captured.length, 1); assert.equal(r.game.tokens[1][0], -1); assert.equal(r.game.turn, 0); });
test('safe cells do not capture', () => { let g = newGame([0, 1]); g.tokens[0][0] = 6; g.tokens[1] = [(8 - 13 + 52) % 52, -1, -1, -1]; g = applyRoll(g, 2); const r = move(g, 0); assert.equal(r.captured.length, 0); });
test('cannot overshoot finish', () => { let g = newGame([0, 1]); g.tokens[0][0] = FINISH - 1; assert.deepEqual(legalMoves({ ...g, roll: 2 }, 2), []); });
test('bots finish a full game', () => { let g = newGame(); const seed = newSeed(); let n = 0; while (!isOver(g) && n < 20000) { g = applyRoll(g, rollFor(seed, n++)); g = move(g, botPick(g)).game; } assert.ok(isOver(g), 'game should end'); });

test('snake heads are never on safe cells', () => { for (const h of Object.keys(SNAKES)) assert.ok(!SAFE.has(Number(h)), `head ${h}`); });
test('landing on a snake slides back', () => { let g = newGame([0, 1]); g.tokens[0][0] = 8; g = applyRoll(g, 3); const r = move(g, 0); assert.equal(r.game.tokens[0][0], 11 - 7); assert.deepEqual(r.slid, { token: 0, from: 11, to: 4 }); });
test('snake never slides below start square', () => { let g = newGame([0, 1]); g.tokens[1][0] = 2; g = { ...g, turn: 1 }; g = applyRoll(g, 3); /* colour 1 start 13, p=5 -> cell 18 head(8) */ const r = move(g, 0); assert.equal(r.game.tokens[1][0], 0); });
test('snake slide can still capture on the tail cell', () => { let g = newGame([0, 1]); g.tokens[0][0] = 8; g.tokens[1][0] = (4 - 13 + 52) % 52; g = applyRoll(g, 3); const r = move(g, 0); assert.equal(r.captured.length, 1); });
test('home column and finish are snake-free', () => { let g = newGame([0, 1]); g.tokens[0][0] = 52; g = applyRoll(g, 4); assert.equal(move(g, 0).slid, null); });
