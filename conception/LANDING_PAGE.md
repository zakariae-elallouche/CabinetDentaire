# Landing Page — DentASpace

> Page d'accueil marketing B2B pour la conversion des cliniques dentaires
> Cible : Chirurgiens-dentistes, gérants de clinique, décisionnaires
> Ton : Professionnel, rassurant, moderne — "On vous simplifie la gestion"
> Langue : Français (marché marocain)

---

## 1. OBJECTIFS DE LA LANDING PAGE

| Objectif | Mesure |
|----------|--------|
| Présenter la solution SaaS en < 5 secondes | Taux de bounce < 40% |
| Capturer un lead (email ou démo) | Taux de conversion > 5% |
| Faire comprendre la proposition de valeur | Temps moyen > 60s sur page |
| Inciter à l'essai gratuit 30 jours | Clic "Essai gratuit" > 15% des visiteurs |
| Rassurer sur la sécurité et la conformité | Scroll depth > 70% |

**Cible décisionnaire :**
- Le dentiste lui-même (solo, 70% du marché)
- Le gérant de clinique (multi-praticien, 30%)
- Cycle de vente : 1 à 4 semaines (démo → essai → conversion)

---

## 2. STRUCTURE DE LA PAGE (SECTIONS)

```
┌─────────────────────────────────────────────┐
│  NAVBAR (Logo + CTA + Menu)                 │
├─────────────────────────────────────────────┤
│  HERO — "La gestion de votre cabinet,       │
│          simplifiée"                        │
├─────────────────────────────────────────────┤
│  SOCIAL PROOF — Chiffres clés + confiance   │
├─────────────────────────────────────────────┤
│  PROBLÈMES → SOLUTIONS — "Avant/Après"      │
├─────────────────────────────────────────────┤
│  FONCTIONNALITÉS — 4 à 6 cartes             │
├─────────────────────────────────────────────┤
│  DÉMO / VIDÉO — "Voir la solution en action"│
├─────────────────────────────────────────────┤
│  TARIFS — 3 plans + Comparaison             │
├─────────────────────────────────────────────┤
│  FAQ — Objections courantes                 │
├─────────────────────────────────────────────┤
│  CTA FINAL — "Prêt à transformer votre      │
│               cabinet ?"                    │
├─────────────────────────────────────────────┤
│  FOOTER — Légal + Contact + Réseaux         │
└─────────────────────────────────────────────┘
```

---

## 3. CONTENU DÉTAILLÉ PAR SECTION

### 3.1 NAVBAR

```
[Logo DentASpace]    Fonctionnalités · Tarifs · FAQ · Blog
                     [Se connecter]  [Essai gratuit →]
```

