# API Contract

REST API served by the Spring Boot backend. Companion to `DATA-MODEL.md` (entities) and `PAGES.md` (routes each endpoint feeds).

## Conventions

- Base path: `/api/v1`
- Format: JSON in, JSON out.
- Auth: `Authorization: Bearer <jwt>` on every authenticated route. Public routes are marked **Public**.
- Pagination: `?page=0&size=24&sort=createdAt,desc` on list endpoints. Responses shaped as:
  ```json
  { "content": [...], "page": 0, "size": 24, "totalElements": 248, "totalPages": 11 }
  ```
- Errors:
  ```json
  { "error": { "code": "CAR_NOT_FOUND", "message": "Car not found", "details": [] } }
  ```
- Money fields are plain decimals (e.g. `450.00`); currency formatting (₹) is a frontend concern.
- Phase tags (`Phase 1/2/3`) match `FUTURE-ROADMAP.md` — build in that order.

---

## Auth — Phase 1

| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup-request` | **Public.** `{name, username, email, password}` → 204; emails a 6-digit code, doesn't create the account yet |
| POST | `/auth/signup-confirm` | **Public.** `{email, code}` → user + tokens; creates the account and consumes the code (expires in 15 min) |
| POST | `/auth/login` | `{email, password}` → `{accessToken, refreshToken}` |
| POST | `/auth/refresh` | `{refreshToken}` → new `accessToken` |
| POST | `/auth/logout` | invalidates refresh token |
| GET | `/auth/me` | current authenticated user |
| POST | `/auth/forgot-password` | **Public.** `{email}` → always 204; emails a reset link if the account exists |
| POST | `/auth/reset-password` | **Public.** `{token, newPassword}` → 204; token from the emailed reset link, expires in 1h |
| POST | `/auth/verify-email` | **Public.** `{token}` → 204; token from the emailed verification link, expires in 24h |
| POST | `/auth/resend-verification` | resends the verification email to the current user |

## Users / Profile — Phase 1 (basic), Phase 2/3 (public + social)

| Method | Path | Description |
|---|---|---|
| GET | `/users/{username}` | **Public.** Public profile: name, avatar, bio, public collection count, favorite brands |
| PATCH | `/users/me` | update own profile |
| GET | `/users/me/stats` | dashboard header: total models, collection value, invested, gain/loss |

## Brands — Phase 1

| Method | Path | Description |
|---|---|---|
| GET | `/brands` | list all brands (for dropdowns/filters) |
| GET | `/brands/{id}` | brand detail |

## Cars / Collection — Phase 1

| Method | Path | Description |
|---|---|---|
| GET | `/cars` | list current user's cars — see filters below |
| POST | `/cars` | add a car |
| GET | `/cars/{id}` | car detail incl. photos + value history |
| PATCH | `/cars/{id}` | edit a car |
| DELETE | `/cars/{id}` | delete a car |
| POST | `/cars/{id}/duplicate` | duplicate an entry (e.g. bought a second unit) |
| POST | `/cars/{id}/photos` | multipart upload, returns created `CarPhoto` |
| PATCH | `/cars/{id}/photos/{photoId}` | reorder / set primary |
| DELETE | `/cars/{id}/photos/{photoId}` | remove a photo |

**`GET /cars` query params (filters):** `brandId`, `model`, `year`, `series`, `scale`, `color`, `condition`, `packagingCondition`, `minPurchasePrice`, `maxPurchasePrice`, `minValue`, `maxValue`, `collectionId`, `forSale` (bool), `q` (free-text search across model/variant/series), `sort`, `page`, `size`.

**POST `/cars` request body:**
```json
{
  "brandId": "uuid",
  "model": "Porsche 911 GT3 RS",
  "variant": "Car Culture",
  "series": "Car Culture",
  "year": 2025,
  "scale": "1:64",
  "color": "GT Silver",
  "condition": "MINT",
  "packagingCondition": "MOC",
  "hotWheelsSeriesType": "MAINLINE",
  "huntType": "NORMAL",
  "purchasePrice": 299.00,
  "purchaseDate": "2026-08-12",
  "estimatedValue": 450.00,
  "quantity": 1,
  "notes": ""
}
```

## Valuation / Analytics — Phase 1

| Method | Path | Description |
|---|---|---|
| GET | `/analytics/summary` | total models, collection value, total invested, gain/loss, growth % |
| GET | `/analytics/value-history?range=7D\|1M\|6M\|1Y\|ALL` | time series for the value chart |
| GET | `/analytics/most-valuable?limit=10` | top cars by `estimated_value` |
| GET | `/analytics/by-brand` | breakdown for donut chart |
| GET | `/analytics/by-scale` | breakdown |
| GET | `/analytics/by-year` | breakdown |
| GET | `/analytics/by-condition` | breakdown |

**`GET /analytics/summary` response:**
```json
{
  "totalModels": 248,
  "collectionValue": 84650.00,
  "totalInvested": 63200.00,
  "estimatedGain": 21450.00,
  "growthPercent": 33.9
}
```

## Wishlist — Phase 1

| Method | Path | Description |
|---|---|---|
| GET | `/wishlist` | list current user's wishlist, sorted by priority |
| POST | `/wishlist` | add an item |
| PATCH | `/wishlist/{id}` | edit priority/target price/notify flags |
| DELETE | `/wishlist/{id}` | remove |

## Collections / Showcase — Phase 2

| Method | Path | Description |
|---|---|---|
| GET | `/collections` | current user's collections (private + published) |
| POST | `/collections` | create |
| GET | `/collections/{id}` | detail incl. ordered cars |
| PATCH | `/collections/{id}` | edit name/description/cover/visibility settings |
| DELETE | `/collections/{id}` | delete |
| POST | `/collections/{id}/cars` | `{carIds: []}` add cars |
| DELETE | `/collections/{id}/cars/{carId}` | remove a car |
| PATCH | `/collections/{id}/cars/order` | `{carIds: [in order]}` drag-and-drop reorder |
| POST | `/collections/{id}/publish` | sets `is_public=true`, generates `share_slug` if absent |
| POST | `/collections/{id}/unpublish` | sets `is_public=false` |
| GET | `/public/showcase/{username}/{slug}` | **Public.** rendered showcase page data |
| GET | `/public/discover` | **Public.** trending models, new listings, popular showcases |

## Marketplace — Phase 2

| Method | Path | Description |
|---|---|---|
| GET | `/marketplace/listings` | **Public.** browse listings — filters: `brandId`, `scale`, `condition`, `minPrice`, `maxPrice`, `q`, `page`, `size` |
| POST | `/listings` | create a listing for one of the user's cars |
| GET | `/listings/{id}` | **Public.** listing detail |
| PATCH | `/listings/{id}` | edit price/description/status |
| DELETE | `/listings/{id}` | cancel a listing |
| POST | `/listings/{id}/photos` | multipart upload |
| POST | `/listings/{id}/offers` | buyer submits `{amount, message}` |
| GET | `/listings/{id}/offers` | seller views offers on their listing |
| PATCH | `/offers/{id}` | `{status: ACCEPTED\|DECLINED\|WITHDRAWN}` |
| POST | `/listings/{id}/mark-sold` | closes the listing |

## Pricing — Phase 1

Backs the "Look up market price" button in the Add/Edit Car form. Not persisted — a pure lookup.

| Method | Path | Description |
|---|---|---|
| GET | `/pricing/market-value` | `?brand=&model=&series=&scale=&year=` — asks Groq (LLM) for an estimated resale price in USD based on general collector-market knowledge, converted to INR |

**Response:**
```json
{
  "found": true,
  "estimatedValue": 480.50,
  "currency": "INR",
  "source": "AI_ESTIMATE",
  "message": null
}
```

When `found` is `false` (no Groq API key configured, or the model couldn't produce an estimate), `message` explains why and the frontend keeps whatever value the existing purchase-price/hunt-type multiplier logic already computed — this endpoint only overrides the estimate, it never blocks saving the car. Note this is an AI estimate from the model's general knowledge, not a live-listing lookup — treat it as a rough guide, not a precise market price.

## Trades — Phase 3

| Method | Path | Description |
|---|---|---|
| GET | `/trades` | trades involving the current user |
| POST | `/trades` | `{recipientId, offeredCarIds: [], requestedCarIds: []}` |
| GET | `/trades/{id}` | detail with fairness estimate (sum of `estimated_value_at_trade` on each side) |
| PATCH | `/trades/{id}` | `{status: ACCEPTED\|DECLINED\|CANCELLED}` |

## Notifications — Phase 3

| Method | Path | Description |
|---|---|---|
| GET | `/notifications` | current user's notifications |
| PATCH | `/notifications/{id}/read` | mark one read |
| PATCH | `/notifications/read-all` | mark all read |
