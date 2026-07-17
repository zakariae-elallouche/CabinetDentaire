# Optimization Plan — Cabinet Dentaire

> Prioritized recommendations to make the app fast, smooth, and production-ready.

---

## 🔴 High Priority

### 1. Code Splitting (React Lazy)

**Problem:** All 35+ page components are statically imported in `App.jsx` — the entire app bundle is loaded on first visit.

**Fix:** Replace static imports with `React.lazy()` + `Suspense`.

**`frontend/src/App.jsx`**
```jsx
import { lazy, Suspense } from 'react'

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
// … all other pages

// Wrap routes:
<Suspense fallback={<div>Loading…</div>}>
  <Routes>…</Routes>
</Suspense>
```

**Impact:** Cuts initial JS by ~60-70%. Only the page the user visits gets loaded.

---

### 2. API Pagination

**Problem:** Most list endpoints return **all records** via `->get()` or `Model::all()` — `/patients`, `/rendez-vous`, `/factures`, `/ordonnances`, `/notifications`, etc. Will crash or become unusable with 1000+ records.

**Affected endpoints:**

| Endpoint | File | Current |
|---|---|---|
| `GET /patients` | `PatientController@index` | `Patient::all()` |
| `GET /rendez-vous` | `RendezVousController@index` | `->get()` |
| `GET /factures` | `FactureController@index` | `->get()` |
| `GET /medicaments` | `MedicamentController@index` | `Medicament::all()` |
| `GET /operations` | `OperationController@index` | `CatalogueOperation::all()` |
| `GET /notifications` | `NotificationController@index` | `->get()` |
| `GET /billing/invoices` | `BillingController@invoices` | `->get()` |
| `GET /patient/{id}/visites` | `VisiteController@patientVisites` | `->get()` |
| `GET /patient/{id}/ordonnances` | `OrdonnanceController@patientOrdonnances` | `->get()` |
| `GET /patient/{id}/factures` | `FactureController@patientFactures` | `->get()` |
| `GET /invitations` | `InvitationController@index` | `->get()` |

**Fix:** Replace `->get()` / `::all()` with `->paginate(25)` on every list endpoint. Update frontend to accept `{ data, meta: { current_page, last_page, total } }`.

```php
// Backend
$patients = Patient::where('tenant_id', tenant_id())->paginate(25);
```

```jsx
// Frontend
const [page, setPage] = useState(1)
const { data, loading } = useQuery(['patients', page], () =>
  api.get(`/patients?page=${page}`)
)
```

---

### 3. React Query (TanStack Query)

**Problem:** Every page uses raw `useState`/`useEffect` + Axios. No caching, no deduplication, no background refetch.

**Fix:** Install `@tanstack/react-query` and replace all data fetching.

```bash
npm install @tanstack/react-query
```

```jsx
// main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient()
// Wrap app
```

```jsx
// Any component
import { useQuery } from '@tanstack/react-query'
const { data, isLoading, error } = useQuery({
  queryKey: ['rendez-vous', { page, filter }],
  queryFn: () => api.get('/rendez-vous', { params: { page, filter } }).then(r => r.data),
  staleTime: 30_000, // 30s before refetch
})
```

**Benefits:** Automatic caching, request deduplication, background refetch, loading/error states, pagination support, no more manual `useEffect` boilerplate.

---

### 4. Production Environment Config

**Problem:** Backend `.env` still has `APP_ENV=local` and `APP_DEBUG=true`.

**Fix:** Update `.env` on production:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://cabinetdentaire.onrender.com
FRONTEND_URL=https://cabinetdentaire.vercel.app  (or wherever frontend is deployed)
```

Also run on deploy:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

---

## 🟡 Medium Priority

### 5. Backend Query Caching

**Problem:** Dashboard runs **9 separate count queries** on every page load. No endpoint uses caching.

**Fix:** Cache expensive queries with `Cache::remember()`. Requires switching to a real cache store first (see #6).

```php
use Illuminate\Support\Facades\Cache;