| Champ | Contenu |
|-------|---------|
| Logo | `DentASpace` (texte ou SVG, couleur #191919 + accent #57c8cb) |
| Lien 1 | `/features` → scroll vers Fonctionnalités |
| Lien 2 | `/pricing` → scroll vers Tarifs |
| Lien 3 | `/faq` → scroll vers FAQ |
| Lien 4 | `/blog` → lien vers blog (optionnel) |
| Bouton gauche | "Se connecter" → `/login` |
| Bouton droit | "Essai gratuit" → `/register-clinic` (accent #57c8cb) |

---

### 3.2 HERO

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  La gestion de votre cabinet dentaire,                  │
│  simplifiée                                             │
│                                                         │
│  Prise de rendez-vous, dossiers patients, facturation,  │
│  ordonnances — tout en un. Sans papier, sans stress.    │
│                                                         │
│  [Commencer l'essai gratuit ]  [Voir la démo ]          │
│                                                         │
│  - 30 jours gratuits                                    |
|  - Sans carte bancaire                                  │
│  - Configuration en 5 minutes                           |
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Illustration / Mockup              │    │
│  │           (Dashboard app screenshot)            │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

| Champ | Contenu |
|-------|---------|
| Titre H1 | `La gestion de votre cabinet dentaire, simplifiée.` |
| Sous-titre | Prise de rendez-vous, dossiers patients, facturation, ordonnances — tout en un. Sans papier, sans stress. |
| CTA primaire | `Commencer l'essai gratuit` → `/register-clinic` |
| CTA secondaire | `Voir la démo` → modal vidéo ou scroll démo |
| Badges confiance | `30 jours gratuits` `Sans carte bancaire` `Configuration en 5 min` |
| Visuel | Capture d'écran du dashboard admin clinique (avec données fictives mais réalistes) |
| Couleur fond | `#f0fdfa` (surface) ou gradient subtil #57c8cb → #0d9488 |

---

### 3.3 SOCIAL PROOF — Chiffres clés

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [Chiffre]      [Chiffre]       [Chiffre]      [Chiffre]       │
│  Heures/jour     Patients        Temps           Taux          │
│  économisées     gérés           d'installation   satisfaction │
│                                                                │
│  +3h/jour        Illimité        5 minutes       98%           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

| Métrique | Valeur | Signification |
|----------|--------|--------------|
| Heures économisées | `+3h/jour` | Automatisation paperasse CNSS/administratif |
| Patients gérés | `Illimité` | Pas de limite selon plan |
| Configuration | `5 minutes` | Prêt à l'emploi, onboarding rapide |
| Satisfaction | `98%` | Taux de satisfaction cliniques (donnée à avoir) |

**À valider** : ces chiffres sont des objectifs marketing. Les vrais chiffres viendront après les premiers clients bêta.

---

### 3.4 PROBLÈMES → SOLUTIONS (Avant/Après)

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│  Avant DentASpace             Après DentASpace            │
│                                                           │
│  📋 Agenda papier            📱 Agenda numérique         │
│  +30 min/jour                ✔ 0 conflit de RDV          │
│                                                           │
│  📁 Dossiers éparpillés      💻 Tout au même endroit     │
│  Perte de temps              ✔ Accès en 1 clic           │
│                                                           │
│  🧾 Factures manuelles       🤖 Automatisation totale    │
│  Erreurs de calcul           ✔ Facture générée à la       │
│                                fin de la visite           │
│                                                           │
│  📞 Relance patients         📲 SMS/Email automatique     │
│  20% absentéisme             ✔ -40% d'absentéisme         │
│                                                           │
│  📄 CNSS/CNOPS manuel        ⚡ Feuilles automatisées     │
│  3h de paperasse             ✔ 10 minutes top chrono     │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

Style : Grille 2 colonnes, icônes avant/après, données chiffrées.

---

### 3.5 FONCTIONNALITÉS (4 à 6 cartes)

```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 📅 Prise de  │  │ 👥 Dossiers  │  │ 💳 Facturation│
│   RDV en ligne│  │   patients   │  │   & Paiements │
│              │  │              │  │              │
│ Agenda       │  │ Fiche        │  │ Génération   │
│ interactif,  │  │ numérique,  │  │ automatique, │
│ confirmation │  │ historique   │  │ suivi des    │
│ automatique  │  │ médical      │  │ impayés      │
└──────────────┘  └──────────────┘  └──────────────┘

┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ 📋 Ordonnances│  │ 📊 Tableau   │  │ 🔒 Sécurité  │
│   & Prescrip. │  │   de bord    │  │   & Conformité│
│              │  │              │  │              │
│ 4000+        │  │ Statistiques │  │ Conformité   │
│ médicaments, │  │ financières, │  │ Loi 09-08,   │
│ PDF imprimable│  │ MRR, chiffre │  │ hébergement  │
│              │  │ d'affaires   │  │ sécurisé     │
└──────────────┘  └──────────────┘  └──────────────┘
```

Champs par carte :

| Champ | Contenu |
|-------|---------|
| Icône | Emoji ou illustration simple |
| Titre | Court (2-4 mots) |
| Sous-titre | 1 phrase de valeur |
| Liste | 3 puces maximum (fonctionnalités clés) |
| Lien | `En savoir plus →` (optionnel, vers page dédiée) |

**Détail des textes :**

**1. Prise de RDV en ligne**
- Agenda interactif avec gestion des créneaux
- Confirmation automatique par email
- Portail patient public pour réserver 24h/24

**2. Dossiers patients**
- Fiche numérique complète par patient
- Historique médical, visites, traitements
- Imagerie et documents attachés

**3. Facturation & Paiements**
- Facture générée automatiquement après chaque visite
- Calcul des frais de visite + opérations
- Suivi des impayés et historique des paiements

**4. Ordonnances & Prescriptions**
- 4000+ médicaments référencés
- Ordonnance numérique prête à imprimer en PDF
- Posologie, fréquence, durée

**5. Tableau de bord & Rapports**
- Vue d'ensemble des revenus du mois
- Statistiques patients, RDV, factures
- Rapports exportables pour la comptabilité

**6. Sécurité & Conformité**
- Conformité Loi 09-08 (protection des données)
- Hébergement sécurisé au Maroc
- Accès par rôle (patient, secrétaire, dentiste, admin)

---

### 3.6 SECTION DÉMO / VIDÉO

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Vous préférez voir avant d'essayer ?                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │                                                  │    │
│  │          ▶  Voir la démo (2 min)                 │    │
│  │                                                  │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  Ou réservez une démo personnalisée avec notre équipe    │
│  [Réserver une démo →]                                   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

| Champ | Contenu |
|-------|---------|
| Titre | `Vous préférez voir avant d'essayer ?` |
| Vidéo | Loom / YouTube embed (2-3 min, voice-over FR) |
| CTA alternatif | `Réserver une démo personnalisée` → formulaire de contact |
| Formulaire démo | Nom, Email, Téléphone, Nom de la clinique, Ville |

---

### 3.7 TARIFS (Pricing)

```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│                  │  │                  │  │                  │
│   STARTER        │  │   PRO            │  │   CLINIC         │
│                  │  │                  │  │                  │
│   299 MAD/mois   │  │   599 MAD/mois   │  │   999 MAD/mois   │
│                  │  │                  │  │                  │
│   1 dentiste     │  │   3 dentistes    │  │   Illimité       │
│   200 patients   │  │   Illimité       │  │   Illimité       │
│   max            │  │   patients       │  │   patients       │
│                  │  │                  │  │                  │
│   ✓ RDV en ligne │  │   ✓ RDV en ligne │  │   ✓ RDV en ligne  │
│   ✓ Dossiers     │  │   ✓ Dossiers     │  │   ✓ Dossiers      │
│   ✓ Facturation  │  │   ✓ Facturation  │  │   ✓ Facturation   │
│   ✓ Ordonnances  │  │   ✓ Ordonnances  │  │   ✓ Ordonnances   │
│   ✓ Dashboard    │  │   ✓ Dashboard    │  │   ✓ Dashboard     │
│                  │  │   ✓ Multi-       │  │   ✓ Multi-         │
│                  │  │     secrétaire   │  │     secrétaire    │
│                  │  │   ✓ Support      │  │   ✓ Support VIP   │
│                  │  │     prioritaire  │  │   ✓ Onboarding    │
│                  │  │   ✓ SMS rappel   │  │     dédié         │
│                  │  │                  │  │   ✓ SMS illimité  │
│                  │  │                  │  │   ✓ CNSS/CNOPS    │
│                  │  │                  │  │     automatisé    │
│                  │  │                  │  │                  │
│ [Choisir →]      │  │ [Choisir →]      │  │ [Choisir →]      │
│                  │  │                  │  │                  │
│                  │  │ ★ Recommandé     │  │                  │
└──────────────────┘  └──────────────────┘  └──────────────────┘

✅ Tous les plans incluent 30 jours d'essai gratuit
```

**Champs par plan :**

| Champ | Starter | Pro | Clinic |
|-------|---------|-----|--------|
| Prix | `299 MAD/mois` | `599 MAD/mois` | `999 MAD/mois` |
| Dentistes | `1 dentiste` | `3 dentistes` | `Illimité` |
| Patients | `200 patients max` | `Illimité` | `Illimité` |
| RDV en ligne | ✅ | ✅ | ✅ |
| Dossiers patients | ✅ | ✅ | ✅ |
| Facturation | ✅ | ✅ | ✅ |
| Ordonnances | ✅ | ✅ | ✅ |
| Dashboard stats | ✅ | ✅ | ✅ |
| Multi-secrétaire | ❌ | ✅ | ✅ |
| Support prioritaire | ❌ | ✅ | ✅ |
| SMS rappel | 50/mois | 200/mois | Illimité |
| CNSS/CNOPS auto | ❌ | ❌ | ✅ |
| Onboarding dédié | ❌ | ❌ | ✅ |
| Badge | — | `★ Recommandé` | `★ Pour les gros cabinets` |

**Période d'essai :** 30 jours gratuits — sans carte bancaire.

---

### 3.8 FAQ

Questions à traiter (cliquez pour développer) :

| Question | Réponse |
|----------|---------|
| **Puis-je essayer sans risque ?** | Oui, 30 jours gratuits sans carte bancaire. Vous pouvez annuler à tout moment. |
| **Mes données sont-elles sécurisées ?** | Oui, hébergement sécurisé conforme à la Loi 09-08. Accès par rôle et chiffrement. |
| **Puis-je personnaliser l'apparence ?** | Oui, vous pouvez ajouter votre logo, vos couleurs et vos horaires d'ouverture. |
| **Est-ce que ça marche sur mobile ?** | Oui, l'interface est responsive. Les patients peuvent réserver depuis leur téléphone. |
| **Comment se passe l'onboarding ?** | Vous créez votre compte en 5 minutes. Un guide interactif vous accompagne. |
| **Puis-je inviter mon équipe ?** | Oui, envoyez des invitations à vos secrétaires et dentistes par email. |
| **Quels moyens de paiement acceptez-vous ?** | Virement bancaire (MAD). Paiement par carte à venir. |
| **Y a-t-il des frais cachés ?** | Non, le prix affiché est le prix final. Pas de frais d'installation. |
| **Puis-je changer de plan ?** | Oui, vous pouvez passer à un plan supérieur ou inférieur à tout moment. |
| **Que se passe-t-il après l'essai ?** | Vous choisissez un plan pour continuer. Si vous ne souscrivez pas, votre accès est suspendu. |

---

### 3.9 CTA FINAL

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│  Prêt à transformer votre cabinet ?                       │
│                                                           │
│  Rejoignez les cliniques qui nous font confiance          │
│  et simplifiez votre gestion au quotidien.                │
│                                                           │
│  [Commencer l'essai gratuit →]                            │
│                                                           │
│  ⏱ 30 jours gratuits  |  Sans carte bancaire              │
│  |  Configuration en 5 minutes                            │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

---

### 3.10 FOOTER

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  DentASpace                          [Logo]                      │
│  La gestion de cabinet dentaire                                  │
│  simplifiée.                                                     │
│                                                                  │
│  Produit        Entreprise         Légal                         │
│  ──────────     ────────────       ──────────                    │
│  Fonctionnalités  À propos         Conditions d'utilisation      │
│  Tarifs         Contact            Politique de confidentialité  │
│  FAQ            Blog               Mentions légales              │
│  Documentation  Nous rejoindre                                   │
│                                                                  │
│  Contact : contact@dentaspace.ma                                 │
│  WhatsApp : +212 6XX XX XX XX                                    │
│                                                                  │
│  © 2026 DentASpace. Tous droits réservés.                        │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. CHAMPS & FORMULAIRES

### 4.1 Formulaire d'inscription (RegisterClinic)

Déjà existant : `POST /api/register-clinic`. Champs :

| Champ | Type | Validation |
|-------|------|------------|
| `nom_clinique` | text | Obligatoire, max 255 |
| `slug` | text (slug) | Obligatoire, alpha_dash, unique, max 50 |
| `email` | email | Obligatoire, unique (utilisateurs) |
| `password` | password | Obligatoire, min 6, confirmed |
| `telephone` | tel | Obligatoire, max 20 |
| `ville` | select | Obligatoire (dropdown 15 villes marocaines) |
| `nom_admin` | text | Obligatoire, max 255 |
| `prenom_admin` | text | Obligatoire, max 255 |
| `plan` | radio (hidden) | Optionnel, défaut "starter" |

### 4.2 Formulaire "Demander une démo"

| Champ | Type |
|-------|------|
| `nom_complet` | text |
| `email` | email |
| `telephone` | tel |
| `nom_clinique` | text |
| `ville` | select |
| `message` | textarea (optionnel) |

Backend : `POST /api/demo-request` (à créer) → notification email au superadmin + Slack/WhatsApp.

---

## 5. DESIGN SYSTEM & COMPOSANTS

Basé sur le brand DentASpace existant :

| Token | Valeur | Usage |
|-------|--------|-------|
| `--color-primary` | `#57c8cb` | CTA, accents, hover states |
| `--color-primary-dark` | `#0d9488` | Accent secondaire, links |
| `--color-bg` | `#ffffff` | Fond page |
| `--color-surface` | `#f0fdfa` | Cartes, sections |
| `--color-text` | `#191919` | Texte principal |
| `--color-muted` | `#64748b` | Texte secondaire |
| `--font-family` | `Inter, system-ui, sans-serif` | Typographie |
| `--radius` | `8px` | Coins arrondis |
| `--shadow` | `0 1px 3px rgba(0,0,0,0.1)` | Ombres cartes |

### Composants React à créer

```
frontend/src/pages/landing/
├── LandingPage.jsx          # Page principale
├── components/
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── SocialProof.jsx
│   ├── ProblemsSolutions.jsx
│   ├── Features.jsx
│   ├── DemoSection.jsx
│   ├── Pricing.jsx
│   ├── FAQ.jsx
│   ├── FinalCTA.jsx
│   └── Footer.jsx
```

---

## 6. STRATÉGIE DE MONÉTISATION & CONVERSION

### 6.1 Entonnoir de conversion (Funnel)

```
VISITEUR ATTERRIT SUR LA LANDING PAGE
              │
              ▼
    HÉSITE ?  ◄────────────────────┐
    │                              │
    ├── Voir la démo vidéo ────────┤
    ├── Lire la FAQ ──────────────┤
    └── Comparer les tarifs ─────┘
              │
       Décide d'essayer ?
              │
         ┌────┴────┐
         ▼         ▼
      OUI         NON
         │         │
    [Inscription]  [Email capture]
         │         │
   30 jours        │
   d'essai         ▼
         │    Email de relance
    ┌────┤    (J+3, J+7, J+14, J+28)
    │    │
    ▼    ▼
  J-7 avant fin d'essai :
  Notification "Votre essai se termine"
  + Offre spéciale conversion (optionnelle)

    J0 : Fin d'essai
    ┌────┴────┐
    ▼         ▼
  PAIE      SUSPENDU
    │         │
    │         ▼
    │    (J+30 : données archivées)
    │
    ▼
  Client actif (MRR)
```

### 6.2 Stratégie de pricing psychologique

| Tactique | Application |
|----------|-------------|
| **Ancrage** | Afficher le plan PRO en premier (599 MAD) pour rendre STARTER (299) plus abordable |
| **Gratuit temporaire** | 30 jours d'essai sans carte bancaire → baisse la friction |
| **Urgence** | "Offre limitée" ou "Premier mois à 50%" (lancement) |
| **Mise en avant** | Plan PRO marqué "Recommandé" (effet de défaut) |
| **Annual vs mensuel** | Option annuelle : 2 mois offerts (ex: PRO 599 → 499 MAD/mois si annuel) |
| **Parrainage** | 1 mois offert pour chaque clinique référée (acquisition virale) |

### 6.3 Relances automation (Email marketing)

| J | Action | Canal |
|---|--------|-------|
| J+1 | Email de bienvenue + guide démarrage rapide | Email |
| J+3 | Email "3 fonctionnalités que vous n'avez pas encore essayées" | Email |
| J+7 | Email cas client / témoignage | Email |
| J+14 | Email "Vous avez déjà économisé X heures ?" + Stats usage | Email |
| J+21 | Notification "Votre essai se termine dans 7 jours" | Email + In-app |
| J+28 | Offre spéciale conversion (10% première année) | Email + WhatsApp |
| J+30 | Suspension + email "Vos données sont sauvegardées 30 jours" | Email |
| J+60 | Suppression définitive + email regret | Email |

### 6.4 Leviers de conversion additionnels

| Levier | Description |
|--------|-------------|
| **Démo live** | Call WhatsApp/Google Meet de 15 min avec un commercial |
| **Support WhatsApp** | Canal direct pour questions avant inscription |
| **Témoignages clients** | Vidéos de dentistes satisfaits (réseau bêta) |
| **Comparaison concurrents** | Page "DentASpace vs Dentisto" (SEO + conversion) |
| **Blog SEO** | "Comment choisir un logiciel dentaire au Maroc", "CNSS dentiste guide" |
| **Programme bêta** | 5-10 cliniques en accès gratuit 3 mois contre témoignages + feedback |

### 6.5 Indicateurs de performance (KPI)

| Métrique | Objectif M1 | Objectif M6 | Objectif M12 |
|----------|-------------|-------------|--------------|
| Visiteurs landing | 500/mois | 2000/mois | 5000/mois |
| Taux conversion essai | 8% | 12% | 15% |
| Taux conversion payant | 20% | 30% | 40% |
| MRR | 5 000 MAD | 50 000 MAD | 150 000 MAD |
| Cliniques actives | 5 | 20 | 60 |
| Churn mensuel | < 10% | < 5% | < 3% |

---

## 7. TECHNIQUE : ROUTES & PAGES

### Routes frontend à ajouter dans App.jsx

```jsx
<Route path="/" element={<LandingPage />} />
<Route path="/fonctionnalites" element={<LandingPage />} />  // scroll to #features
<Route path="/tarifs" element={<LandingPage />} />            // scroll to #pricing
<Route path="/faq" element={<LandingPage />} />               // scroll to #faq
<Route path="/contact" element={<LandingPage />} />           // scroll to #contact
```

Ou mieux : ancres HTML avec `scroll-behavior: smooth`.

### SEO

| Tag | Contenu |
|-----|---------|
| `<title>` | DentASpace — Logiciel de gestion de cabinet dentaire au Maroc |
| `<meta description>` | Gérez votre cabinet dentaire simplement : prise de RDV, dossiers patients, facturation, ordonnances. Essai gratuit 30 jours. |
| `<meta keywords>` | logiciel cabinet dentaire, gestion cabinet dentaire, dentiste maroc, SaaS dentaire Maroc, prise de rendez-vous en ligne |
| Open Graph | Titre, description, image (1200x630px du mockup) |
| Hreflang | `fr` (pas d'autre langue au lancement) |
| Schema.org | `SoftwareApplication`, `WebApplication`, `Product` |

### Pages légales

- `/conditions` → Conditions générales d'utilisation
- `/confidentialite` → Politique de confidentialité (conforme Loi 09-08)
- `/mentions-legales` → Mentions légales

---

## 8. ROADMAP D'EXÉCUTION

| Phase | Contenu | Durée |
|-------|---------|-------|
| **1. Conception** | Finaliser ce document + valider copy | 1 jour |
| **2. Design** | Maquette Figma ou HTML/CSS direct | 2 jours |
| **3. Développement** | Créer composants React + intégration | 3 jours |
| **4. SEO & Analytics** | Meta tags, Google Analytics, Hotjar | 1 jour |
| **5. Pages légales** | Rédiger CGU, confidentialité, mentions | 1 jour |
| **6. Email automation** | Configurer séquence d'onboarding + relance | 2 jours |
| **7. Déploiement** | Mettre en ligne + tester conversion | 1 jour |
| **Total** | | **~11 jours** |

---

## 9. RESSOURCES & RÉFÉRENCES

- **Brand system** : `frontend/public/dentaspace/`
- **Couleurs existantes** : `brand.json` (accent #57c8cb, bg #ffffff, text #191919)
- **Typographie** : Inter, system-ui
- **Logo** : `frontend/public/dentaspace/assets/`
- **Inscription existante** : `RegisterClinic.jsx` + `ClinicRegistrationController.php`
- **Pricing existant** : table `plans` (starter/pro/clinic)
- **Billing existant** : `BillingController.php`, `Subscription.php`, `SaaSInvoice.php`
- **Concurrent** : Dentisto.ma (analysé dans `compititor-analyse.md`)
- **Analyse SaaS** : `SAAS_TODO.md` (Phase 5 : Landing page)

---

*Document créé : 2026-07-21*
*Basé sur : projet HZ Dentaire / DentASpace, analyse concurrentielle Dentisto*
