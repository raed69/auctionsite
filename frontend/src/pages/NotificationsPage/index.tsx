// src/pages/NotificationsPage/index.tsx
// Full-width layout (no sidebar) — uses FullWidthLayout from AppRouter.
//
// useState  → active filter tab ('all' | 'unread')
// useMemo   → filtered + sorted notification list (only recomputes on data/filter change)
// useCallback → stable markAllRead handler

import { useState, useMemo, useCallback } from 'react';
import type { Notification, NotificationType } from '../../types/notification';

// ─── Mock data — replace with useNotifications() hook once backend is wired ──
const MOCK: Notification[] = [
  {
    id: '1', type: 'outbid', read: false, timeAgo: '2 mins ago',
    title: 'You have been outbid',
    body: 'Someone just placed a higher bid on',
    auctionTitle: '1964 Vintage Rolex Daytona', auctionId: '1',
  },
  {
    id: '2', type: 'new_bid', read: true, timeAgo: '15 mins ago',
    title: 'New bid placed by @collector_art',
    body: 'A new bid of $12,500 was placed on',
    auctionTitle: 'Abstract Composition No. 4', auctionId: '2',
  },
  {
    id: '3', type: 'ending_soon', read: true, timeAgo: '1 hour ago',
    title: 'Auction ending in 30m',
    body: 'The bidding for',
    auctionTitle: 'Mid-Century Modern Eames Chair', auctionId: '3',
  },
  {
    id: '4', type: 'outbid', read: true, timeAgo: '3 hours ago',
    title: 'You have been outbid',
    body: 'A competitive bid was placed on',
    auctionTitle: "First Edition 'The Great Gatsby'", auctionId: '4',
  },
  {
    id: '5', type: 'won', read: true, timeAgo: 'Yesterday',
    title: 'Congratulations! You won',
    body: 'You are the winning bidder for',
    auctionTitle: 'Signed Contemporary Sculpture', auctionId: '5',
  },
];

// Icon + colour config per notification type
const TYPE_CONFIG: Record<NotificationType, { icon: string; iconColor: string; bgColor: string }> = {
  outbid:      { icon: 'warning',  iconColor: 'text-tertiary',  bgColor: 'bg-tertiary-container/10' },
  new_bid:     { icon: 'gavel',    iconColor: 'text-secondary', bgColor: 'bg-secondary-container/10' },
  ending_soon: { icon: 'schedule', iconColor: 'text-primary',   bgColor: 'bg-primary-container/10' },
  won:         { icon: 'stars',    iconColor: 'text-secondary', bgColor: 'bg-secondary-container/20' },
};

type Filter = 'all' | 'unread';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(MOCK);
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = useMemo(
    () => filter === 'unread' ? notifications.filter((n) => !n.read) : notifications,
    [notifications, filter],
  );

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    // TODO: notificationService.markAllRead()
  }, []);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    // TODO: notificationService.markRead(id)
  }, []);

  return (
    <main className="flex-grow py-12 px-6">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface font-headline mb-2">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-3 text-base font-bold text-white bg-primary px-2.5 py-0.5 rounded-full align-middle">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-on-surface-variant font-body">
              Stay updated with your latest bids and auction alerts.
            </p>
          </div>

          {/* Filter tabs + mark all read */}
          <div className="flex items-center gap-4">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="font-label text-sm font-bold text-primary hover:underline transition-colors"
              >
                Mark all read
              </button>
            )}
            <div className="inline-flex bg-surface-container-low p-1 rounded-xl">
              {(['all', 'unread'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-6 py-2 rounded-lg text-sm font-bold capitalize transition-all ${
                    filter === f
                      ? 'bg-surface-container-lowest text-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-on-surface-variant font-body">
              <span className="material-symbols-outlined text-5xl mb-4 block text-outline">notifications_off</span>
              No {filter === 'unread' ? 'unread ' : ''}notifications.
            </div>
          ) : (
            filtered.map((n) => (
              <NotificationItem key={n.id} notification={n} onRead={markRead} />
            ))
          )}
        </div>

        {/* Load more */}
        {filtered.length > 0 && (
          <div className="mt-12 text-center">
            <button className="text-primary font-bold font-label text-sm hover:underline transition-all">
              Load earlier notifications
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

// ─── NotificationItem — local to this page ────────────────────────────────────
function NotificationItem({ notification: n, onRead }: { notification: Notification; onRead: (id: string) => void }) {
  const { icon, iconColor, bgColor } = TYPE_CONFIG[n.type];
  const isWon = n.type === 'won';

  return (
    <div
      onClick={() => !n.read && onRead(n.id)}
      className={`group transition-all duration-300 p-6 rounded-xl flex items-start gap-5 relative cursor-pointer ${
        !n.read
          ? 'bg-primary/5 hover:bg-primary/10'
          : 'bg-surface-container-lowest hover:bg-surface-container-low'
      }`}
    >
      {/* Icon */}
      <div className={`shrink-0 w-12 h-12 rounded-full ${bgColor} flex items-center justify-center`}>
        <span
          className={`material-symbols-outlined ${iconColor}`}
          style={isWon ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {icon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-on-surface">{n.title}</p>
          {!n.read && <span className="w-2 h-2 rounded-full bg-primary-container shrink-0" />}
        </div>
        <p className="text-on-surface-variant text-sm mb-2">
          {n.body}{' '}
          <a
            href={`/auctions/${n.auctionId}`}
            onClick={(e) => e.stopPropagation()}
            className="text-primary font-semibold hover:underline"
          >
            {n.auctionTitle}
          </a>
          {n.type === 'outbid' && '. Act fast to reclaim your lead.'}
          {n.type === 'won' && '. Check your email for details.'}
          {n.type === 'ending_soon' && ' is coming to a close.'}
          .
        </p>
        <span className="font-label text-xs text-outline font-medium">{n.timeAgo}</span>
      </div>

      {/* More button */}
      <button
        onClick={(e) => e.stopPropagation()}
        className="p-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-surface-container-high shrink-0"
        aria-label="More options"
      >
        <span className="material-symbols-outlined text-on-surface-variant">more_vert</span>
      </button>
    </div>
  );
}
