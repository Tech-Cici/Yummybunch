import { Tabs } from 'expo-router';
import { Text, View } from 'react-native';
import { useCart } from '../../lib/store';
import { useColors } from '../../lib/theme';

/** Emoji glyphs keep the app dependency-free; no icon font to configure. */
function TabIcon({ glyph, color }: { glyph: string; color: string }) {
  return <Text style={{ fontSize: 20, color }}>{glyph}</Text>;
}

function CartBadgeIcon({ glyph, color }: { glyph: string; color: string }) {
  const cart = useCart();
  const c = useColors();
  return (
    <View>
      <TabIcon glyph={glyph} color={color} />
      {cart.count > 0 && (
        <View
          style={{
            position: 'absolute', right: -10, top: -4, minWidth: 18, height: 18,
            paddingHorizontal: 4, borderRadius: 9, backgroundColor: c.primary,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: c.primaryText, fontSize: 10, fontWeight: '700' }}>
            {cart.count}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const c = useColors();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: c.background },
        headerTitleStyle: { color: c.text, fontWeight: '700' },
        headerShadowVisible: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.border },
        sceneStyle: { backgroundColor: c.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Restaurants',
          tabBarIcon: ({ color }) => <TabIcon glyph="🍽" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color }) => <CartBadgeIcon glyph="🛍" color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'My orders',
          tabBarIcon: ({ color }) => <TabIcon glyph="🧾" color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <TabIcon glyph="👤" color={color} />,
        }}
      />
    </Tabs>
  );
}
