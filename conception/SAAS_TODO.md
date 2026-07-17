# SaaS Transformation — Dental Clinic Management Platform

> Single-tenant academic app → Multi-tenant B2B SaaS for dental clinics (Morocco)
> Stack: Laravel 12 + React 19 + MySQL

---

## PHASE 0 — Préparation & Architecture ✅

> Décisions validées le 2026-06-21 — Voir `conception/ADR-001-multi-tenancy-strategy.md` pour le détail
> Fichiers créés : Role enum, Tenant model, BelongsToTenant trait, TenantMiddleware, SuperAdminMiddleware, CheckPlanLimits, helpers.php, migration tenants

### 0.1 Décisions d'architecture (validées)

- [x] **Stratégie multi-tenancy** : **Option A — Column-based** (`tenant_id` sur chaque table)
  - Justification : simplicité, coût infra minimal, migration progressive, < 100 clients en année 1
  - Migration possible vers Option B après 100+ clients
  - Voir ADR-001

- [x] **Stratégie de domaine** : **Subdomain** (`clinique-xyz.dentapp.ma`)
  - Justification : identité clinique forte, portail patient public, isolation cookie/session, SEO
  - Nécessite wildcard SSL `*.dentapp.ma`
  - Voir ADR-002

- [x] **Modèle de plans** (pricing validé) :
  ```
  STARTER  — 1 dentiste, 200 patients max          → 299 MAD/mois
  PRO      — 3 dentistes, patients illimités        → 599 MAD/mois
  CLINIC   — Dentistes illimités, multi-secrétaire  → 999 MAD/mois
  ```
  Voir ADR-004

- [x] **Période d'essai** : 30 jours gratuits sans carte bancaire

- [x] **Stack technique** : **Garder Laravel 12 + React 19** (NE PAS switcher vers Node/Express)
  - Raison : bottleneck = DB, pas PHP — l'écosystème SaaS Laravel est mature
  - Voir ADR-003
  - **Mise à jour** : Laravel 11 → 12 (composer.json)
  - **Optimisations à planifier** (post-MVP) :
    - Redis → cache + sessions + queues
    - Laravel Octane (Swoole) → PHP persistant, 10x throughput
    - Eager loading `with()` → éliminer les N+1 queries
    - Index DB sur `tenant_id` + toutes les FK

- [x] **Nouveaux rôles** : `superadmin` (bypass tenant scope) + `admin_clinique` (gère sa clinique)
  - Créer un BackedEnum `App\Enums\Role` pour centraliser
  - Middleware `SuperAdminMiddleware` + `CheckPlanLimits`
  - Voir ADR-005

---

## PHASE 1 — Couche Multi-Tenancy (Backend) ✅

> Réalisé le 2026-06-21

### 1.1 Nouvelle table `tenants`

- [x] Créer migration `tenants` (via Phase 0) :
  - `2026_06_21_000001_create_tenants_table.php`
- [x] Créer model `Tenant` avec relations → `app/Models/Tenant.php`
  - Relations : utilisateurs, patients, secretaires, dentistes, rendezVous, visites, factures, paiements, ordonnances, notifications, audits
- [x] Créer `TenantMiddleware` → charge tenant depuis `X-Tenant-Id` header ou `tenant_id` du token
  - SuperAdmin bypass (ne bind pas de tenant)
  - Middleware appliqué sur toutes les routes `auth:sanctum`
- [x] Migration `tenant_id` sur 15 tables existantes :
  - `2026_06_21_000002_add_tenant_id_to_all_tables.php`
  - Colonne `tenant_id` nullable, FK → `tenants(id)` CASCADE ON DELETE
  - Rôle : ENUM → VARCHAR(50) pour accepter `superadmin` + `admin_clinique`

### 1.2 Scoping automatique

- [x] Créer trait `BelongsToTenant` → `app/Models/Traits/BelongsToTenant.php`
  - Global scope `tenant` filtre toutes les queries par `tenant_id` du tenant actif
  - Helper `tenant_id()` / `tenant()` via `app/helpers.php`
- [x] Appliquer trait sur tous les 14 modèles (Patient, Dentiste, Secretaire, RendezVous, Visite, OperationDentaire, Facture, Paiement, Ordonnance, OrdonnanceMedicament, Medicament, CatalogueOperation, Notification, Audit)
  - `tenant_id` ajouté dans `$fillable` de chaque modèle
- [x] Mettre à jour tous les controllers :
  - AuthController : `tenant_id()` dans create, superadmin support dans profile
  - AuditService : `session('user')` → `auth()->id()` + `tenant_id()`
  - NotificationService : `tenant_id()` dans chaque create + Secretaire scope automatique
  - Tous les autres controllers : inchangés (le scope global Eloquent fait le filtrage)
