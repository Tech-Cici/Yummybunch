'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { api, ApiError, imageUrl, Restaurant } from '@/lib/api';
import { BackButton } from '@/components/app/back-button';

export default function RestaurantSettingsPage() {
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: '', description: '', cuisine: '', address: '', phone: '',
    openingTime: '', closingTime: '', acceptingOrders: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.myRestaurant();
      setRestaurant(r);
      setForm({
        name: r.name ?? '',
        description: r.description ?? '',
        cuisine: r.cuisine ?? '',
        address: r.address ?? '',
        phone: r.phone ?? '',
        openingTime: r.openingTime ?? '',
        closingTime: r.closingTime ?? '',
        acceptingOrders: r.acceptingOrders,
      });
      setError(null);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) {
        router.replace('/login?next=/dashboard/settings');
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.name.trim()) { toast.error('Your restaurant needs a name'); return; }
    setSaving(true);
    try {
      const updated = await api.updateMyRestaurant({
        name: form.name.trim(),
        description: form.description.trim(),
        cuisine: form.cuisine.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        openingTime: form.openingTime.trim(),
        closingTime: form.closingTime.trim(),
        acceptingOrders: form.acceptingOrders,
      });
      setRestaurant(updated);
      toast.success('Saved');
    } catch (e) {
      toast.error((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  /** Toggled on its own so "closed" takes effect immediately, without Save. */
  const toggleOpen = async (accepting: boolean) => {
    setForm(f => ({ ...f, acceptingOrders: accepting }));
    try {
      const updated = await api.updateMyRestaurant({ name: form.name.trim() || restaurant?.name, acceptingOrders: accepting });
      setRestaurant(updated);
      toast.success(accepting ? 'You are open for orders' : 'Orders paused');
    } catch (e) {
      setForm(f => ({ ...f, acceptingOrders: !accepting }));
      toast.error((e as ApiError).message);
    }
  };

  const onCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setRestaurant(await api.uploadCover(file));
      toast.success('Cover photo updated');
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Store className="mx-auto h-10 w-10 text-muted-foreground/40" />
        <p className="mt-4 text-sm text-destructive">{error}</p>
        <Button variant="outline" className="mt-4" onClick={load}>Try again</Button>
      </div>
    );
  }

  const cover = imageUrl(restaurant?.coverImageUrl);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <BackButton fallback="/dashboard" label="Order queue" />
      <h1 className="text-3xl font-bold">Restaurant settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">This is what customers see on your page.</p>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={onCover} />

      {/* open / closed */}
      <Card className="mt-8">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div>
            <p className="font-medium">Accepting orders</p>
            <p className="text-sm text-muted-foreground">
              {form.acceptingOrders
                ? 'Customers can order right now.'
                : 'Your page shows as closed and ordering is blocked.'}
            </p>
          </div>
          <Switch checked={form.acceptingOrders} onCheckedChange={toggleOpen} />
        </CardContent>
      </Card>

      {/* cover */}
      <Card className="mt-6 overflow-hidden">
        <div className="relative h-44 bg-gradient-to-br from-primary/25 to-accent">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="Cover" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-primary/40">
              <ImagePlus className="h-10 w-10" />
            </div>
          )}
        </div>
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <p className="text-sm text-muted-foreground">Cover photo shown on your restaurant page.</p>
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            {cover ? 'Replace' : 'Upload'}
          </Button>
        </CardContent>
      </Card>

      {/* details */}
      <Card className="mt-6">
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Restaurant name</Label>
            <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description" rows={3} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="What makes your food worth ordering?"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="cuisine">Cuisine</Label>
              <Input
                id="cuisine" value={form.cuisine}
                onChange={e => setForm({ ...form, cuisine: e.target.value })} placeholder="Italian"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="open">Opens</Label>
              <Input id="open" value={form.openingTime} onChange={e => setForm({ ...form, openingTime: e.target.value })} placeholder="09:00" />
            </div>
            <div>
              <Label htmlFor="close">Closes</Label>
              <Input id="close" value={form.closingTime} onChange={e => setForm({ ...form, closingTime: e.target.value })} placeholder="22:00" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={load} disabled={saving}>Reset</Button>
            <Button className="bg-primary hover:bg-primary/90" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
