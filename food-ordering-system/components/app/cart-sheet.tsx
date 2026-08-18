'use client';

import { useRouter } from 'next/navigation';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/app/providers';
import { money } from '@/lib/api';
import { useState } from 'react';

export function CartSheet() {
  const cart = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingBag className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">Cart</span>
          {cart.count > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
              {cart.count}
            </span>
          )}
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your order</SheetTitle>
          <SheetDescription>
            {cart.restaurantName ? `From ${cart.restaurantName}` : 'Your cart is empty'}
          </SheetDescription>
        </SheetHeader>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Nothing here yet.</p>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                router.push('/restaurants');
              }}
            >
              Browse restaurants
            </Button>
          </div>
        ) : (
          <>
            <div className="-mx-6 flex-1 overflow-y-auto px-6">
              <ul className="divide-y">
                {cart.lines.map(line => (
                  <li key={line.item.id} className="flex items-start gap-3 py-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{line.item.name}</p>
                      <p className="text-xs text-muted-foreground">{money(line.item.price)} each</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Button
                          variant="outline" size="icon" className="h-7 w-7"
                          aria-label={`Decrease ${line.item.name}`}
                          onClick={() => cart.setQuantity(line.item.id, line.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center text-sm">{line.quantity}</span>
                        <Button
                          variant="outline" size="icon" className="h-7 w-7"
                          aria-label={`Increase ${line.item.name}`}
                          onClick={() => cart.setQuantity(line.item.id, line.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-destructive"
                          aria-label={`Remove ${line.item.name}`}
                          onClick={() => cart.remove(line.item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {money(Number(line.item.price) * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Subtotal</span>
                <span>{money(cart.subtotal)}</span>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => {
                  setOpen(false);
                  router.push('/checkout');
                }}
              >
                Go to checkout
              </Button>
              <Button variant="ghost" className="w-full text-muted-foreground" onClick={cart.clear}>
                Empty cart
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
