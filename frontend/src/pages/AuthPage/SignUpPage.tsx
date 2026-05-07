// SignUpPage.tsx
// useState  → form fields + show/hide password
// useMemo   → derived password rule checks (no recalc on unrelated field changes)
// useCallback → stable submit handler

import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import BrandPanel from './BrandPanel';

const INPUT =
  'w-full bg-surface-container-low border-none rounded-xl px-4 py-4 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all placeholder:text-outline/40 font-body';

type Fields = { name: string; email: string; password: string; confirm: string; terms: boolean };

export default function SignUpPage() {
  const [fields, setFields] = useState<Fields>({
    name: '', email: '', password: '', confirm: '', terms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((prev) => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  // Password rule checks — only recompute when password changes
  const rules = useMemo(() => ({
    length: fields.password.length >= 8,
    special: /[^a-zA-Z0-9]/.test(fields.password),
  }), [fields.password]);

  const isValid = fields.name.trim() !== '' &&
    fields.email.trim() !== '' &&
    rules.length && rules.special &&
    fields.password === fields.confirm &&
    fields.terms;

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (fields.password !== fields.confirm) { setError('Passwords do not match.'); return; }
    setError('');
    // TODO: supabase.auth.signUp({ email: fields.email, password: fields.password })
    console.log('Sign up:', fields);
  }, [fields]);

  return (
    <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl editorial-shadow bg-surface-container-lowest">
      <BrandPanel
        quote="Access the world's most exclusive collections."
        sub="Join an elite community of collectors and curators. Experience a marketplace built on trust and absolute clarity."
      />

      {/* Form side */}
      <div className="p-8 md:p-14 flex flex-col justify-center">
        <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight mb-2">
          Create an Account
        </h1>
        <p className="text-on-surface-variant font-body mb-8">
          Enter your details to begin your collection journey.
        </p>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <Field label="Full Name">
            <input className={INPUT} type="text" placeholder="Johnathan Doe" value={fields.name} onChange={set('name')} />
          </Field>

          {/* Email */}
          <Field label="Email Address">
            <input className={INPUT} type="email" placeholder="curator@example.com" value={fields.email} onChange={set('email')} />
          </Field>

          {/* Password pair */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Password">
              <div className="relative">
                <input className={INPUT} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={fields.password} onChange={set('password')} />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </Field>
            <Field label="Confirm Password">
              <input className={INPUT} type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={fields.confirm} onChange={set('confirm')} />
            </Field>
          </div>

          {/* Password rules */}
          <div className="flex items-center gap-4">
            <RuleChip met={rules.length} label="8+ characters" />
            <RuleChip met={rules.special} label="Special character" />
          </div>

          {/* Error */}
          {error && <p className="text-sm text-error font-label">{error}</p>}

          {/* Terms */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={fields.terms} onChange={set('terms')}
              className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20" />
            <span className="font-body text-sm text-on-surface-variant leading-tight">
              I agree to the{' '}
              <a href="#" className="text-primary font-semibold hover:underline">Terms &amp; Conditions</a>{' '}
              and{' '}
              <a href="#" className="text-primary font-semibold hover:underline">Privacy Policy</a>.
            </span>
          </label>

          {/* Submit */}
          <button type="submit" disabled={!isValid}
            className="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold rounded-full transition-all active:scale-95 hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none editorial-shadow">
            Create Account
          </button>

          {/* Mobile login link */}
          <p className="md:hidden text-center font-label text-sm text-outline pt-2">
            Already have an account?{' '}
            <Link to="/auth/login" className="font-bold text-primary">Login</Link>
          </p>
        </form>

        <SocialButtons />
      </div>
    </div>
  );
}

// ─── Local helpers ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="font-label text-xs font-semibold uppercase tracking-wider text-outline block">
        {label}
      </label>
      {children}
    </div>
  );
}

function RuleChip({ met, label }: { met: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`material-symbols-outlined text-base ${met ? 'text-secondary' : 'text-outline'}`}
        style={met ? { fontVariationSettings: "'FILL' 1" } : undefined}>
        {met ? 'check_circle' : 'circle'}
      </span>
      <span className={`font-label text-xs ${met ? 'text-on-surface-variant' : 'text-outline'}`}>{label}</span>
    </div>
  );
}

function SocialButtons() {
  return (
    <div className="mt-6">
      <div className="relative flex items-center justify-center py-4">
        <div className="absolute w-full border-t border-outline-variant/30" />
        <span className="relative bg-surface-container-lowest px-4 font-label text-xs text-outline uppercase tracking-widest">
          Or sign up with
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <SocialBtn label="Google" icon={<img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0qIeV1C0XIfy1oIOxf7G6bSUf3N9LdFdRvlCQbVZsKkPJWUP3bYGrYv_UgdeDOq93HTWNZ_sm9rVaQ_tFM3o645cn3v0EQ849luOPZK_9iqdWvrRbRwi0kspftrni4VcdEv4cxYC0UNwIJYP5O4_ydX4cEObXKxss9wu6bb8ayE1kAP_KPxuRCiOJxf0vxpMcDC2fspPS2TlFoazC6IWpxrBZSpDAEtNWb-PoXD9EQ1gqhkauTk-r6XJR1hXB_L4IjDZqGC0ywA" alt="Google" className="w-5 h-5" />} />
        <SocialBtn label="Apple" icon={<span className="material-symbols-outlined text-xl">ios</span>} />
      </div>
    </div>
  );
}

function SocialBtn({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <button type="button"
      className="flex items-center justify-center gap-2 py-3 bg-surface border border-outline-variant/20 rounded-xl hover:bg-surface-container-low transition-colors font-headline font-semibold text-sm text-on-surface">
      {icon}{label}
    </button>
  );
}