- [x] Tests : `tests/Feature/TenantIsolationTest.php`
  - 8 tests couvrant : scope patients, medicaments, catalogue, RDV, factures, findOrFail, switch tenant, superadmin bypass, API endpoint

### 1.3 Nouveau rôle `superadmin`

- [x] Ajouter `superadmin` dans le rôle (ENUM → VARCHAR, validé via `App\Enums\Role`)
- [x] Créer middleware `SuperAdminMiddleware` → `app/Http/Middleware/SuperAdminMiddleware.php`
  - Bypass du tenant scope dans TenantMiddleware (si superadmin, pas de binding tenant)
- [x] SuperAdmin voit tous les tenants, aucune donnée clinique directement

---

## PHASE 2 — Authentification & Onboarding ✅

> Réalisé le 2026-06-21

### 2.1 Inscription SaaS (Nouvelle clinique)

- [x] **Page d'inscription clinique** (public, sans auth) : `RegisterClinic.jsx`
  - Nom de la clinique, sous-domaine (validation unicité en temps réel), email + mot de passe, téléphone
  - Ville (dropdown 15 villes marocaines), plan (3 cartes avec prix)
  - Bouton → "Démarrer 30 jours gratuits"
  - Route : `/register-clinic` + lien depuis `/login`

- [x] Backend : `ClinicRegistrationController`
  - `POST /api/register-clinic` : crée Tenant (statut: trial, trial_ends_at: +30j) + Utilisateur (role: admin_clinique)
  - `GET /api/check-slug/{slug}` : vérifie disponibilité sous-domaine en temps réel (debounce 400ms)

### 2.2 Nouveau rôle `admin_clinique`

- [x] Ajouter `admin_clinique` dans le rôle (Role enum + VARCHAR migration Phase 1)
- [x] Permissions : `admin_clinique` hérite de toutes les routes secrétaire (middleware `role:secretaire|admin_clinique`)
- [x] Navigation spécifique dans Layout : Dashboard admin + Équipe + RDV + Paiements + Médicaments + Opérations + Patients
- [x] Dashboard admin : `AdminDashboard.jsx` avec stats financières et actions rapides

### 2.3 Invitation d'équipe

- [x] Backend : `InvitationController`
  - `POST /api/invitations` (admin_clinique) → crée invitation avec token signé, expire 7 jours
  - `GET /api/invitations/{token}` (public) → retourne les infos de l'invitation
  - `POST /api/invitations/{token}/accept` (public) → crée Utilisateur + profil (Dentiste/Secretaire)
  - `DELETE /api/invitations/{id}` (admin_clinique) → annule une invitation
  - `GET /api/invitations` (admin_clinique) → liste les invitations du tenant
- [x] Model `Invitation` avec migration `invitations` table
- [x] Frontend : `ManageTeam.jsx` (admin/equipe) — formulaire d'invitation + tableau des invitations avec statut
- [x] Frontend : `AcceptInvitation.jsx` — page publique d'acceptation avec création de compte

### 2.4 Contexte tenant dans tokens Sanctum

- [x] Token créé avec ability `tenant:{id}` dans login, register, register-clinic, accept-invitation
- [x] `TenantMiddleware` résout le tenant depuis : `X-Tenant-Id` header → user.tenant_id → token ability `tenant:*`
- [x] Résolution complète : header OU user OU token ability

---

## PHASE 3 — Super Admin Dashboard ✅

> Réalisé le 2026-06-21

### 3.1 Interface super admin

