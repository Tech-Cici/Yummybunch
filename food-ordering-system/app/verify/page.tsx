'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/app/providers';

function VerifyForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useAuth();

  const [email, setEmail] = useState(params.get('email') ?? '');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    codeRef.current?.focus();
  }, []);

  // Countdown so the resend button reflects the server's 60s cooldown.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (code.trim().length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.verify({ email: email.trim().toLowerCase(), code: code.trim() });
      signIn(res.token, res.user);
      toast.success('Email confirmed. You are signed in.');
      router.replace(res.user.role === 'RESTAURANT' ? '/dashboard' : '/restaurants');
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  };

  const resend = async () => {
    setError(null);
    try {
      await api.resend(email.trim().toLowerCase());
      toast.success('A new code is on its way');
      setCooldown(60);
    } catch (e) {
      const err = e as ApiError;
      setError(err.message);
      // 429 already tells us to wait; reflect that in the button.
      if (err.status === 429) setCooldown(60);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="text-center">
        <MailCheck className="mx-auto h-9 w-9 text-primary" />
        <h1 className="mt-3 text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a 6-digit code to{' '}
          <span className="font-medium text-foreground">{email || 'your address'}</span>. It expires in
          10 minutes.
        </p>
      </div>

      <Card className="mt-8">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            {!params.get('email') && (
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
            )}

            <div>
              <Label htmlFor="code">Verification code</Label>
              <Input
                id="code"
                ref={codeRef}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em]"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              disabled={submitting || code.length !== 6}
              className="w-full bg-primary hover:bg-primary/90"
            >
              {submitting ? 'Confirming…' : 'Confirm email'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Didn&apos;t get it? </span>
            <button
              type="button"
              onClick={resend}
              disabled={cooldown > 0 || !email}
              className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>

          <p className="mt-6 rounded-md bg-warning/10 p-3 text-xs text-warning-foreground dark:text-warning">
            No email arriving? Check the spam folder. If the server has no mail credentials
            configured yet, sign-up will say so explicitly rather than sending anything.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading…</div>}>
      <VerifyForm />
    </Suspense>
  );
}
