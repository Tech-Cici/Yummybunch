import { Alert, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/store';
import { spacing, useColors } from '../../lib/theme';
import { Badge, Body, Button, Card, Heading, Loading, Row, Screen, Title } from '../../components/ui';

export default function AccountScreen() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const c = useColors();

  if (loading) return <Screen><Loading /></Screen>;

  return (
    <Screen scroll>
      {user ? (
        <>
          <Card>
            <Row style={{ alignItems: 'flex-start' }}>
              <View
                style={{
                  width: 52, height: 52, borderRadius: 26, backgroundColor: c.accent,
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Body size={22}>👤</Body>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Title>{user.name}</Title>
                <Body tone="muted" size={13}>{user.email}</Body>
                <Row style={{ marginTop: 4 }}>
                  <Badge label={user.role === 'CUSTOMER' ? 'Customer' : user.role} tone="primary" />
                  {user.emailVerified ? <Badge label="Verified" tone="success" /> : null}
                </Row>
              </View>
            </Row>
            {user.phone ? <Body tone="muted" size={13}>📞 {user.phone}</Body> : null}
          </Card>

          {user.role === 'RESTAURANT' ? (
            <Card>
              <Heading>Restaurant account</Heading>
              <Body tone="muted">
                This app is for ordering. To manage your menu and incoming orders, use the
                Yummybunch web dashboard on a computer.
              </Body>
            </Card>
          ) : null}

          <Button label="My orders" variant="outline" onPress={() => router.push('/orders')} />
          <Button
            label="Sign out"
            variant="ghost"
            onPress={() =>
              Alert.alert('Sign out?', 'You can sign back in any time.', [
                { text: 'Stay', style: 'cancel' },
                { text: 'Sign out', style: 'destructive', onPress: () => signOut() },
              ])
            }
          />
        </>
      ) : (
          <Card>
            <Heading>You are browsing as a guest</Heading>
            <Body tone="muted">
              Look around all you like. An account is only needed to place an order and follow it.
            </Body>
            <Button label="Sign in" onPress={() => router.push('/auth/login')} />
            <Button label="Create an account" variant="outline" onPress={() => router.push('/auth/signup')} />
          </Card>
      )}

    </Screen>
  );
}
