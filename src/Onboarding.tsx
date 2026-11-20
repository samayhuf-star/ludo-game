import React, { useRef, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from './theme';
const PAGES = [
  { e: '🎲', t: 'Dice you can verify', b: 'Every game locks in a secret seed before the first roll. At the end you can check every single roll yourself. No rigging. Ever.', c: ['#3A1A1C', '#0E1420'] },
  { e: '🤝', t: 'Fair play, no tricks', b: 'No rubber banding, no luck you can buy, no ads between turns. Just classic Ludo, played honestly.', c: ['#10301F', '#0E1420'] },
  { e: '🐍', t: 'Watch out for snakes', b: 'Six snakes lurk on the track. Land on a head and you slide back 7 or 8 steps. Plan your moves, and use them to your advantage.', c: ['#10301F', '#0E1420'] },
  { e: '🏆', t: 'Beat the bots', b: 'Play 2 to 4 players against smart bots. Race four tokens home and capture to send rivals back.', c: ['#33280A', '#0E1420'] },
] as const;
const GET = [['🔒', 'Fairness proof for every game'], ['🤖', 'Unlimited games vs all bot levels'], ['🚫', 'No ads, ever'], ['🎨', 'All boards and dice themes']];
export default function Onboarding({ onDone }: { onDone: (paywall: boolean) => void }) {
  const { width } = useWindowDimensions(); const [i, setI] = useState(0); const ref = useRef<FlatList>(null); const last = PAGES.length;
  const data: (typeof PAGES[number] | null)[] = [...PAGES, null];
  return (<View style={{ flex: 1, backgroundColor: C.bg }}>
    <FlatList ref={ref} data={data} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={(_, k) => String(k)}
      onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
      renderItem={({ item }) => (<LinearGradient colors={(item ? item.c : ['#33280A', '#0E1420']) as unknown as [string, string]} style={{ width, flex: 1, paddingHorizontal: 28, paddingTop: 130 }}>
        {item ? (<><Text style={{ fontSize: 96, marginBottom: 28 }}>{item.e}</Text><Text style={s.h}>{item.t}</Text><Text style={s.b}>{item.b}</Text></>)
          : (<><Text style={s.h}>What you get</Text><Text style={[s.b, { marginBottom: 20 }]}>Try everything free for 7 days. Cancel any time.</Text>
            {GET.map(([e, t]) => <View key={t} style={s.row}><Text style={{ fontSize: 26, marginRight: 14 }}>{e}</Text><Text style={s.rt}>{t}</Text></View>)}</>)}
      </LinearGradient>)} />
    <View style={s.foot}>
      <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 18 }}>{data.map((_, k) => <View key={k} style={[s.dot, k === i && { backgroundColor: C.accent, width: 22 }]} />)}</View>
      <Pressable onPress={() => (i < last ? ref.current?.scrollToIndex({ index: i + 1 }) : onDone(true))} style={s.btn}><Text style={s.bt}>{i < last ? 'Continue' : 'Start 7-day free trial'}</Text></Pressable>
      <Pressable onPress={() => (i === last ? onDone(false) : ref.current?.scrollToIndex({ index: last }))} style={{ padding: 14 }}><Text style={{ color: C.dim, textAlign: 'center', fontWeight: '700' }}>{i === last ? 'Maybe later, play the free version' : 'Skip'}</Text></Pressable>
    </View></View>);
}
const s = StyleSheet.create({ h: { color: C.text, fontSize: 34, fontWeight: '900', marginBottom: 14 }, b: { color: C.dim, fontSize: 17, lineHeight: 25 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 16, marginBottom: 10 }, rt: { color: C.text, fontSize: 16, fontWeight: '700', flex: 1 },
  foot: { position: 'absolute', bottom: 34, left: 24, right: 24 }, dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.line, marginHorizontal: 4 },
  btn: { backgroundColor: C.accent, borderRadius: 18, paddingVertical: 18, alignItems: 'center' }, bt: { color: '#1a1200', fontSize: 18, fontWeight: '900' } });
