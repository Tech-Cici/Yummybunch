import { useState } from 'react';
import { useRouter } from 'expo-router';
import { api, ApiError } from '../../lib/api';
import { Body, Button, Card, ErrorNote, Field, Heading, Screen } from '../../components/ui';

export default function SignupScreen() {
  const router = useRouter();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setError(null);
    if (!form.name.trim()) return setError('Please enter your name.');
    if (!form.email.trim()) return setError('Please enter your email.');
    if (form.password.length < 8) return setError('Password must be at least 8 characters.');
    if (form.password !== form.confirm) return setError('The two passwords do not match.');

    setBusy(true);
    try {
      await api.register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        password: form.password,
        role: 'CUSTOMER',
      });
      router.replace({ pathname: '/auth/verify', params: { email: form.email.trim().toLowerCase() } });
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll>
      <Card>
        <Heading>Create your account</Heading>
        <Body tone="muted">We email you a 6-digit code to confirm your address.</Body>

        <Field label="Full name" value={form.name} onChangeText={set('name')} autoComplete="name" />
        <Field
          label="Email" value={form.email} onChangeText={set('email')}
          keyboardType="email-address" autoCapitalize="none" autoComplete="email" autoCorrect={false}
        />
        <Field
          label="Phone (optional)" value={form.phone} onChangeText={set('phone')}
          keyboardType="phone-pad" autoComplete="tel"
        />
        <Field
          label="Password" value={form.password} onChangeText={set('password')}
          secureTextEntry autoComplete="new-password" hint="At least 8 characters."
        />
        <Field
          label="Confirm password" value={form.confirm} onChangeText={set('confirm')}
          secureTextEntry autoComplete="new-password"
        />

        {error ? <ErrorNote message={error} /> : null}

        <Button label={busy ? 'Creating…' : 'Create account'} loading={busy} disabled={busy} onPress={submit} />
        <Button label="I already have an account" variant="ghost" onPress={() => router.replace('/auth/login')} />
      </Card>
    </Screen>
  );
}
