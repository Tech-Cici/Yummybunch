import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useCart } from '../../lib/store';
import { money, spacing, useColors } from '../../lib/theme';
import { Body, Button, Card, EmptyState, Heading, Row, Screen } from '../../components/ui';

export default function CartScreen() {
  const cart = useCart();
  const router = useRouter();
  const c = useColors();

  if (cart.lines.length === 0) {
    return (
      <Screen>
        <EmptyState
          title="Your cart is empty"
          body="Find something to eat and add it here."
          action={{ label: 'Browse restaurants', onPress: () => router.replace('/') }}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={{ gap: 4 }}>
        <Heading>{cart.restaurantName}</Heading>
        <Body tone="muted" size={13}>
          {cart.count} item{cart.count === 1 ? '' : 's'} in your order
        </Body>
      </View>

      {cart.lines.map(line => (
        <Card key={line.item.id}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Body weight="600" size={15}>{line.item.name}</Body>
              <Body tone="muted" size={13}>{money(line.item.price)} each</Body>
            </View>
            <Body weight="700">{money(Number(line.item.price) * line.quantity)}</Body>
          </Row>

          <Row style={{ marginTop: spacing.sm }}>
            <Button
              label="−"
              variant="outline"
              small
              onPress={() => cart.setQuantity(line.item.id, line.quantity - 1)}
              style={{ width: 44 }}
            />
            <Body weight="700" size={16} style={{ minWidth: 28, textAlign: 'center' }}>
              {line.quantity}
            </Body>
            <Button
              label="+"
              variant="outline"
              small
              onPress={() => cart.setQuantity(line.item.id, line.quantity + 1)}
              style={{ width: 44 }}
            />
            <View style={{ flex: 1 }} />
            <Button
              label="Remove"
              variant="ghost"
              small
              onPress={() => cart.remove(line.item.id)}
            />
          </Row>
        </Card>
      ))}

      <Card style={{ backgroundColor: c.surfaceAlt }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Heading>Subtotal</Heading>
          <Heading>{money(cart.subtotal)}</Heading>
        </Row>
        <Body tone="muted" size={12}>
          The restaurant confirms the final total when it accepts your order.
        </Body>
      </Card>

      <Button label="Continue to checkout" onPress={() => router.push('/checkout')} />
      <Button label="Empty cart" variant="ghost" onPress={cart.clear} />
    </Screen>
  );
}
