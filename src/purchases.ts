import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
export const ENTITLEMENT = 'pro';
let ready = false;
export function initPurchases(onChange: (pro: boolean) => void) {
  const key = Platform.OS === 'ios' ? process.env.EXPO_PUBLIC_RC_IOS_KEY : (process.env.EXPO_PUBLIC_RC_ANDROID_KEY ?? 'goog_ahatPgsEzxdLLyeKzuQsYzsfhiS');
  if (!key) { onChange(false); return; }
  Purchases.configure({ apiKey: key }); ready = true;
  const f = (i: { entitlements: { active: Record<string, unknown> } }) => onChange(!!i.entitlements.active[ENTITLEMENT]);
  Purchases.addCustomerInfoUpdateListener(f); Purchases.getCustomerInfo().then(f).catch(() => {});
}
export async function showPaywall(): Promise<boolean> {
  if (!ready) return false;
  const r = await RevenueCatUI.presentPaywallIfNeeded({ requiredEntitlementIdentifier: ENTITLEMENT });
  return r === PAYWALL_RESULT.PURCHASED || r === PAYWALL_RESULT.RESTORED || r === PAYWALL_RESULT.NOT_PRESENTED;
}
export const restore = async () => { if (ready) await Purchases.restorePurchases(); };
