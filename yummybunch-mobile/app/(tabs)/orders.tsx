import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ACTIVE_STATUSES, api, ApiError, Order, STATUS_LABEL } from '../../lib/api';
import { useAuth } from '../../lib/store';
import { money, spacing, useColors } from '../../lib/theme';
import {
  Badge, Body, Button, Card, EmptyState, ErrorNote, Heading, Loading, Row, Screen,
} from '../../components/ui';

export default function OrdersScreen() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const c = useColors();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!user) { setLoading(false); return; }
    if (!quiet) setLoading(true);
    try {
      setOrders(await api.myOrders());
      setError(null);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  // Refetch whenever the tab regains focus, so a just-placed order shows up.
  useFocusEffect(useCallback(() => { load(true); }, [load]));

  useEffect(() => { load(); }, [load]);

  // Poll while anything is still in progress, so the kitchen's updates arrive
  // without the customer pulling to refresh.
  useEffect(() => {
    if (!orders.some(o => ACTIVE_STATUSES.includes(o.status))) return;
    const t = setInterval(() => load(true), 12_000);
    return () => clearInterval(t);
  }, [orders, load]);

  if (authLoading) return <Screen><Loading /></Screen>;

  if (!user) {
    return (
      <Screen>
        <Card>
          <Heading>Sign in to see your orders</Heading>
          <Body tone="muted">
            Your order history and live status live with your account.
          </Body>
          <Button label="Sign in" onPress={() => router.push('/auth/login')} />
          <Button label="Create an account" variant="outline" onPress={() => router.push('/auth/signup')} />
        </Card>
      </Screen>
    );
  }

  if (loading) return <Screen><Loading label="Loading your orders…" /></Screen>;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.background }}
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(true); }}
          tintColor={c.primary}
        />
      }
    >
      {error ? <ErrorNote message={error} onRetry={() => load()} /> : null}

      {orders.length === 0 && !error ? (
        <EmptyState
          title="No orders yet"
          body="When you order, it appears here with live status."
          action={{ label: 'Browse restaurants', onPress: () => router.replace('/') }}
        />
      ) : (
        orders.map(order => {
          const active = ACTIVE_STATUSES.includes(order.status);
          return (
            <Card key={order.id} onPress={() => router.push(`/order/${order.id}`)}>
              <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Heading>{order.restaurantName}</Heading>
                  <Body tone="muted" size={12}>
                    #{order.id} · {new Date(order.placedAt).toLocaleString()}
                  </Body>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Body weight="700">{money(order.total)}</Body>
                  <Badge
                    label={STATUS_LABEL[order.status]}
                    tone={
                      order.status === 'REJECTED' ? 'danger'
                        : order.status === 'CANCELLED' ? 'neutral'
                        : order.status === 'COMPLETED' ? 'success'
                        : 'primary'
                    }
                  />
                </View>
              </Row>

              <Body tone="muted" size={13}>
                {order.items.map(i => `${i.quantity}× ${i.itemName}`).join(', ')}
              </Body>

              {active ? (
                <Body tone="primary" size={12} weight="600">Tap to follow this order →</Body>
              ) : null}
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}
