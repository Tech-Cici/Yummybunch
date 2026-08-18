'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Pencil, Plus, Trash2, UtensilsCrossed } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { api, ApiError, imageUrl, MenuItem, money } from '@/lib/api';
import { BackButton } from '@/components/app/back-button';

type Draft = { name: string; description: string; price: string; category: string; available: boolean };

const EMPTY: Draft = { name: '', description: '', price: '', category: '', available: true };

export default function MenuAdminPage() {
  const router = useRouter();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<MenuItem | null>(null);

  // One hidden input, retargeted at whichever item's image is being replaced.
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadTarget = useRef<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await api.ownerMenu());
      setError(null);
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) {
        router.replace('/login?next=/dashboard/menu');
        return;
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setDraft(EMPTY); setCreating(true); };

  const openEdit = (item: MenuItem) => {
    setDraft({
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      category: item.category ?? '',
      available: item.available,
    });
    setEditing(item);
  };

  const save = async () => {
    const price = parseFloat(draft.price);
    if (!draft.name.trim()) { toast.error('Give the item a name'); return; }
    if (!Number.isFinite(price) || price <= 0) { toast.error('Enter a price greater than zero'); return; }

    setSaving(true);
    try {
      const body = {
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        price,
        category: draft.category.trim() || undefined,
        available: draft.available,
      };
      if (editing) {
        await api.updateMenuItem(editing.id, body);
        toast.success('Item updated');
      } else {
        await api.addMenuItem(body);
        toast.success('Item added to your menu');
      }
      setEditing(null);
      setCreating(false);
      await load();
    } catch (e) {
      toast.error((e as ApiError).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailable = async (item: MenuItem, available: boolean) => {
    // Optimistic: the switch should feel instant.
    setItems(prev => prev.map(i => (i.id === item.id ? { ...i, available } : i)));
    try {
      await api.updateMenuItem(item.id, { available });
    } catch (e) {
      setItems(prev => prev.map(i => (i.id === item.id ? { ...i, available: item.available } : i)));
      toast.error((e as ApiError).message);
    }
  };

  const pickImage = (itemId: number) => {
    uploadTarget.current = itemId;
    fileRef.current?.click();
  };

  const onFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const itemId = uploadTarget.current;
    e.target.value = ''; // let the same file be chosen again later
    if (!file || itemId == null) return;

    try {
      const updated = await api.uploadItemImage(itemId, file);
      setItems(prev => prev.map(i => (i.id === itemId ? updated : i)));
      toast.success('Photo updated');
    } catch (err) {
      toast.error((err as ApiError).message);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await api.deleteMenuItem(deleting.id);
      toast.success('Item removed');
      setDeleting(null);
      await load();
    } catch (e) {
      toast.error((e as ApiError).message);
      setDeleting(null);
    }
  };

  const dialogOpen = creating || Boolean(editing);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <BackButton fallback="/dashboard" label="Order queue" />
      <input
        ref={fileRef} type="file" accept="image/*" hidden onChange={onFileChosen}
      />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your menu</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Items marked unavailable stay hidden from customers but keep their details.
          </p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </div>

      <div className="mt-8 space-y-3">
        {loading ? (
          [0, 1, 2].map(i => <Skeleton key={i} className="h-24 w-full" />)
        ) : error ? (
          <Card className="border-destructive/30 bg-destructive/10">
            <CardContent className="py-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={load}>Try again</Button>
            </CardContent>
          </Card>
        ) : items.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
              <UtensilsCrossed className="h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Your menu is empty. Add your first dish and it appears to customers immediately.
              </p>
              <Button className="bg-primary hover:bg-primary/90" onClick={openCreate}>Add your first item</Button>
            </CardContent>
          </Card>
        ) : (
          items.map(item => {
            const pic = imageUrl(item.imageUrl);
            return (
              <Card key={item.id} className={item.available ? '' : 'bg-muted/40'}>
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <button
                    onClick={() => pickImage(item.id)}
                    className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-accent"
                    aria-label={`Change photo for ${item.name}`}
                    title="Change photo"
                  >
                    {pic ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pic} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-primary/40">
                        <ImagePlus className="h-6 w-6" />
                      </span>
                    )}
                    <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-xs font-medium text-primary-foreground group-hover:flex">
                      Change
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{item.name}</p>
                      {item.category && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{item.category}</span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{item.description}</p>
                    )}
                    <p className="mt-1 font-semibold text-primary">{money(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        id={`avail-${item.id}`}
                        checked={item.available}
                        onCheckedChange={v => toggleAvailable(item, v)}
                      />
                      <Label htmlFor={`avail-${item.id}`} className="text-xs text-muted-foreground">
                        {item.available ? 'Available' : 'Hidden'}
                      </Label>
                    </div>
                    <Button
                      size="icon" variant="outline" className="h-8 w-8"
                      aria-label={`Edit ${item.name}`} title="Edit"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon" variant="outline" className="h-8 w-8 text-destructive"
                      aria-label={`Remove ${item.name}`} title="Delete"
                      onClick={() => setDeleting(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* create / edit */}
      <Dialog
        open={dialogOpen}
        onOpenChange={open => { if (!open) { setCreating(false); setEditing(null); } }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit item' : 'Add a menu item'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Changes show to customers right away.' : 'You can add a photo after saving.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="d-name">Name</Label>
              <Input id="d-name" value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} autoFocus />
            </div>
            <div>
              <Label htmlFor="d-desc">Description</Label>
              <Textarea
                id="d-desc" rows={2} value={draft.description}
                onChange={e => setDraft({ ...draft, description: e.target.value })}
                placeholder="Tomato, mozzarella, basil"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="d-price">Price</Label>
                <Input
                  id="d-price" type="number" min="0.01" step="0.01" value={draft.price}
                  onChange={e => setDraft({ ...draft, price: e.target.value })} placeholder="11.50"
                />
              </div>
              <div>
                <Label htmlFor="d-cat">Section</Label>
                <Input
                  id="d-cat" value={draft.category}
                  onChange={e => setDraft({ ...draft, category: e.target.value })} placeholder="Pizza"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="d-avail" checked={draft.available}
                onCheckedChange={v => setDraft({ ...draft, available: v })}
              />
              <Label htmlFor="d-avail" className="text-sm">Available to order</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreating(false); setEditing(null); }}>Cancel</Button>
            {/* Label differs from the header's "Add item" button so the two are
                never confused, by a person or a screen reader. */}
            <Button className="bg-primary hover:bg-primary/90" disabled={saving} onClick={save}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add to menu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete */}
      <Dialog open={Boolean(deleting)} onOpenChange={open => !open && setDeleting(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove “{deleting?.name}”?</DialogTitle>
            <DialogDescription>
              It disappears from your menu. Past orders keep their own record, so receipts stay
              correct. To hide it temporarily instead, switch it to Hidden.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>Keep it</Button>
            <Button variant="destructive" onClick={confirmDelete}>Remove</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
