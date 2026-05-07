// AuctionForm.tsx — the 4 form sections + actions bar
// Pure presentational: all state comes from props via index.tsx
// AuctionForm.tsx — the 4 form sections + actions bar
// Pure presentational: all state comes from props via index.tsx
import type { AuctionCategory, AuctionDuration, ConditionGrade } from '../../types/auction';
import type { FormState } from './useFormState';
import ImageUpload from './ImageUpload';

const INPUT = 'w-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary/20 rounded-xl px-4 py-4 font-body';
const CATEGORIES: AuctionCategory[] = ['Timepieces', 'Fine Art', 'Jewelry', 'Automobiles', 'Rare Coins'];
const DURATIONS: AuctionDuration[] = ['3 Days', '5 Days', '7 Days', '14 Days', 'Private Sale (No Timer)'];
const CONDITIONS: ConditionGrade[] = ['Mint (As New)', 'Excellent', 'Good (Shows Wear)', 'Restored', 'Fair (Functional)'];

interface Props {
  form: FormState;
  setField: <K extends keyof FormState>(field: K, value: FormState[K]) => void;
  isValid: boolean;
  onImagesChange: (urls: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
  onSaveDraft: () => void;
}

export default function AuctionForm({ form, setField, isValid, onImagesChange, onSubmit, onSaveDraft }: Props) {
  return (
    <form className="space-y-16" onSubmit={onSubmit} noValidate>

      {/* 01 — Basic Information */}
      <Section step="01" title="Basic Information">
        <Field label="Item Title">
          <input className={INPUT} placeholder="e.g. 1963 Patek Philippe Ref. 2526"
            value={form.title} onChange={(e) => setField('title', e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-6">
          <Field label="Category">
            <select className={INPUT} value={form.category} onChange={(e) => setField('category', e.target.value as AuctionCategory)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Provenance">
            <input className={INPUT} placeholder="Era or Year"
              value={form.provenance} onChange={(e) => setField('provenance', e.target.value)} />
          </Field>
        </div>
        <Field label="Description">
          <textarea className={`${INPUT} resize-none`} rows={5}
            placeholder="Detail the history, significance, and aesthetic qualities..."
            value={form.description} onChange={(e) => setField('description', e.target.value)} />
        </Field>
      </Section>

      {/* 02 — Visual Documentation */}
      <Section step="02" title="Visual Documentation">
        <ImageUpload onImagesChange={onImagesChange} />
      </Section>

      {/* 03 — Auction Parameters */}
      <Section step="03" title="Auction Parameters">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Reserve Price (USD)">
            <PriceInput value={form.reservePrice}
              onChange={(v) => setField('reservePrice', v)} />
          </Field>
          <Field label="Starting Bid (USD)">
            <PriceInput value={form.startingBid}
              onChange={(v) => setField('startingBid', v)} />
          </Field>
          <Field label="Auction Duration">
            <select className={INPUT} value={form.duration} onChange={(e) => setField('duration', e.target.value as AuctionDuration)}>
              {DURATIONS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </Field>
          <Field label="Start Date">
            <input type="datetime-local" className={INPUT}
              value={form.startDate} onChange={(e) => setField('startDate', e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* 04 — Condition & Location */}
      <Section step="04" title="Condition & Location">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Condition Grade">
            <select className={INPUT} value={form.conditionGrade} onChange={(e) => setField('conditionGrade', e.target.value as ConditionGrade)}>
              {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Current Location">
            <input className={INPUT} placeholder="City, Country"
              value={form.location} onChange={(e) => setField('location', e.target.value)} />
          </Field>
        </div>
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10 mt-6">
          <span className="material-symbols-outlined text-primary shrink-0">verified_user</span>
          <p className="text-sm font-body text-on-surface-variant">
            Authenticated by <strong>The Curator Concierge</strong>. We may request physical shipment for verification before the auction live-date.
          </p>
        </div>
      </Section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-8 border-t border-outline-variant/20">
        <button type="button" onClick={onSaveDraft}
          className="text-on-surface font-headline font-bold hover:text-primary transition-colors flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">save</span>
          Save Draft
        </button>
        <div className="flex gap-4">
          <button type="button"
            className="px-8 py-4 bg-surface-container-high text-on-surface font-headline font-bold rounded-xl hover:bg-surface-variant transition-all">
            Preview Listing
          </button>
          <button type="submit" disabled={!isValid}
            className="px-12 py-4 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none">
            Create Auction
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Local helpers ────────────────────────────────────────────────────────────

function Section({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold font-label text-sm">{step}</span>
        <h2 className="text-xl font-headline font-bold">{title}</h2>
      </div>
      <div className="p-8 bg-surface-container-low rounded-2xl space-y-6">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-wider block">{label}</label>
      {children}
    </div>
  );
}

function PriceInput({ value, onChange }: { value: number | ''; onChange: (v: number | '') => void }) {
  const INPUT_CLS = 'w-full bg-surface-container-lowest border-none focus:ring-2 focus:ring-primary/20 rounded-xl pl-8 pr-4 py-4 font-body';
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-on-surface-variant">$</span>
      <input type="number" min={0} className={INPUT_CLS} placeholder="0.00"
        value={value}
        onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))} />
    </div>
  );
}
