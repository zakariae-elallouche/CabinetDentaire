# Guide de Déploiement — HZ Dentaire

## Architecture cible

```
Frontend (React 19 + Vite)  ──►  Vercel
Backend (Laravel 12)        ──►  Vercel (PHP serverless)
Base de données             ──►  Supabase (PostgreSQL)
WebSocket / Real-time       ──►  Pusher
Stockage fichiers           ──►  Supabase Storage
```

---

## Phase 1 — Supabase (Base de données)

### 1.1 Créer le projet

1. Aller sur [https://supabase.com](https://supabase.com) et créer un compte
2. Créer un nouveau projet → choisir une région proche de vos utilisateurs
3. Noter les identifiants de connexion depuis **Project Settings > Database** :
   - `DB_HOST` (ex: `db.xxxxx.supabase.co`)
   - `DB_PORT` (5432)
   - `DB_DATABASE` (postgres)
   - `DB_USERNAME` (postgres)
   - `DB_PASSWORD`

### 1.2 Exécuter les migrations

```bash
cd backend
composer install
cp .env.example .env.production
# Éditer .env.production avec les identifiants Supabase
php artisan migrate --force
php artisan db:seed --force
```

> **Important** : Le dump SQL `database/cabinet_dentaire.sql` est au format MySQL et ne doit **pas** être utilisé avec Supabase. Utilisez uniquement les migrations Laravel.

### 1.3 Configurer Supabase Storage

1. Dans le dashboard Supabase, aller dans **Storage**
2. Créer un bucket nommé `uploads` avec politique publique (ou restreinte selon vos besoins)
3. Noter l'URL du bucket et la clé `anon` / `service_role` depuis **Project Settings > API**

---

## Phase 2 — Pusher (WebSocket)

### 2.1 Créer un compte Pusher

1. Aller sur [https://pusher.com](https://pusher.com) → **Channels**
2. Créer une app, choisir le cluster le plus proche
3. Noter les clés : `APP_ID`, `APP_KEY`, `APP_SECRET`, `CLUSTER`

### 2.2 Configurer le backend

Dans `backend/.env.production` :

```env
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=xxxxx
PUSHER_APP_KEY=xxxxx
PUSHER_APP_SECRET=xxxxx
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=eu
VITE_PUSHER_APP_KEY=xxxxx
VITE_PUSHER_HOST=
VITE_PUSHER_PORT=443
VITE_PUSHER_SCHEME=https
VITE_PUSHER_APP_CLUSTER=eu
```

Supprimer ou commenter les variables liées à Reverb :

```env
# BROADCAST_DRIVER=reverb
# REVERB_APP_ID=...
# REVERB_APP_KEY=...
# REVERB_APP_SECRET=...
# REVERB_HOST=...
# REVERB_PORT=...
# REVERB_SCHEME=http
# VITE_REVERB_APP_KEY=...
# VITE_REVERB_HOST=...
# VITE_REVERB_PORT=...
# VITE_REVERB_SCHEME=...
```

### 2.3 Vérifier le frontend

Dans `frontend/src/` — le projet utilise déjà `pusher-js`. Vérifier que la configuration Echo pointe vers Pusher et non vers Reverb.

---

## Phase 3 — Backend Laravel sur Vercel

### 3.1 Adapter le stockage des fichiers

Sur Vercel, le filesystem est éphémère — les uploads doivent aller vers un stockage externe.

**Option : Supabase Storage**

Installer le driver :

```bash
cd backend
composer require supabase/supabase-storage-php
```

Dans `backend/.env.production` :

```env
FILESYSTEM_DISK=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx
```

Créer `backend/config/filesystems.php` (ou modifier) pour ajouter le disque `supabase`.

### 3.2 Adapter les sessions et la queue

```env
# Vercel = stateless
SESSION_DRIVER=array
CACHE_STORE=array
QUEUE_CONNECTION=sync      # Pas de worker disponible
```

> **Attention** : `QUEUE_CONNECTION=sync` signifie que les emails et notifications seront envoyés de façon synchrone (possible ralentissement).

### 3.3 Créer l'entrypoint serverless

Créer `backend/api/index.php` :

```php
<?php

$app = require __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
)->send();

$kernel->terminate($request, $response);
```

### 3.4 Créer la config Vercel

Créer `backend/vercel.json` :

```json
{
  "functions": {
    "api/index.php": {
      "runtime": "@vercel/php@0.7.0",
      "memory": 256,
      "maxDuration": 30
    }
  },
  "routes": [
    { "src": "/storage/(.*)", "dest": "/storage/$1" },
    { "src": "/(.*)", "dest": "/api/index.php" }
  ],
  "cleanUrls": true
}
```

### 3.5 Fichier `.env.production` complet

```env
APP_NAME="HZ Dentaire"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://backend-hz-dentaire.vercel.app

LOG_CHANNEL=stderr
LOG_LEVEL=warning

DB_CONNECTION=pgsql
DB_HOST=db.xxxxx.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=xxxxx

BROADCAST_CONNECTION=pusher
PUSHER_APP_ID=xxxxx
PUSHER_APP_KEY=xxxxx
PUSHER_APP_SECRET=xxxxx
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME=https
PUSHER_APP_CLUSTER=eu

SESSION_DRIVER=array
CACHE_STORE=array
QUEUE_CONNECTION=sync

FILESYSTEM_DISK=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_KEY=xxxxx

SANCTUM_STATEFUL_DOMAINS=frontend-hz-dentaire.vercel.app
SESSION_DOMAIN=.vercel.app
```

### 3.6 Déployer sur Vercel

Via le dashboard Vercel :

1. **Add New Project** → connecter GitHub
2. Sélectionner le repo `Cabinet Dentaire`
3. **Root Directory** : `backend/`
4. **Framework Preset** : Other
5. **Build Command** : `composer install --no-dev --optimize-autoloader && php artisan config:cache && php artisan route:cache`
6. **Output Directory** : `public/`
7. **Environment Variables** : copier le contenu de `.env.production`

Via CLI (alternative) :

```bash
cd backend
vercel --prod
```

---

## Phase 4 — Frontend React sur Vercel

### 4.1 Modifier l'URL de l'API

Dans `frontend/src/api.js` :

```diff
const api = axios.create({
-  baseURL: 'http://localhost:8000/api',
+  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});
```

### 4.2 Créer `.env.production` dans `frontend/`

```env
VITE_API_URL=https://backend-hz-dentaire.vercel.app/api
VITE_PUSHER_APP_KEY=xxxxx
VITE_PUSHER_CLUSTER=eu
```

### 4.3 Configuration Echo (Pusher)

Vérifier que le frontend utilise Pusher. Exemple de configuration typique :

```js
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_CLUSTER,
  forceTLS: true,
});
```

### 4.4 Déployer sur Vercel

Via le dashboard :

1. **Add New Project** → connecter GitHub
2. Sélectionner le repo `Cabinet Dentaire`
3. **Root Directory** : `frontend/`
4. **Framework Preset** : **Vite**
5. **Build Command** : `npm run build`
6. **Output Directory** : `dist`
7. **Environment Variables** : ajouter `VITE_API_URL`, `VITE_PUSHER_APP_KEY`, `VITE_PUSHER_CLUSTER`

Créer `frontend/vercel.json` pour le SPA routing :

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Phase 5 — Configuration CORS

Dans `backend/config/cors.php` ou directement via middleware, autoriser le domaine du frontend :

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:5173')],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

Ajouter dans `.env.production` :

```env
FRONTEND_URL=https://frontend-hz-dentaire.vercel.app
SANCTUM_STATEFUL_DOMAINS=frontend-hz-dentaire.vercel.app
```

---

## Phase 6 — Tâches planifiées (Cron)

Les workers de background ne peuvent pas tourner sur Vercel. Solutions :

| Solution | Description |
|----------|-------------|
| **cron-job.org** (gratuit) | Appeler `https://backend/vercel.app/cron` toutes les X minutes |
| **GitHub Actions** | Workflow scheduled avec `curl` vers une route protégée |
| **Laravel Forge + VPS** | Si vous passez à un VPS plus tard |

Ajouter une route protégée pour le cron :

```php
// routes/api.php
Route::get('/cron', function () {
    Artisan::call('schedule:run');
    return response()->json(['status' => 'ok']);
})->middleware('throttle:6,1');
```

---

## Phase 7 — Vérification finale

### Checklist avant mise en production

- [ ] Base Supabase accessible depuis Vercel (whitelist IP si nécessaire)
- [ ] Migrations exécutées, seeders OK
- [ ] Pusher connecté : les events broadcast arrivent au frontend
- [ ] CORS configuré : frontend → backend sans erreur
- [ ] Upload fichiers fonctionnel vers Supabase Storage
- [ ] Authentification Sanctum fonctionnelle (login, logout, tokens)
- [ ] Routes API répondent correctement
- [ ] `APP_DEBUG=false`
- [ ] Domaine personnalisé configuré (optionnel)

### Tester les flux critiques

1. Inscription / Connexion déconnecté
2. Création d'un rendez-vous
3. Ajout d'une visite médicale
4. Génération d'ordonnance / facture PDF
5. Upload de fichier patient
6. Notifications en temps réel (Pusher)

---

## Risques connus et mitigations

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Cold start Laravel (1-3s) | Lenteur au 1er appel | Activer `config:cache`, `route:cache`, garder les providers minimes |
| Queue synchrone | Ralentissement si envoi d'email | Envisager un petit VPS pour queue worker, ou utiliser une API email type Mailgun |
| Limite temps Vercel (30s) | Export PDF volumineux peut timeout | Optimiser les exports, paginer les résultats |
| Stockage Supabase Storage | Dépendance au bucket | Mettre en place des backups réguliers du bucket |
| Upload fichiers lourds | Timeout requête | Limiter la taille des uploads côté client et serveur |

---

## Liens utiles

- [Dashboard Vercel](https://vercel.com)
- [Dashboard Supabase](https://supabase.com)
- [Dashboard Pusher](https://dashboard.pusher.com)
- [Doc Laravel Vercel (community)](https://github.com/vercel-community/php)
- [Doc Pusher Laravel](https://laravel.com/docs/broadcasting#pusher-channels)
