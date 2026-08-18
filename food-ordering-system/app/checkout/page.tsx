'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api, ApiError, money } from '@/lib/api';
import { useAuth, useCart } from '@/app/providers';
import { BackButton } from '@/components/app/back-button';

export default function CheckoutPage() {
  const cart = useCart();
  const router = useRouter();
  const { user } = useAuth();

  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);

    if (!cart.restaurantId || cart.lines.length === 0) {
      setError('Your cart is empty.');
      return;
    }
    if (!address.trim()) {
      setError('Please enter where the order should be delivered.');
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
      toast.success('Order sent to the restaurant');
      router.replace(`/orders?highlight=${order.id}`);
    } catch (e) {
      const err = e as ApiError;
      // 401 means the session lapsed between loading the page and submitting.
      if (err.status === 401) {
        router.replace('/login?next=/checkout');
        return;
      }
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <h1 className="mt-4 text-xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add a few dishes and come back.</p>
        <Button className="mt-6 bg-primary hover:bg-primary/90" onClick={() => router.push('/restaurants')}>
          Browse restaurants
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <BackButton fallback="/restaurants" label="Back to menu" />
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="mt-1 text-muted-foreground">Ordering from {cart.restaurantName}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-5">
        <Card className="md:col-span-3">
          <CardHeader><CardTitle className="text-base">Delivery details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="address">Delivery address</Label>
              <Input
                id="address"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="e.g. 12 KN 4 Ave, Kicukiro, Kigali"
                autoFocus
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes for the kitchen (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Allergies, no onions, ring the bell…"
                rows={3}
              />
            </div>
            {user && (
              <p className="text-xs text-muted-foreground">
                Ordering as {user.name} · {user.email}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-base">Your order</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {cart.lines.map(l => (
                <li key={l.item.id} className="flex justify-between gap-3 py-2">
                  <span className="min-w-0">
                    <span className="font-medium">{l.quantity}×</span> {l.item.name}
                  </span>
                  <span className="shrink-0">{money(Number(l.item.price) * l.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between border-t pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{money(cart.subtotal)}</span>
            </div>

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            <Button
              className="mt-4 w-full bg-primary hover:bg-primary/90"
              disabled={submitting}
              onClick={submit}
            >
              {submitting ? 'Sending…' : 'Place order'}
            </Button>
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => router.push(`/restaurants/${cart.restaurantId}`)}
            >
              Add more items
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
