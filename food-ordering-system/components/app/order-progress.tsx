'use client';

import { Check, X } from 'lucide-react';
import { Order, OrderStatus, PROGRESSION, STATUS_LABEL } from '@/lib/api';

/** Horizontal tracker for the happy path; a clear notice for cancelled/declined. */
export function OrderProgress({ order }: { order: Order }) {
  if (order.status === 'CANCELLED' || order.status === 'REJECTED') {
    const declined = order.status === 'REJECTED';
    return (
      <div className={`flex items-start gap-3 rounded-lg border p-3 ${declined ? 'border-destructive/30 bg-destructive/10' : 'border-border bg-muted/40'}`}>
        <X className={`mt-0.5 h-4 w-4 shrink-0 ${declined ? 'text-destructive' : 'text-muted-foreground'}`} />
        <div className="text-sm">
          <p className={`font-medium ${declined ? 'text-destructive' : 'text-foreground'}`}>
            {declined ? 'Declined by the restaurant' : 'You cancelled this order'}
          </p>
          {order.rejectionReason && (
            <p className="mt-0.5 text-destructive">Reason: {order.rejectionReason}</p>
          )}
        </div>
      </div>
    );
  }

  const currentIndex = PROGRESSION.indexOf(order.status);

  return (
    <ol className="flex items-center gap-1">
      {PROGRESSION.map((step: OrderStatus, i) => {
        const done = i <= currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-1.5">
            <div className="flex w-full items-center">
              {i > 0 && <div className={`h-0.5 flex-1 ${done ? 'bg-accent0' : 'bg-muted'}`} />}
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                  done ? 'bg-accent0 text-primary-foreground' : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-2 ring-primary/30' : ''}`}
              >
                {done ? <Check className="h-3 w-3" /> : i + 1}
              </div>
              {i < PROGRESSION.length - 1 && (
                <div className={`h-0.5 flex-1 ${i < currentIndex ? 'bg-accent0' : 'bg-muted'}`} />
              )}
            </div>
            <span className={`text-center text-[11px] leading-tight ${isCurrent ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
              {STATUS_LABEL[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
