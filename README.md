# Ludo Meets Snake
Classic Ludo with snakes on the track and dice you can verify. Land on a 🐍 and slide back 7-8 steps. Every game commits to a secret seed (SHA-256) before the first roll; every roll is derived from it, and the seed is revealed at the end so anyone can recompute all rolls. No rigged dice, no rubber banding.

- `src/fair.ts` commit-reveal dice (pure TS sha256), `src/engine.ts` rules and bot
- `npm test` runs engine and fairness tests
- Pricing: 7-day trial, then $2.99/month or $19.99/year via RevenueCat
