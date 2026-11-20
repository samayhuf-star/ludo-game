import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Game as G, Color, newGame, applyRoll, legalMoves, move, botPick, isOver, SAFE, SNAKES, START } from './engine';
import { newSeed, commit, rollFor, verify } from './fair';
import { PATH, HOME_CELLS, YARD_ORIGIN, gridPos } from './board';
import { C, NAMES } from './theme';

export default function GameScreen({ players, human, onExit }: { players: Color[]; human: Color; onExit: () => void }) {
  const { width } = useWindowDimensions(); const size = Math.min(width - 24, 520); const cell = size / 15;
  const [seed] = useState(() => newSeed()); const commitment = useMemo(() => commit(seed), [seed]);
  const [g, setG] = useState<G>(() => newGame(players)); const [nonce, setNonce] = useState(0); const rolls = useRef<number[]>([]);
  const [rolling, setRolling] = useState(false); const [msg, setMsg] = useState(''); const [shown, setShown] = useState(false);
  const cur = g.players[g.turn]; const mine = cur === human && !isOver(g); const over = isOver(g);

  const doRoll = () => { const r = rollFor(seed, nonce); rolls.current.push(r); setNonce((n) => n + 1); setRolling(true);
    setTimeout(() => { setRolling(false); const ng = applyRoll(g, r); setG(ng); setMsg(`${NAMES[cur]} rolled ${r}`); if (!legalMoves(ng, r).length) setTimeout(() => setG(move(ng, -1).game), 700); }, 350); };
  const play = (i: number) => { const r = move(g, i); if (r.captured.length) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}); else Haptics.selectionAsync().catch(() => {}); setG(r.game); if (r.slid) setMsg(`🐍 Snake! ${NAMES[cur]} slid back ${r.slid.from - r.slid.to}`); else if (r.captured.length) setMsg(`${NAMES[cur]} captured a token`); };
  useEffect(() => { if (over || rolling) return; if (cur === human) return;
    const t = setTimeout(() => { if (g.roll === null) doRoll(); else { const i = botPick(g); const r = move(g, i); setG(r.game); if (r.slid) setMsg(`🐍 Snake! ${NAMES[cur]} slid back ${r.slid.from - r.slid.to}`); else if (r.captured.length) setMsg(`${NAMES[cur]} captured a token`); } }, g.roll === null ? 650 : 750); return () => clearTimeout(t); }, [g, rolling, over]);

  const moves = g.roll !== null && mine ? legalMoves(g, g.roll) : [];
  const tokens: { c: Color; i: number; p: number }[] = []; g.players.forEach((c) => g.tokens[c].forEach((p, i) => tokens.push({ c, i, p })));
  const D = cell * 0.74;
  return (<View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', paddingTop: 56 }}>
    <View style={{ width: size, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
      <Pressable onPress={onExit}><Text style={{ color: C.dim, fontWeight: '800' }}>‹ Quit</Text></Pressable>
      <Text style={{ color: C.text, fontWeight: '900' }}>{over ? 'Game over' : `${NAMES[cur]}${cur === human ? ' (you)' : ''}`}</Text>
      <View style={{ width: 44 }} /></View>
    <Text style={s.fair}>🔒 Fair-dice commitment: {commitment.slice(0, 16)}…</Text>
    <View style={{ width: size, height: size, backgroundColor: '#F4F1E8', borderRadius: 14, overflow: 'hidden' }}>
      {[0, 1, 2, 3].map((c) => <View key={c} style={{ position: 'absolute', left: YARD_ORIGIN[c][1] * cell - cell, top: YARD_ORIGIN[c][0] * cell - cell, width: cell * 6, height: cell * 6, backgroundColor: C.players[c] }}><View style={{ margin: cell * 0.6, flex: 1, backgroundColor: '#fff', borderRadius: cell }} /></View>)}
      {PATH.map(([r, c], idx) => { const own = START.indexOf(idx); return <View key={idx} style={{ position: 'absolute', left: c * cell, top: r * cell, width: cell, height: cell, borderWidth: 0.5, borderColor: '#bbb', backgroundColor: own >= 0 ? C.players[own] : '#fff', alignItems: 'center', justifyContent: 'center' }}>{SNAKES[idx] ? <Text style={{ fontSize: cell * 0.62 }}>🐍</Text> : SAFE.has(idx) && own < 0 ? <Text style={{ fontSize: cell * 0.55, color: '#888' }}>★</Text> : null}</View>; })}
      {HOME_CELLS.map((col, c) => col.map(([r, cc], k) => <View key={`${c}${k}`} style={{ position: 'absolute', left: cc * cell, top: r * cell, width: cell, height: cell, borderWidth: 0.5, borderColor: '#bbb', backgroundColor: C.light[c] }} />))}
      <View style={{ position: 'absolute', left: 6 * cell, top: 6 * cell, width: cell * 3, height: cell * 3, backgroundColor: '#fff' }}><Text style={{ textAlign: 'center', marginTop: cell * 0.9, fontSize: cell }}>🏁</Text></View>
      {tokens.map(({ c, i, p }) => { const [r, cc] = gridPos(c, i, p); const can = c === human && moves.includes(i);
        return <Pressable key={`${c}-${i}`} disabled={!can} onPress={() => play(i)} style={{ position: 'absolute', left: cc * cell + (cell - D) / 2, top: r * cell + (cell - D) / 2, width: D, height: D, borderRadius: D / 2, backgroundColor: C.players[c], borderWidth: can ? 3 : 2, borderColor: can ? '#111' : '#fff', alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontWeight: '900', fontSize: D * 0.4 }}>{i + 1}</Text></Pressable>; })}
    </View>
    <Text style={{ color: C.dim, marginTop: 12, height: 20 }}>{msg}</Text>
    {!over ? <Pressable disabled={!mine || g.roll !== null || rolling} onPress={doRoll} style={[s.dice, (!mine || g.roll !== null || rolling) && { opacity: 0.5 }]}>
      <Text style={{ fontSize: 44, color: C.text, fontWeight: '900' }}>{rolling ? '🎲' : g.roll ?? (mine ? 'Roll' : '…')}</Text></Pressable>
      : <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
        <Text style={{ color: C.text, fontWeight: '900', fontSize: 20 }}>{g.winners[0] === human ? 'You win! 🏆' : `${NAMES[g.winners[0]]} wins`}</Text>
        <Pressable onPress={() => setShown((v) => !v)} style={s.btn}><Text style={s.bt}>{shown ? 'Hide proof' : 'Verify every roll'}</Text></Pressable>
        {shown && <Text style={s.proof}>{verify(seed, commitment, rolls.current) ? '✅ All ' + rolls.current.length + ' rolls match the commitment.' : '❌ Mismatch'}{'\n'}Seed: {seed}{'\n'}Commitment: {commitment}</Text>}
        <Pressable onPress={onExit} style={[s.btn, { backgroundColor: C.card2 }]}><Text style={[s.bt, { color: C.text }]}>Play again</Text></Pressable></View>}
  </View>);
}
const s = StyleSheet.create({ fair: { color: C.dim, fontSize: 11, marginBottom: 8 }, dice: { marginTop: 10, width: 120, height: 84, borderRadius: 20, backgroundColor: C.card2, alignItems: 'center', justifyContent: 'center' },
  btn: { backgroundColor: C.accent, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 22, marginTop: 12 }, bt: { color: '#1a1200', fontWeight: '900' }, proof: { color: C.dim, fontSize: 11, marginTop: 10, textAlign: 'center' } });
