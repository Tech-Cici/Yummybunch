import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../lib/store';
import { useColors } from '../../lib/theme';
import { Body, Button, Card, ErrorNote, Field, Heading, Screen } from '../../components/ui';

export default function VerifyScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const { signIn } = useAuth();
  const c = useColors();

  const [email, setEmail] = useState(params.email ?? '');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Mirrors the server's 60s resend cooldown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async () => {
    setError(null);
    if (code.trim().length !== 6) return setError('Enter the 6-digit code from your email.');

    setBusy(true);
    try {
      const res = await api.verify({ email: email.trim().toLowerCase(), code: code.trim() });
      await signIn(res.token, res.user);
      router.replace('/');
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError(null);
    try {
      await api.resend(email.trim().toLowerCase());
      setCooldown(60);
    } catch (e) {
      const err = e as ApiError;
      setError(err.message);
      if (err.status === 429) setCooldown(60);
    }
  };

  return (
    <Screen scroll>
      <Card>
        <Heading>Check your email</Heading>
        <Body tone="muted">
          We sent a 6-digit code to {email || 'your address'}. It expires in 10 minutes.
        </Body>

        {!params.email ? (
          <Field
            label="Email" value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
          />
        ) : null}

        <Field
          label="Verification code"
          value={code}
          onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
          keyboardType="number-pad"
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          placeholder="000000"
          maxLength={6}
          style={{ fontSize: 26, letterSpacing: 10, textAlign: 'center' }}
        />

        {error ? <ErrorNote message={error} /> : null}

        <Button
          label={busy ? 'Confirming…' : 'Confirm email'}
          loading={busy}
          disabled={busy || code.length !== 6}
          onPress={submit}
        />
        <Button
          label={cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
          variant="ghost"
          disabled={cooldown > 0 || !email}
          onPress={resend}
        />
      </Card>
    </Screen>
  );
}
