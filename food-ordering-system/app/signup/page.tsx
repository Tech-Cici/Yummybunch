'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Store, User as UserIcon, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiError, Role } from '@/lib/api';

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();

  // /signup?role=restaurant lands straight on the owner form
  const [role, setRole] = useState<Role>(
    params.get('role') === 'restaurant' ? 'RESTAURANT' : 'CUSTOMER'
  );

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    restaurantName: '', cuisine: '', address: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('The two passwords do not match.');
      return;
    }
    if (role === 'RESTAURANT' && !form.restaurantName.trim()) {
      setError('Please give your restaurant a name.');
      return;
    }

    setSubmitting(true);
    try {
      await api.register({
        email: form.email.trim(),
        password: form.password,
        name: form.name.trim(),
        phone: form.phone.trim() || undefined,
        role,
        restaurantName: role === 'RESTAURANT' ? form.restaurantName.trim() : undefined,
        cuisine: role === 'RESTAURANT' ? form.cuisine.trim() || undefined : undefined,
        address: role === 'RESTAURANT' ? form.address.trim() || undefined : undefined,
      });
      // The account exists but is unverified; the code is in their inbox.
      router.push(`/verify?email=${encodeURIComponent(form.email.trim().toLowerCase())}`);
    } catch (e) {
      setError((e as ApiError).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center">
        <UtensilsCrossed className="mx-auto h-8 w-8 text-primary" />
        <h1 className="mt-3 text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ll email you a 6-digit code to confirm your address.
        </p>
      </div>

      {/* role switch */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        {([
          { value: 'CUSTOMER' as Role, icon: UserIcon, title: 'I want to order', sub: 'Browse and buy food' },
          { value: 'RESTAURANT' as Role, icon: Store, title: 'I run a restaurant', sub: 'Take orders online' },
        ]).map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRole(opt.value)}
            className={`rounded-lg border p-4 text-left transition ${
              role === opt.value
                ? 'border-primary bg-accent ring-1 ring-primary'
                : 'hover:border-border'
            }`}
          >
            <opt.icon className={`h-5 w-5 ${role === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="mt-2 text-sm font-medium">{opt.title}</p>
            <p className="text-xs text-muted-foreground">{opt.sub}</p>
          </button>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="name">{role === 'RESTAURANT' ? 'Your name' : 'Full name'}</Label>
              <Input id="name" value={form.name} onChange={set('name')} required />
            </div>

            {role === 'RESTAURANT' && (
              <>
                <div>
                  <Label htmlFor="restaurantName">Restaurant name</Label>
                  <Input id="restaurantName" value={form.restaurantName} onChange={set('restaurantName')} required />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="cuisine">Cuisine</Label>
                    <Input id="cuisine" value={form.cuisine} onChange={set('cuisine')} placeholder="Italian" />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={form.address} onChange={set('address')} placeholder="12 KN 4 Ave" />
                  </div>
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="0788 000 000" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={form.password} onChange={set('password')} required />
              </div>
              <div>
                <Label htmlFor="confirm">Confirm</Label>
                <Input id="confirm" type="password" value={form.confirm} onChange={set('confirm')} required />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">At least 8 characters.</p>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary/90">
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  // useSearchParams needs a Suspense boundary or the production build fails.
  return (
    <Suspense fallback={<div className="py-20 text-center text-muted-foreground">Loading…</div>}>
      <SignupForm />
    </Suspense>
  );
}
