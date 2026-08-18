'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Receipt, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { api, ApiError, money, Order, STATUS_LABEL } from '@/lib/api';
import { OrderProgress } from '@/components/app/order-progress';
import { BackButton } from '@/components/app/back-button';

const ACTIVE = new Set(['PLACED', 'RECEIVED', 'PREPARING', 'READY']);

function OrdersList() {
  const router = useRouter();
  const params = useSearchParams();
  const highlight = params.get('highlight');

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<Order | null>(null);

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      setOrders(await api.myOrders());
      setError(null);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) {
        router.replace('/login?next=/orders');
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll while anything is still in progress, so the customer sees the
  // restaurant's updates without refreshing the page.
  useEffect(() => {
    const hasActive = orders.some(o => ACTIVE.has(o.status));
    if (!hasActive) return;
    const timer = setInterval(() => load(true), 10_000);
    return () => clearInterval(timer);
  }, [orders, load]);

  const confirmCancel = async () => {
    if (!cancelling) return;
    try {
      await api.cancelOrder(cancelling.id);
      toast.success('Order cancelled');
      setCancelling(null);
      load(true);
    } catch (e) {
      toast.error((e as ApiError).message);
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1].map(i => <Skeleton key={i} className="h-56 w-full" />)}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/30 bg-destructive/10">
        <CardContent className="py-6">
          <p className="text-sm text-destructive">{error}</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => load()}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Receipt className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">You haven&apos;t ordered anything yet.</p>
          <Button className="bg-primary hover:bg-primary/90" onClick={() => router.push('/restaurants')}>
            Browse restaurants
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {orders.map(order => (
          <Card
            key={order.id}
            className={String(order.id) === highlight ? 'border-primary ring-1 ring-primary/30' : ''}
          >
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{order.restaurantName}</h3>
                  <p className="text-xs text-muted-foreground">
                    Order #{order.id} · {new Date(order.placedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{money(order.total)}</p>
                  <p className="text-xs text-muted-foreground">{STATUS_LABEL[order.status]}</p>
                </div>
              </div>

              <div className="mt-5">
                <OrderProgress order={order} />
              </div>

              <ul className="mt-5 divide-y border-t pt-3 text-sm">
                {order.items.map((it, i) => (
                  <li key={i} className="flex justify-between gap-3 py-1.5">
                    <span><span className="font-medium">{it.quantity}×</span> {it.itemName}</span>
                    <span className="text-muted-foreground">{money(it.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>Delivering to {order.deliveryAddress}</span>
                <div className="flex gap-2">
                  {order.status === 'PLACED' && (
                    <Button size="sm" variant="outline" className="text-destructive" onClick={() => setCancelling(order)}>
                      Cancel order
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => router.push(`/restaurants/${order.restaurantId}`)}>
                    Order again
                  </Button>
                </div>
              </div>

              {order.notes && (
                <p className="mt-2 text-xs text-muted-foreground">Your note: {order.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={Boolean(cancelling)} onOpenChange={open => !open && setCancelling(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this order?</DialogTitle>
            <DialogDescription>
              Order #{cancelling?.id} from {cancelling?.restaurantName} will be cancelled. This
              cannot be undone, and it is only possible before the restaurant accepts it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelling(null)}>Keep it</Button>
            <Button variant="destructive" onClick={confirmCancel}>Cancel order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <BackButton fallback="/restaurants" label="Browse restaurants" />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">Live status, updated as the kitchen works.</p>
        </div>
      </div>
      <Suspense fallback={<Skeleton className="h-56 w-full" />}>
        <OrdersList />
      </Suspense>
    </div>
  );
}
