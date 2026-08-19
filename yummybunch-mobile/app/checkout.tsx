import { useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { api, ApiError } from '../lib/api';
import { useAuth, useCart } from '../lib/store';
import { money, spacing, useColors } from '../lib/theme';
import {
  Body, Button, Card, EmptyState, ErrorNote, Field, Heading, Row, Screen,
} from '../components/ui';

export default function CheckoutScreen() {
  const cart = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const c = useColors();

  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.lines.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Nothing to check out"
          body="Your cart is empty."
          action={{ label: 'Browse restaurants', onPress: () => router.replace('/') }}
        />
      </Screen>
    );
  }

  // Ordering needs an account; send them to sign in rather than failing at submit.
  if (!user) {
    return (
      <Screen>
        <Card>
          <Heading>Sign in to order</Heading>
          <Body tone="muted">
            You can browse freely, but placing an order needs an account so the restaurant knows
            who it is cooking for.
          </Body>
          <Button label="Sign in" onPress={() => router.push('/auth/login')} />
          <Button label="Create an account" variant="outline" onPress={() => router.push('/auth/signup')} />
        </Card>
      </Screen>
    );
  }

  const submit = async () => {
    setError(null);
    if (!address.trim()) {
      setError('Please enter where the order should be delivered.');
      return;
    }
    if (!cart.restaurantId) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await api.placeOrder({
        restaurantId: cart.restaurantId,
        deliveryAddress: address.trim(),
        notes: notes.trim() || undefined,
        items: cart.lines.map(l => ({ menuItemId: l.item.id, quantity: l.quantity })),
      });
      cart.clear();
      router.replace(`/order/${order.id}`);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) {
        router.replace('/auth/login');
        return;
      }
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <View style={{ gap: 2 }}>
        <Heading>Ordering from {cart.restaurantName}</Heading>
        <Body tone="muted" size={13}>as {user.name} · {user.email}</Body>
      </View>

      <Card>
        <Field
          label="Delivery address"
          value={address}
          onChangeText={setAddress}
          placeholder="e.g. 12 KN 4 Ave, Kicukiro, Kigali"
          autoFocus
        />
        <Field
          label="Notes for the kitchen (optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Allergies, no onions, ring the bell…"
          multiline
          numberOfLines={3}
          style={{ minHeight: 76, textAlignVertical: 'top' }}
        />
      </Card>

      <Card style={{ backgroundColor: c.surfaceAlt }}>
        <Heading>Your order</Heading>
        {cart.lines.map(l => (
          <Row key={l.item.id} style={{ justifyContent: 'space-between' }}>
            <Body style={{ flex: 1 }}>
              <Body weight="700">{l.quantity}× </Body>{l.item.name}
            </Body>
            <Body>{money(Number(l.item.price) * l.quantity)}</Body>
          </Row>
        ))}
        <View style={{ height: 1, backgroundColor: c.border, marginVertical: spacing.sm }} />
        <Row style={{ justifyContent: 'space-between' }}>
          <Heading>Total</Heading>
          <Heading>{money(cart.subtotal)}</Heading>
        </Row>
      </Card>

      {error ? <ErrorNote message={error} /> : null}

      <Button
        label={submitting ? 'Sending…' : 'Place order'}
        loading={submitting}
        disabled={submitting}
        onPress={submit}
      />
      <Button label="Add more items" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
