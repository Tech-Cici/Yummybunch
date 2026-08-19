import { useEffect } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProviders, useAuth } from '../lib/store';
import { useColors, useIsDark } from '../lib/theme';
import { Loading } from '../components/ui';

/**
 * Decides what the app opens on: the welcome screen for anyone who has neither
 * signed in nor chosen to browse as a guest, the tabs for everyone else.
 */
function useAuthGate() {
  const { user, loading, guestMode } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const first = segments[0] as string | undefined;
    // Screens reachable before a decision has been made.
    const inEntryFlow = first === 'welcome' || first === 'auth' || first === undefined;
    const decided = Boolean(user) || guestMode;

    if (!decided && !inEntryFlow) {
      router.replace('/welcome');
    } else if (!decided && first === undefined) {
      router.replace('/welcome');
    } else if (user && (first === 'welcome' || first === 'auth')) {
      // Signed in but still sitting on an entry screen — move them along.
      router.replace('/(tabs)');
    }
  }, [user, loading, guestMode, segments, router]);

  return loading;
}

function Navigator() {
  const c = useColors();
  const dark = useIsDark();
  const loading = useAuthGate();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, justifyContent: 'center' }}>
        <StatusBar style={dark ? 'light' : 'dark'} />
        <Loading />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.primary,
          headerTitleStyle: { color: c.text, fontWeight: '600' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: c.background },
          // Native back gesture and a real back button on every pushed screen.
          headerBackTitle: 'Back',
        }}
      >
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="restaurant/[id]" options={{ title: '' }} />
        <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
        <Stack.Screen name="order/[id]" options={{ title: 'Order' }} />
        <Stack.Screen name="auth/login" options={{ title: 'Sign in' }} />
        <Stack.Screen name="auth/signup" options={{ title: 'Create account' }} />
        <Stack.Screen name="auth/verify" options={{ title: 'Confirm email' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppProviders>
          <Navigator />
        </AppProviders>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
