import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, ApiError, imageUrl, MenuItem, Restaurant } from '../../lib/api';
import { money, radius, spacing, useColors } from '../../lib/theme';
import { useAuth, useCart } from '../../lib/store';
import {
  Badge, Body, Button, Card, EmptyState, ErrorNote, Heading, Loading, Row, Screen, Title,
} from '../../components/ui';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useColors();
  const router = useRouter();
  const cart = useCart();
  const { user } = useAuth();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, m] = await Promise.all([api.restaurant(id), api.publicMenu(id)]);
      setRestaurant(r);
      setMenu(m);
      setError(null);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  /** Group into menu sections, preserving the backend's category ordering. */
  const sections = useMemo(() => {
    const groups = new Map<string, MenuItem[]>();
    for (const item of menu) {
      const key = item.category?.trim() || 'Menu';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return [...groups.entries()];
  }, [menu]);

  const isOwner = user?.role === 'RESTAURANT';

  const add = (item: MenuItem) => {
    if (!restaurant) return;
    const ok = cart.add(restaurant.id, restaurant.name, item);
    if (!ok) {
      Alert.alert(
        'Cart has another restaurant',
        'Your cart holds items from a different restaurant. Empty it first, or check that order out before starting a new one.',
        [
          { text: 'Keep it', style: 'cancel' },
          { text: 'Empty cart', style: 'destructive', onPress: () => { cart.clear(); cart.add(restaurant.id, restaurant.name, item); } },
        ]
      );
    }
  };

  if (loading) return <Screen><Loading label="Loading menu…" /></Screen>;

  if (error || !restaurant) {
    return (
      <Screen>
        <ErrorNote message={error ?? 'Restaurant not found.'} onRetry={load} />
        <Button label="Back to restaurants" variant="outline" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const cover = imageUrl(restaurant.coverImageUrl);
  const showBar = cart.count > 0 && cart.restaurantId === restaurant.id;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <Screen scroll contentStyle={{ paddingBottom: showBar ? 96 : spacing.lg }}>
        {/* header */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <View style={{ height: 168, backgroundColor: c.accent }}>
            {cover ? (
              <Image source={{ uri: cover }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Body size={44}>🍽</Body>
              </View>
            )}
          </View>

          <View style={{ padding: spacing.lg, gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Title>{restaurant.name}</Title>
                {restaurant.cuisine ? <Body tone="primary" weight="600">{restaurant.cuisine}</Body> : null}
              </View>
              <Badge
                label={restaurant.acceptingOrders ? 'Open' : 'Closed'}
                tone={restaurant.acceptingOrders ? 'success' : 'neutral'}
              />
            </Row>

            {restaurant.description ? <Body tone="muted">{restaurant.description}</Body> : null}
            {restaurant.address ? <Body tone="muted" size={13}>📍 {restaurant.address}</Body> : null}
            {restaurant.phone ? <Body tone="muted" size={13}>📞 {restaurant.phone}</Body> : null}
            {restaurant.openingTime && restaurant.closingTime ? (
              <Body tone="muted" size={13}>🕒 {restaurant.openingTime}–{restaurant.closingTime}</Body>
            ) : null}
          </View>
        </Card>

        {/* menu */}
        <Heading>Menu</Heading>

        {menu.length === 0 ? (
          <EmptyState title="No menu yet" body="This restaurant hasn't added any dishes." />
        ) : (
          sections.map(([section, items]) => (
            <View key={section} style={{ gap: spacing.sm }}>
              <Body tone="muted" size={12} weight="700" style={{ letterSpacing: 0.8 }}>
                {section.toUpperCase()}
              </Body>

              {items.map(item => {
                const pic = imageUrl(item.imageUrl);
                return (
                  <Card key={item.id}>
                    <Row style={{ alignItems: 'flex-start' }}>
                      <View
                        style={{
                          width: 68, height: 68, borderRadius: radius.md,
                          backgroundColor: c.accent, overflow: 'hidden',
                          alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {pic ? (
                          <Image source={{ uri: pic }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                        ) : (
                          <Body size={26}>🍴</Body>
                        )}
                      </View>

                      <View style={{ flex: 1, gap: 4 }}>
                        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Body weight="600" size={15} style={{ flex: 1 }}>{item.name}</Body>
                          <Body weight="700">{money(item.price)}</Body>
                        </Row>
                        {item.description ? (
                          <Body tone="muted" size={13} numberOfLines={2}>{item.description}</Body>
                        ) : null}

                        {isOwner ? (
                          <Body tone="muted" size={12}>Restaurant accounts cannot order</Body>
                        ) : !restaurant.acceptingOrders ? (
                          <Button label="Closed" variant="outline" small disabled style={{ alignSelf: 'flex-start' }} />
                        ) : (
                          <Button
                            label="Add"
                            small
                            onPress={() => add(item)}
                            style={{ alignSelf: 'flex-start', paddingHorizontal: spacing.lg }}
                          />
                        )}
                      </View>
                    </Row>
                  </Card>
                );
              })}
            </View>
          ))
        )}
      </Screen>

      {/* sticky cart bar */}
      {showBar && (
        <View
          style={{
            position: 'absolute', left: spacing.lg, right: spacing.lg, bottom: spacing.lg,
            backgroundColor: c.surface, borderColor: c.border, borderWidth: 1,
            borderRadius: radius.lg, padding: spacing.md,
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 }, elevation: 6,
          }}
        >
          <View>
            <Body weight="600">{cart.count} item{cart.count === 1 ? '' : 's'}</Body>
            <Body tone="muted" size={13}>{money(cart.subtotal)}</Body>
          </View>
          <Button label="View cart" onPress={() => router.push('/cart')} />
        </View>
      )}
    </View>
  );
}
