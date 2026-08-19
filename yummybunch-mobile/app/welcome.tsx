import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../lib/store';
import { radius, spacing, useColors } from '../lib/theme';
import { Body, Button, Row } from '../components/ui';

/**
 * First thing a new visitor sees. Sign in / create account are the primary
 * actions; browsing without an account stays possible but is secondary.
 */
export default function WelcomeScreen() {
  const c = useColors();
  const router = useRouter();
  const { continueAsGuest } = useAuth();

  const browse = async () => {
    await continueAsGuest();
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ flex: 1, padding: spacing.xl, justifyContent: 'space-between' }}>
        {/* brand */}
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg }}>
          <View
            style={{
              width: 96, height: 96, borderRadius: radius.lg + 8,
              backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Body size={48}>🍽</Body>
          </View>

          <View style={{ gap: spacing.sm, alignItems: 'center' }}>
            <Body size={34} weight="700" style={{ textAlign: 'center' }}>
              Yummybunch
            </Body>
            <Body tone="muted" size={16} style={{ textAlign: 'center', maxWidth: 300, lineHeight: 23 }}>
              Order from restaurants near you and follow your food from the kitchen to your door.
            </Body>
          </View>

          <View style={{ gap: spacing.md, marginTop: spacing.lg, width: '100%', maxWidth: 320 }}>
            {[
              ['🔎', 'Browse menus and prices'],
              ['🛍', 'Order in a couple of taps'],
              ['⏱', 'Live status as it is cooked'],
            ].map(([glyph, label]) => (
              <Row key={label} gap={spacing.md}>
                <View
                  style={{
                    width: 34, height: 34, borderRadius: radius.md,
                    backgroundColor: c.accent, alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Body size={16}>{glyph}</Body>
                </View>
                <Body size={15} style={{ flex: 1 }}>{label}</Body>
              </Row>
            ))}
          </View>
        </View>

        {/* actions */}
        <View style={{ gap: spacing.md }}>
          <Button label="Sign in" onPress={() => router.push('/auth/login')} />
          <Button
            label="Create an account"
            variant="outline"
            onPress={() => router.push('/auth/signup')}
          />
          <Button label="Just browsing for now" variant="ghost" onPress={browse} />
        </View>
      </View>
    </SafeAreaView>
  );
}
