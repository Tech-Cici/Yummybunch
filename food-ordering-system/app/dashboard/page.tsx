'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChefHat, Clock, Inbox, Phone, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { api, ApiError, money, Order, OrderStatus, STATUS_LABEL } from '@/lib/api';

/** Wording for the button that performs each transition. */
const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  RECEIVED: 'Accept order',
  PREPARING: 'Start preparing',
  READY: 'Mark ready',
  COMPLETED: 'Mark handed over',
  REJECTED: 'Decline',
};

const TABS = [
  { key: 'live', label: 'Live', match: (s: OrderStatus) => s === 'PLACED' || s === 'RECEIVED' || s === 'PREPARING' || s === 'READY' },
  { key: 'new', label: 'New', match: (s: OrderStatus) => s === 'PLACED' },
  { key: 'kitchen', label: 'In kitchen', match: (s: OrderStatus) => s === 'RECEIVED' || s === 'PREPARING' },
  { key: 'ready', label: 'Ready', match: (s: OrderStatus) => s === 'READY' },
  { key: 'done', label: 'History', match: (s: OrderStatus) => s === 'COMPLETED' || s === 'CANCELLED' || s === 'REJECTED' },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<string>('live');
  const [busy, setBusy] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<Order | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      setOrders(await api.ownerOrders());
      setError(null);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) {
        router.replace('/login?next=/dashboard');
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  // New orders should appear without the owner refreshing.
  useEffect(() => {
    const timer = setInterval(() => load(true), 10_000);
    return () => clearInterval(timer);
  }, [load]);

  const advance = async (order: Order, status: OrderStatus, note?: string) => {
    setBusy(order.id);
    try {
      await api.advanceOrder(order.id, status, note);
      toast.success(`Order #${order.id} → ${STATUS_LABEL[status]}`);
      await load(true);
    } catch (e) {
      toast.error((e as ApiError).message);
    } finally {
      setBusy(null);
    }
  };

  const submitRejection = async () => {
    if (!rejecting) return;
    if (!reason.trim()) {
      toast.error('Give a short reason so the customer knows why');
      return;
    }
    await advance(rejecting, 'REJECTED', reason.trim());
    setRejecting(null);
    setReason('');
  };

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of TABS) map[t.key] = orders.filter(o => t.match(o.status)).length;
    return map;
  }, [orders]);

  const visible = useMemo(() => {
    const active = TABS.find(t => t.key === tab) ?? TABS[0];
    return orders.filter(o => active.match(o.status));
  }, [orders, tab]);

  const todayRevenue = useMemo(() => {
    const today = new Date().toDateString();
    return orders
      .filter(o => o.status === 'COMPLETED' && new Date(o.placedAt).toDateString() === today)
      .reduce((sum, o) => sum + Number(o.total), 0);
  }, [orders]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order queue</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            New orders arrive automatically. Move each one along as the kitchen works.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => load()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Waiting to accept', value: counts.new ?? 0 },
          { label: 'In the kitchen', value: counts.kitchen ?? 0 },
          { label: 'Completed today', value: money(todayRevenue) },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-8">
        <TabsList className="flex-wrap">
          {TABS.map(t => (
            <TabsTrigger key={t.key} value={t.key}>
              {t.label}
              <span className="ml-1.5 text-xs text-muted-foreground">{counts[t.key] ?? 0}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6 space-y-4">
        {loading ? (
          [0, 1].map(i => <Skeleton key={i} className="h-44 w-full" />)
        ) : error ? (
          <Card className="border-destructive/30 bg-destructive/10">
            <CardContent className="py-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => load()}>Try again</Button>
            </CardContent>
          </Card>
        ) : visible.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-2 py-14 text-center">
              <Inbox className="h-9 w-9 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Nothing here right now.</p>
            </CardContent>
          </Card>
        ) : (
          visible.map(order => (
            <Card key={order.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{new Date(order.placedAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-lg font-bold">{money(order.total)}</p>
                </div>

                <div className="mt-4 rounded-lg bg-muted/40 p-3 text-sm">
                  <p className="font-medium">{order.customerName}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                    {order.customerPhone && (
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{order.customerPhone}</span>
                    )}
                    <span>{order.customerEmail}</span>
                  </p>
                  <p className="mt-1.5 text-xs text-muted-foreground">Deliver to: {order.deliveryAddress}</p>
                  {order.notes && (
                    <p className="mt-1.5 text-xs font-medium text-warning-foreground dark:text-warning">Note: {order.notes}</p>
                  )}
                </div>

                <ul className="mt-4 divide-y text-sm">
                  {order.items.map((it, i) => (
                    <li key={i} className="flex justify-between gap-3 py-1.5">
                      <span className="flex items-center gap-2">
                        <ChefHat className="h-3.5 w-3.5 text-primary" />
                        <span className="font-medium">{it.quantity}×</span> {it.itemName}
                      </span>
                      <span className="text-muted-foreground">{money(it.lineTotal)}</span>
                    </li>
                  ))}
                </ul>

                {order.nextStatuses.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">
                    {order.nextStatuses.map(next =>
                      next === 'REJECTED' ? (
                        <Button
                          key={next} size="sm" variant="outline" className="text-destructive"
                          disabled={busy === order.id}
                          onClick={() => { setRejecting(order); setReason(''); }}
                        >
                          {ACTION_LABEL[next]}
                        </Button>
                      ) : (
                        <Button
                          key={next} size="sm" className="bg-primary hover:bg-primary/90"
                          disabled={busy === order.id}
                          onClick={() => advance(order, next)}
                        >
                          {busy === order.id ? 'Working…' : ACTION_LABEL[next] ?? next}
                        </Button>
                      )
                    )}
                  </div>
                )}

                {order.status === 'REJECTED' && order.rejectionReason && (
                  <p className="mt-3 text-xs text-destructive">Declined: {order.rejectionReason}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={Boolean(rejecting)} onOpenChange={open => !open && setRejecting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline order #{rejecting?.id}?</DialogTitle>
            <DialogDescription>
              The customer sees this reason, so keep it short and clear.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="e.g. We've run out of the main ingredient tonight"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>Keep it</Button>
            <Button variant="destructive" onClick={submitRejection}>Decline order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
