# HZ Dentaire — Application de Gestion de Cabinet Dentaire

## Réalisé par

| Nom | Prénom |
|-----|--------|
| EL ALLOUCHE | Zakariae |
| EL ABED | Habiba |

---

Application web full-stack de gestion d'un cabinet dentaire, développée dans le cadre d'un projet académique. Elle couvre l'ensemble du flux clinique : prise de rendez-vous, consultations, ordonnances et facturation, avec trois rôles utilisateurs distincts.

---
<img width="1898" height="944" alt="image" src="https://github.com/user-attachments/assets/27ddc0a5-7a05-4275-af20-a01e60ae78fa" />


## Présentation

**HZ Dentaire** digitalise la gestion quotidienne d'un cabinet dentaire. Trois types d'acteurs interagissent sur une plateforme unifiée :

| Rôle | Responsabilités principales |
|------|-----------------------------|
| **Patient** | Réserver des rendez-vous, consulter ses visites, télécharger ordonnances et factures en PDF |
| **Secrétaire** | Confirmer/rejeter les RDV, enregistrer les paiements, gérer médicaments et opérations |
| **Dentiste** | Consulter l'agenda du jour, enregistrer les visites, émettre des ordonnances |

---

## Stack technique

### Backend
| Technologie | Rôle |
|-------------|------|
| **Laravel 11** | Framework PHP — API REST |
| **Laravel Sanctum** | Authentification par token (SPA) |
| **MySQL** | Base de données relationnelle |
| **XAMPP** | Serveur local (Apache + MySQL) |

### Frontend
| Technologie | Rôle |
|-------------|------|
| **React 18** | Interface utilisateur (SPA) |
| **React Router v6** | Navigation côté client |
| **Axios** | Communication avec l'API |
| **jsPDF** | Génération PDF (ordonnances, factures) |
| **React Toastify** | Notifications utilisateur |

---

## Architecture du projet

```
Cabinet Dentaire/
├── backend/                        # API RESTful Laravel 11
│   ├── app/
│   │   ├── Http/Controllers/       # Un controller par ressource
│   │   │   ├── AuthController.php
│   │   │   ├── RendezVousController.php
│   │   │   ├── VisiteController.php
│   │   │   ├── OrdonnanceController.php
│   │   │   ├── FactureController.php
│   │   │   └── ...
│   │   ├── Models/                 # Eloquent ORM
│   │   │   ├── Patient.php
│   │   │   ├── Dentiste.php
│   │   │   ├── Visite.php
│   │   │   ├── Facture.php
│   │   │   ├── Ordonnance.php
│   │   │   └── ...
│   │   └── Services/
│   │       ├── AuditService.php
│   │       └── NotificationService.php
│   ├── database/migrations/        # Schéma complet
│   └── routes/api.php              # Toutes les routes API
│
└── frontend/                       # Application React (Vite)
    └── src/
        ├── pages/
        │   ├── auth/               # Login, Register
        │   ├── patient/            # Dashboard, RDV, Visites, Ordonnances, Factures
        │   ├── secretaire/         # RDV, Paiements, Médicaments, Opérations, Patients
        │   └── dentiste/           # Dashboard, Agenda du jour, Visite, Ordonnance
        ├── components/             # Layout (sidebar), ProtectedRoute, DialogProvider
        ├── context/AuthContext.jsx  # État d'authentification global
        └── api.js                  # Instance Axios avec intercepteurs
```

---

## Fonctionnalités détaillées

### Authentification & Sécurité
- Inscription avec choix de rôle, connexion par email/mot de passe
- Token Sanctum stocké côté client, envoyé dans chaque requête API
- Routes protégées par rôle (`ProtectedRoute`) côté frontend
- Vérification du rôle côté backend sur chaque endpoint sensible

### Module Patient
- Calendrier interactif de réservation avec vérification des créneaux disponibles
- Suivi des rendez-vous filtrable par statut (en attente, confirmé, complété, annulé)
- Historique complet des visites médicales
- Téléchargement des ordonnances en PDF (médicaments, posologie, durée)
- Téléchargement des factures en PDF (détail des opérations, dentiste, total)

