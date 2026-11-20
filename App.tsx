import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, Linking } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Onboarding from './src/Onboarding'; import GameScreen from './src/Game';
import { initPurchases, showPaywall, restore } from './src/purchases'; import { Color } from './src/engine'; import { C } from './src/theme';

const PRIVACY_URL = 'https://samayhuf-star.github.io/app-legal/ludo-game/privacy.html';
const TERMS_URL = 'https://samayhuf-star.github.io/app-legal/ludo-game/terms.html';

export default function App() {
  const [seen, setSeen] = useState<boolean | null>(null); const [pro, setPro] = useState(false); const [play, setPlay] = useState<Color[] | null>(null);
  useEffect(() => { AsyncStorage.getItem('onboarded.v1').then((v) => setSeen(v === '1')).catch(() => setSeen(true)); initPurchases(setPro); }, []);
  if (seen === null) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  if (!seen) return <Onboarding onDone={async (pw) => { await AsyncStorage.setItem('onboarded.v1', '1'); setSeen(true); if (pw) showPaywall(); }} />;
  if (play) return <><StatusBar style="light" /><GameScreen players={play} human={0} onExit={() => setPlay(null)} /></>;
  return (<View style={{ flex: 1, backgroundColor: C.bg, padding: 24, justifyContent: 'center' }}><StatusBar style="light" />
    <Text style={{ fontSize: 46, textAlign: 'center' }}>🎲</Text><Text style={{ color: C.text, fontSize: 36, fontWeight: '900', textAlign: 'center' }}>Ludo Meets Snake</Text>
    <Text style={{ color: C.accent, textAlign: 'center', fontWeight: '700', marginBottom: 32 }}>{pro ? 'Pro unlocked' : 'Dice you can verify. Beware the snakes.'}</Text>
    {([['Play vs 1 bot', [0, 2]], ['Play vs 3 bots', [0, 1, 2, 3]]] as [string, Color[]][]).map(([t, p]) => <Pressable key={t} onPress={() => setPlay(p)} style={{ backgroundColor: C.accent, borderRadius: 18, paddingVertical: 18, marginBottom: 12 }}><Text style={{ color: '#1a1200', fontWeight: '900', fontSize: 18, textAlign: 'center' }}>{t}</Text></Pressable>)}
    <Pressable onPress={() => (pro ? restore() : showPaywall())} style={{ padding: 14 }}><Text style={{ color: C.dim, textAlign: 'center', fontWeight: '700' }}>{pro ? 'Restore purchases' : 'Go Pro · 7-day free trial'}</Text></Pressable>
    <Pressable onPress={restore} style={{ padding: 6 }}><Text style={{ color: C.dim, textAlign: 'center', fontSize: 12 }}>Restore purchases</Text></Pressable>
    <Text style={{ color: C.dim, fontSize: 12, textAlign: 'center', lineHeight: 17, marginTop: 10 }}>Pro starts with a 7-day free trial, then renews automatically at the price shown on the Pro screen until you cancel. Cancel any time in your Apple ID subscription settings, at least 24 hours before the period ends.</Text>
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 8 }}>
      <Pressable onPress={() => Linking.openURL(TERMS_URL)} hitSlop={8}><Text style={{ color: C.accent, fontSize: 12, fontWeight: '700' }}>Terms of Use</Text></Pressable>
      <Text style={{ color: C.dim, fontSize: 12 }}>  ·  </Text>
      <Pressable onPress={() => Linking.openURL(PRIVACY_URL)} hitSlop={8}><Text style={{ color: C.accent, fontSize: 12, fontWeight: '700' }}>Privacy Policy</Text></Pressable></View></View>);
}
