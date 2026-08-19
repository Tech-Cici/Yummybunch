# Yummybunch mobile

Expo **SDK 54** (pinned deliberately: the Expo Go build on the Play Store / App Store
supports one SDK at a time, and 54 is what is published). Do not upgrade the SDK
without checking which version Expo Go currently ships.

Read the versioned docs for this SDK before writing code:
https://docs.expo.dev/versions/v54.0.0/

## Shape of the project

- `app/` — expo-router file routes. `(tabs)/` is the signed-in shell; `auth/` is the
  sign-up → verify → sign-in flow.
- `lib/api.ts` — the only place that talks to the Spring backend. Endpoint contracts
  match the web app exactly.
- `lib/store.tsx` — auth session (SecureStore) and cart (AsyncStorage).
- `lib/theme.ts` — light/dark palettes mirroring the web brand.
- `components/ui.tsx` — the small UI kit every screen builds on.

## Things that will bite you

- The backend is **not** on `localhost` from a phone's point of view. `resolveApiUrl()`
  derives the host from the Metro connection; `EXPO_PUBLIC_API_URL` overrides it.
- This app is customer-only. Restaurant owners manage orders on the web dashboard.
- Order status transitions are enforced server-side; never assume a status is settable.
