import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight, Camera, ChefHat, ClipboardList, Clock, Mail, MailCheck, Power, Store, UtensilsCrossed,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ContactForm } from '@/components/app/contact-form';
import { CONTACT_EMAIL } from '@/lib/contact';
import { foodPhoto } from '@/lib/food-photos';

export const metadata: Metadata = {
  title: 'Join us',
  description: 'List your restaurant on Yummybunch: put your menu online with photos and take orders from people nearby.',
};

const BENEFITS = [
  { icon: Camera, title: 'A menu that makes mouths water', body: 'Add every dish with a photo, a description and a price, grouped into sections like Breakfast or Grills.' },
  { icon: ClipboardList, title: 'One simple order queue', body: 'New orders land in one list. Move each one from Received to Preparing to Ready, and customers see every step.' },
  { icon: Power, title: 'You decide when you open', body: 'Switch ordering on when the kitchen is ready and off when it gets busy or you close for the day.' },
  { icon: Clock, title: 'Your hours, your details', body: 'Opening times, address, phone, cuisine and a cover photo, all editable from your settings.' },
];

const STEPS = [
  { icon: Store, title: 'Create your account', body: 'Choose "I run a restaurant" and give us your restaurant name, cuisine and address.' },
  { icon: MailCheck, title: 'Confirm your email', body: 'We send a 6-digit code to your inbox so we know it\'s really you.' },
  { icon: UtensilsCrossed, title: 'Build your menu', body: 'Add your dishes and photos, set your hours and a cover photo.' },
  { icon: ChefHat, title: 'Start taking orders', body: 'Switch ordering on. Your restaurant appears for everyone browsing Yummybunch.' },
];

const FAQ = [
  { q: 'Do customers need an account to see my menu?', a: 'No. Anyone can browse restaurants, menus and prices. Customers sign up only when they place an order, so more people discover your food.' },
  { q: 'How do I receive orders?', a: 'Orders arrive in the Order queue on your dashboard. You update each one as you cook (Received, Preparing, Ready) and the customer follows along on their side.' },
  { q: 'Can I pause orders when the kitchen is full?', a: 'Yes. Turn ordering off in your dashboard at any time and back on when you\'re ready. Your menu stays visible while you\'re paused.' },
  { q: 'Can I change my menu later?', a: 'Any time. Add, edit or remove dishes, change prices and swap photos from the Menu page.' },
  { q: 'Can one customer order from two restaurants at once?', a: 'No, a basket holds one restaurant\'s dishes at a time. That keeps every order simple for your kitchen.' },
];