$totalPatients = Cache::remember('tenant.' . tenant_id() . '.patients.count', 600, function () {
    return Patient::where('tenant_id', tenant_id())->count();
});
```

**Candidates for caching:**

| Endpoint | TTL | Why |
|---|---|---|
| `GET /dashboard` | 5 min | Aggregated counts don't need real-time |
| `GET /catalogue-operations` | 60 min | Rarely changes |
| `GET /medicaments` | 60 min | Rarely changes |
| `GET /rendez-vous/available-slots` | 30s | Expensive slot generation |
| `GET /superadmin/tenants` | 10 min | Admin-only, low frequency |

---

### 6. Redis for Cache & Queue

**Problem:** `CACHE_STORE=database` and `QUEUE_CONNECTION=database` — using PostgreSQL as a cache/queue is slow and adds DB load.

**Fix:** Provision a free Redis instance (Render Redis, Upstash, or Redis Cloud free tier) and switch:

```env
CACHE_STORE=redis
QUEUE_CONNECTION=redis
REDIS_HOST=<your-redis-host>
REDIS_PORT=6379
REDIS_PASSWORD=<your-redis-password>
```

If Redis is not possible, at least switch to `CACHE_STORE=file` (much faster than database).

---

### 7. Vite Bundle Chunking

**Problem:** Single JS bundle with no vendor splitting.

**`frontend/vite.config.js`**
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          pdf: ['jspdf'],
          notifications: ['react-toastify'],
        },
      },
    },
  },
})
```

**Impact:** Vendor libs cached separately, smaller incremental updates.

---

### 8. Fix N+1 in InvitationController

**Problem:** Loop queries `Dentiste::where('utilisateur_id', $u->id)` and `Secretaire::where('utilisateur_id', $u->id)` per user.

**Fix:** Eager load profiles with a single query:

```php
$users = Utilisateur::where('tenant_id', tenant_id())
    ->whereIn('role', ['dentiste', 'secretaire'])
    ->with(['dentiste', 'secretaire'])
    ->get();
```

---

### 9. API URL as Environment Variable

**Problem:** `baseURL: 'https://cabinetdentaire.onrender.com/api'` is hardcoded in `frontend/src/api.js`.

**Fix:** Use Vite's env variables:

```
// frontend/.env.production
VITE_API_URL=https://cabinetdentaire.onrender.com/api
```

```js
// frontend/src/api.js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' }
})
```

---

## 🟢 Nice to Have

### 10. Image Optimization

- Convert PNGs (hero, logos) to **WebP** format (~30% smaller)
- Add `loading="lazy"` to images below the fold
- Consider a CDN for static assets (Cloudinary, imgix)

### 11. Memoization

- Wrap heavy component trees with `React.memo`
- Use `useMemo` for computed data (e.g., chart stats, filtered lists)
- Use `useCallback` for event handlers passed to child components

### 12. List Virtualization

For pages with potentially hundreds of rows (patients list, appointments list, invoices):

```bash
npm install react-window
```

```jsx
import { FixedSizeList } from 'react-window'

<FixedSizeList height={600} itemCount={patients.length} itemSize={60}>
  {({ index, style }) => <div style={style}>{patients[index].nom}</div>}
</FixedSizeList>
```

### 13. Remove Automatic `$with` on Models

`protected $with = ['utilisateur']` on `Patient`, `Dentiste`, `Secretaire` models means **every query** loads the user relationship — even when not needed.

Remove the `$with` property and explicitly eager-load `->with('utilisateur')` only in the controllers/views that need it.

### 14. Skeleton / Shimmer Loading

Replace spinner loaders with skeleton placeholders that match the page layout. Libraries:

- `react-loading-skeleton`
- Custom CSS shimmer

Perceived performance improves dramatically even if actual load time stays the same.

### 15. Bundle Analyzer

See exactly what's in your production bundle:

```bash
npm install -D rollup-plugin-visualizer
```

```js
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'
plugins: [react(), visualizer({ open: true })]
```

Produces an interactive treemap of your bundle — guides further cuts.

---

## Deployment Checklist

On every deployment, run:

```bash
# Backend
php artisan down --render="errors::503"
git pull
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
php artisan storage:link
php artisan queue:restart
php artisan up

# Frontend
npm ci
npm run build
# Deploy the `dist/` folder to CDN or your static host
```

---

## Performance Budget Targets

| Metric | Target |
|---|---|
| First Contentful Paint (FCP) | < 1.5s |
| Largest Contentful Paint (LCP) | < 2.0s |
| Time to Interactive (TTI) | < 3.0s |
| Total Bundle Size (prod) | < 300 KB (gzipped) |
| API Response Time (p95) | < 500ms |
| Lighthouse Performance Score | > 85 |
