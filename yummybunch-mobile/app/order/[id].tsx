import { useCallback, useEffect, useState } from 'react';
import { Alert, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ACTIVE_STATUSES, api, ApiError, Order, STATUS_LABEL } from '../../lib/api';
import { money, spacing, useColors } from '../../lib/theme';
import {
  Badge, Body, Button, Card, ErrorNote, Heading, Loading, Row, Screen, Title,
} from '../../components/ui';
import { OrderProgress } from '../../components/order-progress';

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const c = useColors();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      setOrder(await api.order(id));
      setError(null);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Live updates while the kitchen still has work to do.
  useEffect(() => {
    if (!order || !ACTIVE_STATUSES.includes(order.status)) return;
    const t = setInterval(() => load(true), 10_000);
    return () => clearInterval(t);
  }, [order, load]);

  const cancel = () => {
    Alert.alert(
      'Cancel this order?',
      'This cannot be undone, and is only possible before the restaurant accepts it.',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel order',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              setOrder(await api.cancelOrder(Number(id)));
            } catch (e) {
              Alert.alert('Could not cancel', (e as ApiError).message);
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <Screen><Loading label="Loading order…" /></Screen>;

  if (error || !order) {
    return (
      <Screen>
        <ErrorNote message={error ?? 'Order not found.'} onRetry={() => load()} />
        <Button label="My orders" variant="outline" onPress={() => router.replace('/orders')} />
      </Screen>
    );
  }

  return (
    <Screen scroll onRefresh={() => load(true)}>
      <View style={{ gap: 4 }}>
        <Title>{order.restaurantName}</Title>
        <Body tone="muted" size={13}>
          Order #{order.id} · {new Date(order.placedAt).toLocaleString()}
        </Body>
        <Row>
          <Badge
            label={STATUS_LABEL[order.status]}
            tone={
              order.status === 'REJECTED' ? 'danger'
                : order.status === 'CANCELLED' ? 'neutral'
                : order.status === 'COMPLETED' ? 'success'
                : 'primary'
            }
          />
        </Row>
      </View>

      <Card>
        <Heading>Progress</Heading>
        <View style={{ marginTop: spacing.sm }}>
          <OrderProgress order={order} />
        </View>
      </Card>

      <Card>
        <Heading>Items</Heading>
        {order.items.map((it, i) => (
          <Row key={i} style={{ justifyContent: 'space-between' }}>
            <Body style={{ flex: 1 }}>
              <Body weight="700">{it.quantity}× </Body>{it.itemName}
            </Body>
            <Body>{money(it.lineTotal)}</Body>
          </Row>
        ))}
        <View style={{ height: 1, backgroundColor: c.border, marginVertical: spacing.sm }} />
        <Row style={{ justifyContent: 'space-between' }}>
          <Heading>Total</Heading>
          <Heading>{money(order.total)}</Heading>
        </Row>
      </Card>

      <Card>
        <Heading>Delivery</Heading>
        <Body tone="muted">{order.deliveryAddress}</Body>
        {order.notes ? <Body tone="muted" size={13}>Your note: {order.notes}</Body> : null}
        {order.restaurantPhone ? (
          <Body tone="muted" size={13}>Restaurant: {order.restaurantPhone}</Body>
        ) : null}
      </Card>

      {order.status === 'PLACED' ? (
        <Button
          label="Cancel order"
          variant="danger"
          loading={cancelling}
          disabled={cancelling}
          onPress={cancel}
        />
      ) : null}

      <Button
        label="Order from here again"
        variant="outline"
        onPress={() => router.push(`/restaurant/${order.restaurantId}`)}
      />
    </Screen>
  );
}