export default function JoinPage() {
  return (
    <div className="overflow-x-clip">
      {/* ---------------- hero ---------------- */}
      <section className="mx-auto max-w-6xl px-4 pt-8">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#2b1a12] text-white shadow-xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foodPhoto('dining')} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2b1a12] via-[#2b1a12]/80 to-[#2b1a12]/10" />
          <div className="relative grid gap-10 p-8 sm:p-14 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-saffron ring-1 ring-white/15">
                <ChefHat className="h-3.5 w-3.5" /> Join Yummybunch
              </span>
              <h1 className="font-display mt-5 text-4xl font-semibold leading-tight sm:text-6xl">
                Your kitchen, <span className="text-saffron">on every table</span> in the neighbourhood.
              </h1>
              <p className="mt-5 max-w-xl text-lg text-white/80">
                Put your menu online with mouth-watering photos, take orders from people nearby, and run it all from one
                simple dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup?role=restaurant">
                  <Button size="lg" className="gap-2 bg-saffron text-[#2b1a12] shadow-none hover:bg-saffron/90">
                    List your restaurant <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#talk-to-us">
                  <Button size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white">
                    Talk to us first
                  </Button>
                </a>
              </div>
            </div>
            <div className="hidden justify-end lg:flex">
              <QueuePreview />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- benefits ---------------- */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Why cook with us</p>
        <h2 className="font-display mt-1 max-w-2xl text-3xl font-semibold sm:text-4xl">Everything you need to sell your food online, nothing you don&apos;t</h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-5 rounded-3xl border bg-card p-6 shadow-sm shadow-orange-900/5">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold">{title}</h3>
                <p className="mt-1.5 text-muted-foreground">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- steps ---------------- */}
      <section className="border-y bg-secondary/60">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-primary">How to join</p>
          <h2 className="font-display mt-1 text-center text-3xl font-semibold sm:text-4xl">Four steps to your first order</h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <li key={title} className="relative rounded-3xl border bg-card p-6 shadow-sm shadow-orange-900/5">
                <span className="font-display absolute right-5 top-3 text-5xl font-semibold text-primary/10">{i + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="font-display mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Link href="/signup?role=restaurant">
              <Button size="lg" className="gap-2">Start with step 1 <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- photo strip ---------------- */}
      <section className="mx-auto grid max-w-6xl grid-cols-3 gap-4 px-4 pt-20">
        {(['brochettes', 'stew', 'pancakes'] as const).map((p, i) => (
          <div key={p} className={`overflow-hidden rounded-3xl border-4 border-card shadow-lg shadow-orange-900/10 ${i === 1 ? 'translate-y-6' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foodPhoto(p)} alt="" className="aspect-[4/5] w-full object-cover" />
          </div>
        ))}
      </section>

      {/* ---------------- FAQ + contact ---------------- */}
      <section className="mx-auto grid max-w-6xl gap-12 px-4 py-24 lg:grid-cols-[1fr_1.15fr]">
        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Questions</p>
          <h2 className="font-display mt-1 text-3xl font-semibold">Good to know</h2>
          <Accordion type="single" collapsible className="mt-6">
            {FAQ.map((f, i) => (
              <AccordionItem key={f.q} value={`q${i}`}>
                <AccordionTrigger className="text-left font-bold hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div id="talk-to-us" className="scroll-mt-24 rounded-[2rem] border bg-card p-6 shadow-lg shadow-orange-900/10 sm:p-10">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary">
            <Mail className="h-6 w-6" />
          </span>
          <h2 className="font-display mt-5 text-3xl font-semibold">Talk to us</h2>
          <p className="mt-2 text-muted-foreground">
            Not sure yet, or need a hand setting up? Send us a note and we&apos;ll get back to you. You can also write to{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-primary underline-offset-2 hover:underline">{CONTACT_EMAIL}</a>.
          </p>
          <div className="mt-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}

/** A slice of the restaurant dashboard's order queue, to show what running orders looks like. */
function QueuePreview() {
  const rows = [
    { code: '#1042', items: '2× Brochettes, chips', status: 'Received', cls: 'bg-accent text-accent-foreground' },
    { code: '#1041', items: '1× Chicken stew, rice', status: 'Preparing', cls: 'bg-saffron/25 text-[#7a4a06]' },
    { code: '#1040', items: '3× Akatogo', status: 'Ready', cls: 'bg-herb/15 text-herb' },
  ];
  return (
    <div className="w-80 rounded-3xl bg-card p-5 text-foreground shadow-2xl">
      <div className="flex items-center justify-between">
        <p className="font-display text-lg font-semibold">Order queue</p>
        <span className="flex items-center gap-1.5 rounded-full bg-herb/15 px-2.5 py-1 text-xs font-bold text-herb">
          <span className="h-1.5 w-1.5 rounded-full bg-herb" /> Taking orders
        </span>
      </div>
      <ul className="mt-4 space-y-2">
        {rows.map(r => (
          <li key={r.code} className="flex items-center justify-between gap-3 rounded-2xl bg-secondary px-3.5 py-2.5 text-sm">
            <span className="min-w-0">
              <span className="font-bold">{r.code}</span>
              <span className="block truncate text-xs text-muted-foreground">{r.items}</span>
            </span>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${r.cls}`}>{r.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