- [x] Route séparée : `/superadmin/*` (routes protégées `superadmin`)
- [x] Dashboard métriques (`GET /api/superadmin/stats`) :
  - Nombre de tenants total / actifs / en trial / suspendus
  - MRR (chiffre d'affaires du mois sur factures payées)
  - Nouveaux signups (30 derniers jours)
  - Trials expirant dans 7 jours (liste cliquable)
  - Churn du mois

- [x] Liste tenants avec filtres (plan, statut, recherche) + pagination
- [x] Vue détail tenant : infos, stats d'utilisation, équipe (utilisateurs)
- [x] Actions admin : suspendre / activer, changer plan (starter/pro/clinic), prolonger trial (+7/+14/+30j)

### 3.2 Gestion plans & pricing

- [x] Table `plans` : slug, nom, prix_mensuel, nb_dentistes_max, nb_patients_max, features (JSON)
- [x] Interface CRUD plans : créer, modifier, supprimer
- [x] Middleware `CheckPlanLimits` (vérifie limites dentistes/patients selon plan du tenant)

---

## PHASE 4 — Billing & Paiements ✅

> Réalisé le 2026-06-21

### 4.1 Abonnements

- [x] Table `subscriptions` : `2026_06_21_000005_create_subscriptions_table.php`
  - `id, tenant_id, statut, plan, montant, devise (MAD), methode_paiement, debut_periode, fin_periode, auto_renouvellement`
- [x] Table `saas_invoices` (distincte de `factures` cliniques) : `2026_06_21_000006_create_saas_invoices_table.php`
  - `id, tenant_id, numero, subscription_id, montant, statut (pending/paid/failed), date_echeance, date_paiement, notes`
- [x] Model `Subscription` avec relation `invoices()`
- [x] Model `SaaSInvoice` avec relations `tenant()` et `subscription()`

### 4.2 Passerelles de paiement (Maroc)

- [x] **Option manuelle MVP** : virement bancaire + confirmation super admin
  - `POST /api/billing/subscribe` → crée abonnement + facture en attente (admin_clinique)
  - `POST /api/superadmin/invoices/{id}/confirm` → confirme le paiement (superadmin)
  - `GET /api/billing/status` → statut abonnement actuel
  - `GET /api/billing/invoices` → historique des factures SaaS
  - `POST /api/billing/cancel` → désactive renouvellement auto
- [ ] **Option CMI** : à implémenter (webhook)
- [ ] **Stripe/PayPal** : à implémenter (webhook)

### 4.3 Logique trial → paid

- [x] Console command `subscriptions:check-trials` :
  - Détecte les trials expirés → passe en `suspended`
  - Compte les trials expirant dans 7 jours
  - Planifié quotidiennement via `routes/console.php`
- [x] Middleware `CheckSubscription` :
  - Bloque les requêtes si `tenant.statut === 'suspended'` avec code `SUBSCRIPTION_EXPIRED`
  - Appliqué à toutes les routes protégées via `auth:sanctum` + `tenant` + `subscription`
  - Réponse 402 avec message explicite
- [x] Frontend `BillingPage.jsx` :
  - Vue statut abonnement + historique factures
  - Sélecteur de plan (Starter/Pro/Clinic)
  - Bouton souscription (virement bancaire)
  - Infos de virement bancaire
  - Route : `/admin/facturation`

---

---

## PHASE 6 — Features SaaS Additionnelles

### 6.1 Paramètres clinique (admin_clinique)

- [x] Page settings clinique :
  - Nom, adresse, téléphone, email affiché aux patients
  - Logo (upload)
  - Couleur primaire (personnalisation UI)
  - Horaires d'ouverture (définit créneaux RDV disponibles)
  - Frais de visite de base
  - Gestion catalogue opérations

<!-- ### 6.2 Multi-dentiste par clinique

- [ ] Actuellement : 1 dentiste fixe → étendre à N dentistes
- [ ] Patient choisit le dentiste lors de la prise de RDV
- [ ] Agenda par dentiste (vue secrétaire)
- [ ] Filtrage RDV par dentiste -->

<!-- ### 6.3 SMS de rappel (différenciateur fort)

- [ ] Intégration Twilio ou SMS Maroc local (OrangeSMS, Maqsam)
- [ ] SMS automatique J-1 avant RDV : "Rappel : RDV demain à 10h00 — Cabinet Dr. X"
- [ ] SMS confirmation après confirmation secrétaire
- [ ] Compteur SMS par plan (ex: 100 SMS/mois STARTER, illimité PRO) -->

### 6.4 CNSS/CNOPS (différenciateur marché marocain)

- [ ] Module feuilles de soins CNSS automatisées (templates PDF)
- [ ] Module feuilles CNOPS
- [ ] C'est le différenciateur #1 de Dentisto — à implémenter en priorité pour se démarquer

### 6.5 Portail patient public par clinique

- [x] URL publique : `clinique-xyz.dentapp.ma/book`
- [x] Patient peut prendre RDV sans compte (saisie email + téléphone)
- [x] Ou avec compte (inscription légère)
- [x] Lien à partager par la clinique sur réseaux sociaux / WhatsApp

### 6.6 Notifications avancées

- [ ] Email templates par tenant (logo clinique, couleur primaire)
- [ ] Notifications in-app pour admin : "Nouveau patient inscrit", "Paiement reçu"
- [ ] Digest hebdomadaire admin : stats de la semaine (patients, RDV, revenus)

password forget (need verified domaine), 
pdf of system

---

## PHASE 7 — Infrastructure & DevOps

### 7.1 Hébergement

- [ ] **Backend** : VPS Linux (DigitalOcean / Hetzner / OVH) — PHP 8.2 + Nginx
- [ ] **Frontend** : Vercel ou Netlify (déploiement React automatique)
- [ ] **Base de données** : MySQL managé ou self-hosted + backups quotidiens
- [ ] **Stockage fichiers** : AWS S3 ou Cloudflare R2 (PDFs, logos)
- [ ] **Email** : Mailgun ou Amazon SES (emails transactionnels)

### 7.2 SSL & Domaines

- [ ] Wildcard SSL `*.dentapp.ma` → Let's Encrypt ou Cloudflare
- [ ] Configuration Nginx : mapping subdomain → `tenant_id` via table tenants
- [ ] DNS : Cloudflare (proxy + protection DDoS)

### 7.3 Monitoring

- [ ] Sentry → erreurs PHP + JavaScript
- [ ] Uptime monitoring (UptimeRobot gratuit)
- [ ] Logs Laravel → Papertrail ou fichiers rotatifs
- [ ] Alertes email si app down > 5 min

### 7.4 Sécurité

- [ ] HTTPS forcé partout
- [ ] Rate limiting sur toutes les routes API (`throttle`)
- [ ] Isolation tenant : tests automatisés de cross-tenant leakage
- [ ] Chiffrement données sensibles au repos (dossiers patients)
- [ ] Backups DB quotidiens + test de restauration mensuel
- [ ] Conformité Loi 09-08 (protection données personnelles, Maroc)

---

## PHASE 8 — Go-to-Market

### 8.1 Beta privée

- [ ] Recruter 5-10 dentistes bêta (réseau personnel, Facebook groupes dentistes Maroc)
- [ ] Accès gratuit 3 mois en échange de feedback structuré
- [ ] Interview utilisateur hebdomadaire (30 min) → itérer sur le produit

### 8.2 Acquisition

- [ ] **Facebook/Instagram** : contenu éducatif pour dentistes (gestion cabinet, conseils)
- [ ] **WhatsApp Business** : canal de support + démo
- [ ] **Bouche-à-oreille** : programme de parrainage (1 mois offert par clinique référée)
- [ ] **SEO** : blog "gestion cabinet dentaire Maroc", "CNSS dentiste", etc.
- [ ] **Partenariat** : associations dentistes régionales (Casablanca, Rabat, Marrakech)

### 8.3 Support

- [ ] WhatsApp Business dédié (support L-S 9h-18h)
- [ ] Chat in-app (Crisp gratuit ou Tawk.to)
- [ ] Base de connaissances (vidéos tutoriels YouTube)
- [ ] Onboarding call 30 min pour nouveaux clients PRO/CLINIC

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

```
Phase 0  →  Décisions architecture            (1 semaine) ✅ FAIT
Phase 1  →  Multi-tenancy backend             (2 semaines) ✅ FAIT
Phase 2  →  Auth & Onboarding                 (1 semaine) ✅ FAIT
Phase 3  →  Super admin dashboard             (1 semaine) ✅ FAIT
Phase 4  →  Billing (virement manuel d'abord) (1 semaine) ✅ FAIT
Phase 5  →  Landing page + pages légales      (1 semaine) ✅ FAIT
Phase 6.1→  Settings clinique                 (3 jours)
Phase 6.2→  Multi-dentiste                    (3 jours)
Phase 7  →  Infrastructure + déploiement      (3 jours)
Phase 6.3→  SMS rappels                       (1 semaine)
Phase 6.4→  CNSS/CNOPS                        (2 semaines)
Phase 8  →  Beta + Go-to-market               (ongoing)
```

**Total MVP SaaS estimé : 8-12 semaines (1 développeur)**

---

## CE QUI NE CHANGE PAS (réutilisé tel quel)

- Toute la logique métier existante (RDV, visites, ordonnances, factures)
- Les modèles Laravel (ajout `tenant_id` uniquement)
- Le frontend React (ajout context tenant)
- L'authentification Sanctum (étendue)
- Les PDFs ordonnances/factures

---

## RISQUES PRINCIPAUX

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Cross-tenant data leak | Critique | Tests automatisés, scoping global strict |
| Paierelle paiement Maroc complexe | Haut | Commencer virement manuel |
| Marché CNSS/CNOPS réglementé | Haut | Valider avec dentiste partenaire |
| Concurrence Dentisto déjà établi | Moyen | Différenciation par UX + prix + support |
| Connexion internet variable (villes secondaires) | Moyen | PWA + cache offline (post-MVP) |

---

*Document créé : 2026-05-19*
*Basé sur : analyse compétitive Dentisto.ma + stack existant Laravel+React*
