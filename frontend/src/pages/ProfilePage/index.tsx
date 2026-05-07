// src/pages/ProfilePage/index.tsx
// useAuth      → current user data
// useAuthFetch → authenticated API calls
// useReducer   → form state (first_name, last_name, shipping_address)
// useState     → edit mode toggle, loading, success/error banners

import { useReducer, useState, useCallback, useEffect } from 'react';
import { useAuth }      from '../../context/Authcontext';
import { useAuthFetch } from '../../hooks/useAuthFetch';
import { useRole }      from '../../hooks/useRole';

// ─── Form state ───────────────────────────────────────────────────────────────

type FormState = {
  first_name:       string;
  last_name:        string;
  shipping_address: string;
};

type FormAction =
  | { type: 'SET'; field: keyof FormState; value: string }
  | { type: 'RESET'; payload: FormState };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET':    return { ...state, [action.field]: action.value };
    case 'RESET':  return action.payload;
    default:       return state;
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user }      = useAuth();
  const authFetch     = useAuthFetch();
  const { isBuyer, isSeller, isAdmin } = useRole();

  const initialForm: FormState = {
    first_name:       user?.first_name       ?? '',
    last_name:        user?.last_name        ?? '',
    shipping_address: '',
  };

  const [form, dispatch]    = useReducer(formReducer, initialForm);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]     = useState('');
  const [sellerRequested, setSellerRequested] = useState(false);
  const [sellerLoading, setSellerLoading]     = useState(false);

  // Fetch full profile on mount to get shipping_address
  useEffect(() => {
    async function fetchProfile() {
      const res = await authFetch('/user/me');
      if (res.ok) {
        const data = await res.json();
        dispatch({
          type: 'RESET',
          payload: {
            first_name:       data.first_name       ?? '',
            last_name:        data.last_name        ?? '',
            shipping_address: data.shipping_address ?? '',
          },
        });
      }
    }
    fetchProfile();
  }, []);

  // ── Save profile ────────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await authFetch('/user/me', {
        method: 'PATCH',
        body:   JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Update failed');
      }

      setSuccess('Profile updated successfully.');
      setEditMode(false);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [form, authFetch]);

  // ── Cancel edit ─────────────────────────────────────────────────────────────

  function handleCancel() {
    dispatch({
      type: 'RESET',
      payload: {
        first_name:       user?.first_name ?? '',
        last_name:        user?.last_name  ?? '',
        shipping_address: form.shipping_address,
      },
    });
    setEditMode(false);
    setError('');
  }

  // ── Request seller upgrade ──────────────────────────────────────────────────

  const handleRequestSeller = useCallback(async () => {
    setSellerLoading(true);
    setError('');
    try {
      const res = await authFetch('/user/request-seller', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? 'Request failed');
      }
      setSellerRequested(true);
      setSuccess('Seller request submitted. You will be notified once approved.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSellerLoading(false);
    }
  }, [authFetch]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  const initials = user
    ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
    : '';

  const INPUT = 'w-full bg-surface-container-low border-none rounded-xl px-4 py-3 text-on-surface focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all font-body text-sm disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <main className="flex-1 lg:ml-64 min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* ── Header ── */}
        <div className="flex items-center gap-6 mb-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-2xl font-black font-label shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight">
              {user?.first_name} {user?.last_name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`
                inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-label font-semibold capitalize
                ${isAdmin  ? 'bg-tertiary/10 text-tertiary' : ''}
                ${isSeller ? 'bg-primary/10 text-primary'   : ''}
                ${isBuyer  ? 'bg-outline/10 text-outline'   : ''}
              `}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                  {isAdmin ? 'admin_panel_settings' : isSeller ? 'storefront' : 'person'}
                </span>
                {user?.role}
              </span>
              <span className="text-sm text-on-surface-variant font-body">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* ── Banners ── */}
        {success && (
          <div className="mb-6 p-4 bg-secondary-container text-on-secondary-container rounded-xl font-label text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl font-label text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* ── Profile form ── */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-xl font-bold text-on-surface">Personal Details</h2>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-1.5 text-sm font-label font-semibold text-primary hover:underline"
              >
                <span className="material-symbols-outlined text-base">edit</span>
                Edit
              </button>
            )}
          </div>

          <div className="space-y-5">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-label text-xs font-semibold uppercase tracking-wider text-outline block">
                  First Name
                </label>
                <input
                  className={INPUT}
                  value={form.first_name}
                  disabled={!editMode}
                  onChange={(e) => dispatch({ type: 'SET', field: 'first_name', value: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-label text-xs font-semibold uppercase tracking-wider text-outline block">
                  Last Name
                </label>
                <input
                  className={INPUT}
                  value={form.last_name}
                  disabled={!editMode}
                  onChange={(e) => dispatch({ type: 'SET', field: 'last_name', value: e.target.value })}
                />
              </div>
            </div>

            {/* Email — read-only always */}
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold uppercase tracking-wider text-outline block">
                Email Address
              </label>
              <input
                className={INPUT}
                value={user?.email ?? ''}
                disabled
                readOnly
              />
              <p className="text-xs text-outline font-label">Email address cannot be changed.</p>
            </div>

            {/* Shipping address */}
            <div className="space-y-1.5">
              <label className="font-label text-xs font-semibold uppercase tracking-wider text-outline block">
                Shipping Address
              </label>
              <input
                className={INPUT}
                placeholder={editMode ? 'Enter your shipping address' : '—'}
                value={form.shipping_address}
                disabled={!editMode}
                onChange={(e) => dispatch({ type: 'SET', field: 'shipping_address', value: e.target.value })}
              />
            </div>
          </div>

          {/* Edit mode action buttons */}
          {editMode && (
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-sm rounded-full hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    Saving…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">save</span>
                    Save Changes
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-surface-container text-on-surface font-headline font-bold text-sm rounded-full hover:bg-surface-container-high transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </section>

        {/* ── Account info ── */}
        <section className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow mb-6">
          <h2 className="font-headline text-xl font-bold text-on-surface mb-6">Account</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-outline-variant/10">
              <div>
                <p className="font-label text-sm font-semibold text-on-surface">Balance</p>
                <p className="text-xs text-outline font-body mt-0.5">Available for bidding</p>
              </div>
              <span className="font-headline font-bold text-lg text-on-surface">
                {user?.balance?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) ?? '$0.00'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-label text-sm font-semibold text-on-surface">Email Verified</p>
                <p className="text-xs text-outline font-body mt-0.5">Account security status</p>
              </div>
              <span className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-label font-semibold
                ${user?.email_verified !== false
                  ? 'bg-secondary-container text-on-secondary-container'
                  : 'bg-error-container text-on-error-container'}
              `}>
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {user?.email_verified !== false ? 'verified' : 'warning'}
                </span>
                {user?.email_verified !== false ? 'Verified' : 'Not verified'}
              </span>
            </div>
          </div>
        </section>

        {/* ── Become a seller — buyer only ── */}
        {isBuyer && (
          <section className="bg-surface-container-lowest rounded-2xl p-8 editorial-shadow">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">storefront</span>
              </div>
              <div className="flex-1">
                <h2 className="font-headline text-xl font-bold text-on-surface mb-1">
                  Become a Seller
                </h2>
                <p className="font-body text-sm text-on-surface-variant mb-5">
                  Start listing your items and reach collectors worldwide. Submit a request and our team will review your application.
                </p>
                <button
                  onClick={handleRequestSeller}
                  disabled={sellerRequested || sellerLoading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-sm rounded-full hover:brightness-110 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                >
                  {sellerLoading ? (
                    <>
                      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                      Submitting…
                    </>
                  ) : sellerRequested ? (
                    <>
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      Request Submitted
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">storefront</span>
                      Request Seller Access
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}