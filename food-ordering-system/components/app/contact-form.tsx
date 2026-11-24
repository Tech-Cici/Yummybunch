'use client';

import { useState } from 'react';
import { Check, Copy, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { CONTACT_EMAIL } from '@/lib/contact';

const TOPICS = ['Joining as a restaurant', 'Help with my listing', 'Partnership idea', 'Something else'];

/**
 * There is no messaging backend, so sending opens the visitor's own email app with the
 * message written out (the form says so). Nothing is stored or sent by the site itself.
 */
export function ContactForm() {
  const [form, setForm] = useState({ name: '', restaurant: '', email: '', phone: '', topic: TOPICS[0], message: '' });
  const [copied, setCopied] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `${form.topic}${form.restaurant ? ` · ${form.restaurant}` : ''}`;
    const details = [
      `Name: ${form.name.trim()}`,
      form.restaurant.trim() ? `Restaurant: ${form.restaurant.trim()}` : null,
      `Email: ${form.email.trim()}`,
      form.phone.trim() ? `Phone: ${form.phone.trim()}` : null,
    ].filter((l): l is string => l !== null);
    const body = [form.message.trim(), '', '—', ...details].join('\n');
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the address is visible anyway */
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <fieldset>
        <legend className="text-sm font-bold">What&apos;s it about?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TOPICS.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setForm(f => ({ ...f, topic: t }))}
              aria-pressed={form.topic === t}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                form.topic === t ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-name">Your name</Label>
          <Input id="c-name" value={form.name} onChange={set('name')} required autoComplete="name" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="c-restaurant">Restaurant (if you have one)</Label>
          <Input id="c-restaurant" value={form.restaurant} onChange={set('restaurant')} autoComplete="organization" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="c-email">Email</Label>
          <Input id="c-email" type="email" value={form.email} onChange={set('email')} required autoComplete="email" className="mt-1.5" />
        </div>
        <div>
          <Label htmlFor="c-phone">Phone (optional)</Label>
          <Input id="c-phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" placeholder="0788 000 000" className="mt-1.5" />
        </div>
      </div>
      <div>
        <Label htmlFor="c-message">Message</Label>
        <Textarea
          id="c-message"
          value={form.message}
          onChange={set('message')}
          required
          rows={5}
          placeholder="Tell us a little about your kitchen and what you'd like to know."
          className="mt-1.5 rounded-xl bg-card"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" className="gap-2">
          <Send className="h-4 w-4" /> Write the email
        </Button>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          {copied ? <Check className="h-4 w-4 text-herb" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : CONTACT_EMAIL}
        </button>
      </div>
      <p className="text-xs text-muted-foreground">This opens your email app with your message ready to send. Nothing is stored on this site.</p>
    </form>
  );
}
