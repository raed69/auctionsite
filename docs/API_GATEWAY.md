# API Gateway — Frontend Reference

The **API Gateway (`http://localhost:3000`) is the single entry point** for the
frontend. The browser should never call the individual services (3001–3007)
directly. The gateway verifies JWTs, forwards the `Authorization` header
downstream, and (for protected routes) binds the caller identity to the token.

- **Auth:** send `Authorization: Bearer <jwt>`. Get the JWT from `POST /auth/login`
  or the Google OAuth flow.
- **CORS:** enabled. Set `FRONTEND_URL` (comma-separated) to lock origins in prod;
  unset in dev reflects the request origin.
- **Roles** shown below are enforced by the downstream service; the gateway only
  checks that the token is valid.

Legend: 🔓 public · 🔑 any authenticated user · 👤 buyer · 🏪 seller · 🛡️ admin · ⚙️ service-to-service (not on gateway)

---

## Auth  → user-service
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | 🔓 | `{ email, password, first_name, last_name }` → verification email |
| POST | `/auth/login` | 🔓 | → `{ accessToken, user }` |
| GET | `/auth/verify-email?token=` | 🔓 | confirm email from link |
| GET | `/auth/google` | 🔓 | 302 → Google consent |
| GET | `/auth/google/callback?code=` | 🔓 | OAuth callback → JWT |
| GET | `/auth/me` | 🔑 | current profile |

## Users  → user-service
| Method | Path | Access |
|---|---|---|
| GET | `/user/me` | 🔑 |
| PATCH | `/user/me` | 🔑 |
| PATCH | `/user/me/wallet` | 🔑 (verifies Phantom signature) |
| GET | `/user/me/balance` | 🔑 (TND) |
| GET | `/user/me/sol-balance` | 🔑 (on-chain) |
| POST | `/user/request-seller` | 👤 |
| GET | `/user/admin/all-users` | 🛡️ |
| GET | `/user/:id` | 🛡️ |
| PATCH | `/user/:id` | 🛡️ |
| DELETE | `/user/admin/users/:id` | 🛡️ |
| PATCH | `/user/admin/users/:id/ban` | 🛡️ |
| GET | `/user/admin/seller-requests` | 🛡️ |
| POST | `/user/admin/seller-requests/:id/approve` | 🛡️ |
| POST | `/user/admin/seller-requests/:id/reject` | 🛡️ |

> `/user/internal/*` (balance credit/deduct/refund, internal lookup) are ⚙️ only and are **not** exposed on the gateway.

## Auctions  → auction-service
Status lifecycle: `draft → scheduled → active → ended | awaiting → confirmed`
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auctions/realtime` | 🏪 | multipart (`images[]`), SOL, immediately active |
| POST | `/auctions/draft` | 🏪 | multipart, future-start TND/SOL |
| GET | `/auctions?category=&status=&currency=&minPrice=&maxPrice=` | 🔓 | filtered list |
| GET | `/auctions/admin/monitor` | 🛡️ | counts by status |
| GET | `/auctions/:id` | 🔓 | increments view_count |
| PATCH | `/auctions/:id` | 🏪/🛡️ | locked TND-after-first-bid / SOL-after-escrow |
| PATCH | `/auctions/:id/close` | 🏪/🛡️ | manual close |
| PATCH | `/auctions/:id/confirm-winner` | 🏪 | TND payout to seller; requires `awaiting` |
| DELETE | `/auctions/:id` | 🏪/🛡️ |
| DELETE | `/auctions` | 🛡️ |
| PATCH | `/auctions/:id/bid` | ⚙️ | called by bidding-service |

## Bids  → bidding-service
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/bids` | 🔑 | `bidderId` is taken from the JWT. TND settles now; SOL returns an unsigned tx |
| POST | `/bids/confirm` | 🔑 | relay wallet-signed SOL bid tx |
| GET | `/bids/auction/:auctionId` | 🔓 | bid history |

## Blockchain  → blockchain-service
All builders return unsigned txs to be signed by the user's wallet on the frontend.
| Method | Path | Access |
|---|---|---|
| POST | `/blockchain/createAuction` | 🔓 |
| POST | `/blockchain/placeBid` | 🔓 |
| POST | `/blockchain/sendTransaction` | 🔓 |
| POST | `/blockchain/closeAuction` | 🔓 |
| POST | `/blockchain/verify-signature` | 🔓 |
| GET | `/blockchain/auction/:auctionId` | 🔓 |
| GET | `/blockchain/escrow/:auctionId` | 🔓 |
| GET | `/blockchain/balance/:wallet` | 🔓 |

## Payments  → payment-service
| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/payments/initiate` | 🔓* | auction winner pays (Konnect) |
| POST | `/payments/webhook` | 🔓 | Konnect callback |
| GET | `/payments/status/:ref` | 🔓 |
| GET | `/payments/mock-pay/:ref` | 🔓 | dev only |
| POST | `/payments/deposit/initiate` | 🔑 | top up TND balance |
| POST | `/payments/deposit/webhook` | 🔓 | Konnect callback |
| GET | `/payments/deposit/status/:ref` | 🔑 |
| GET | `/payments/deposit/mock-pay/:ref` | 🔓 | dev only |
| POST | `/payments/cards` | 🔑 | save card (no PAN/CVV; token encrypted) |
| GET | `/payments/cards` | 🔑 |
| DELETE | `/payments/cards/:id` | 🔑 |
| POST | `/payments/withdraw/initiate` | 🏪 |
| GET | `/payments/withdraw/status/:ref` | 🔑 |
| GET | `/payments/withdraw/admin/all` | 🛡️ |
| PATCH | `/payments/withdraw/admin/complete/:ref` | 🛡️ |

> `*` `/payments/initiate` is currently unauthenticated at the gateway — see report. `/payments/refund` is ⚙️ only (not on gateway).

## Notifications  → notification-service
| Method | Path | Access |
|---|---|---|
| GET | `/notifications/user/:userId` | 🔓 ⚠️ should require JWT |
| PATCH | `/notifications/:id/read` | 🔓 ⚠️ |
| POST | `/notifications/auction-ended` | ⚙️ |
| POST | `/notifications/confirm-winner` | ⚙️ |

## Messaging  → messaging-service
| Method | Path | Access |
|---|---|---|
| POST | `/messaging` | 🔑 |
| GET | `/messaging/inbox` | 🔑 |
| GET | `/messaging/unread` | 🔑 |
| GET | `/messaging/conversation/:otherUserId?auctionId=` | 🔑 |
| PATCH | `/messaging/:messageId/read` | 🔑 |
| PATCH | `/messaging/conversation/:otherUserId/read` | 🔑 |
