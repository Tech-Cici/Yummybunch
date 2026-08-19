import { useState } from 'react';
import { useRouter } from 'expo-router';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/store';
import { Body, Button, Card, ErrorNote, Field, Heading, Screen } from '../../components/ui';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    try {
      const res = await api.login({ email: email.trim(), password });
      await signIn(res.token, res.user);
      router.replace('/');
    } catch (e) {
      const err = e as ApiError;
      // The backend signals an unconfirmed address with this exact marker.
      if (err.message === 'EMAIL_NOT_VERIFIED') {
        router.replace({ pathname: '/auth/verify', params: { email: email.trim().toLowerCase() } });
        return;
      }
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <Card>
        <Heading>Welcome back</Heading>
        <Body tone="muted">Sign in to order and follow your food.</Body>

        <Field
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
        />
        <Field
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="current-password"
        />

        {error ? <ErrorNote message={error} /> : null}

        <Button label={busy ? 'Signing in…' : 'Sign in'} loading={busy} disabled={busy} onPress={submit} />
        <Button label="Create an account instead" variant="ghost" onPress={() => router.replace('/auth/signup')} />
      </Card>
    </Screen>
  );
}