### Module Secrétaire
- Liste des rendez-vous avec filtres et recherche par nom de patient
- Confirmation ou rejet des demandes de RDV (avec motif de rejet)
- Enregistrement des paiements : montant, méthode (espèces, carte, virement, chèque)
- CRUD complet du catalogue de médicaments (nom, forme, dosage, prix)
- Gestion des tarifs du catalogue d'opérations dentaires
- Fiche patient complète : RDV, visites, ordonnances, paiements

### Module Dentiste
- Agenda du jour : rendez-vous confirmés + visites complètes enregistrées
- Enregistrement de visite : diagnostic, traitement fourni, notes cliniques, opérations effectuées
- Génération automatique de facture à la validation de la visite
- Émission d'ordonnances avec médicaments, fréquence, durée et instructions
- Historique médical complet par patient

---

## Installation et lancement

### Prérequis
- XAMPP avec PHP 8.2+ et MySQL actifs
- Node.js 18+
- Composer

### 1. Backend (Laravel)

```bash
cd backend

# Installer les dépendances
composer install

# Configurer l'environnement
cp .env.example .env
# Modifier DB_DATABASE, DB_USERNAME, DB_PASSWORD dans .env

# Générer la clé applicative
php artisan key:generate

# Créer la base de données et les tables
php artisan migrate --seed

# Lancer le serveur
php artisan serve --port=8000
```

### 2. Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
# Accessible sur http://localhost:5173
```

### Comptes de test (créés par le seeder)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Dentiste | dentiste@clinic.ma | password |
| Secrétaire | secretaire@clinic.ma | password |
| Patient | patient@clinic.ma | password |

---

## Schéma de base de données

```
utilisateurs
├── patients            (nom, prenom, telephone, date_naissance, sexe)
├── dentistes           (nom, prenom, specialite)
└── secretaires         (nom, prenom)

rendez_vous             (patient_id, dentiste_id, date, heure, statut, raison)

visites                 (rendezvous_id, patient_id, dentiste_id, date_visite,
                         diagnostic, traitement_fourni, notes, statut)

operation_dentaires     (visite_id, nom_operation, description, cout, date_effectuee)

factures                (visite_id, patient_id, numero_facture,
                         frais_visite_base, frais_operations, montant_total,
                         statut, date_facture, date_paiement)

ordonnances             (visite_id, patient_id, dentiste_id,
                         date_delivrance, instructions_generales, statut)

ordonnance_medicaments  (ordonnance_id, medicament_id, frequence,
                         duree_jours, instructions_speciales)

medicaments             (nom, forme, dosage, prix_unitaire, description)
operations              (nom, description, cout)   ← catalogue tarifaire
paiements               (facture_id, secretaire_id, montant_recu,
                         methode_paiement, date_paiement)
```

---

## Choix de conception

**Architecture découplée (API + SPA)** : le backend expose uniquement une API REST, le frontend est une Single Page Application indépendante. Cette séparation facilite la maintenance et permettrait d'ajouter une application mobile sans modifier le backend.

**Laravel Sanctum** : authentification légère par token adaptée aux SPA, intégrée nativement à Laravel, sans la complexité de OAuth.

**Génération PDF côté client (jsPDF)** : évite la charge serveur pour la génération de documents et offre un téléchargement immédiat sans requête supplémentaire.

**Context API React** : gestion de l'état d'authentification sans bibliothèque externe (pas besoin de Redux pour ce périmètre).

**Rôles stricts côté backend** : chaque endpoint vérifie le rôle de l'utilisateur connecté, indépendamment des protections frontend.

---

## Technologies utilisées — Résumé

```
Backend  : PHP 8.2 · Laravel 11 · Sanctum · Eloquent ORM · MySQL
Frontend : JavaScript (ES2024) · React 18 · Vite · React Router v6 · Axios · jsPDF
Outils   : XAMPP · Composer · npm · Git
```
