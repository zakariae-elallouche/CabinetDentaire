-- =============================================================
-- Cabinet Dentaire - Database Schema
-- Generated: 2026-05-23
-- Database: MySQL
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET time_zone = '+00:00';

DROP DATABASE IF EXISTS `cabinet_dentaire`;
CREATE DATABASE `cabinet_dentaire`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `cabinet_dentaire`;

-- =============================================================
-- TABLE: utilisateurs
-- =============================================================
CREATE TABLE `utilisateurs` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email`             VARCHAR(255)    NOT NULL,
  `password`          VARCHAR(255)    NOT NULL,
  `role`              ENUM('patient','secretaire','dentiste','admin') NOT NULL,
  `statut`            ENUM('actif','inactif','suspendu') NOT NULL DEFAULT 'actif',
  `date_creation`     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `derniere_connexion` DATETIME       NULL,
  `created_at`        TIMESTAMP       NULL,
  `updated_at`        TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `utilisateurs_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: patients
-- =============================================================
CREATE TABLE `patients` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `utilisateur_id`   BIGINT UNSIGNED NOT NULL,
  `nom`              VARCHAR(255)    NOT NULL,
  `prenom`           VARCHAR(255)    NOT NULL,
  `telephone`        VARCHAR(255)    NULL,
  `adresse`          VARCHAR(255)    NULL,
  `date_naissance`   DATE            NULL,
  `sexe`             ENUM('masculin','feminin') NULL,
  `contact_urgence`  VARCHAR(255)    NULL,
  `date_inscription` DATE            NOT NULL DEFAULT (CURRENT_DATE),
  `notes_generales`  TEXT            NULL,
  `created_at`       TIMESTAMP       NULL,
  `updated_at`       TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `patients_utilisateur_id_fk`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: secretaires
-- =============================================================
CREATE TABLE `secretaires` (
  `id`              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `utilisateur_id`  BIGINT UNSIGNED NOT NULL,
  `nom`             VARCHAR(255)    NOT NULL,
  `prenom`          VARCHAR(255)    NOT NULL,
  `numero_employe`  VARCHAR(255)    NOT NULL,
  `date_embauche`   DATE            NULL,
  `created_at`      TIMESTAMP       NULL,
  `updated_at`      TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `secretaires_numero_employe_unique` (`numero_employe`),
  CONSTRAINT `secretaires_utilisateur_id_fk`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: dentistes
-- =============================================================
CREATE TABLE `dentistes` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `utilisateur_id` BIGINT UNSIGNED NOT NULL,
  `nom`            VARCHAR(255)    NOT NULL,
  `prenom`         VARCHAR(255)    NOT NULL,
  `specialite`     VARCHAR(255)    NULL,
  `biographie`     TEXT            NULL,
  `photo`          VARCHAR(255)    NULL,
  `created_at`     TIMESTAMP       NULL,
  `updated_at`     TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `dentistes_utilisateur_id_fk`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: rendez_vous
-- =============================================================
CREATE TABLE `rendez_vous` (
  `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `patient_id`    BIGINT UNSIGNED NOT NULL,
  `dentiste_id`   BIGINT UNSIGNED NOT NULL,
  `secretaire_id` BIGINT UNSIGNED NULL,
  `date_heure`    DATETIME        NOT NULL,
  `duree`         INT             NOT NULL DEFAULT 30,
  `raison`        TEXT            NULL,
  `statut`        ENUM('en_attente','confirme','annule','complete') NOT NULL DEFAULT 'en_attente',
  `notes`         TEXT            NULL,
  `cree_le`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `confirme_le`   DATETIME        NULL,
  `created_at`    TIMESTAMP       NULL,
  `updated_at`    TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `rdv_patient_id_fk`
    FOREIGN KEY (`patient_id`)    REFERENCES `patients`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `rdv_dentiste_id_fk`
    FOREIGN KEY (`dentiste_id`)   REFERENCES `dentistes`   (`id`) ON DELETE CASCADE,
  CONSTRAINT `rdv_secretaire_id_fk`
    FOREIGN KEY (`secretaire_id`) REFERENCES `secretaires` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: visites
-- =============================================================
CREATE TABLE `visites` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `rendezvous_id`       BIGINT UNSIGNED NULL,
  `patient_id`          BIGINT UNSIGNED NOT NULL,
  `dentiste_id`         BIGINT UNSIGNED NOT NULL,
  `date_visite`         DATE            NOT NULL,
  `diagnostic`          TEXT            NULL,
  `traitement_fourni`   TEXT            NULL,
  `notes`               TEXT            NULL,
  `statut`              ENUM('en_cours','complete','annulee') NOT NULL DEFAULT 'en_cours',
  `cree_le`             DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at`          TIMESTAMP       NULL,
  `updated_at`          TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `visites_rendezvous_id_fk`
    FOREIGN KEY (`rendezvous_id`) REFERENCES `rendez_vous` (`id`) ON DELETE SET NULL,
  CONSTRAINT `visites_patient_id_fk`
    FOREIGN KEY (`patient_id`)    REFERENCES `patients`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `visites_dentiste_id_fk`
    FOREIGN KEY (`dentiste_id`)   REFERENCES `dentistes`   (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: catalogue_operations
-- =============================================================
CREATE TABLE `catalogue_operations` (
  `id`          BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `nom`         VARCHAR(255)     NOT NULL,
  `description` TEXT             NULL,
  `cout`        DECIMAL(10,2)    NOT NULL DEFAULT 0.00,
  `created_at`  TIMESTAMP        NULL,
  `updated_at`  TIMESTAMP        NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: operation_dentaires
-- =============================================================
CREATE TABLE `operation_dentaires` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `visite_id`      BIGINT UNSIGNED NOT NULL,
  `nom_operation`  VARCHAR(255)    NOT NULL,
  `description`    TEXT            NULL,
  `cout`           DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `date_effectuee` DATE            NOT NULL,
  `created_at`     TIMESTAMP       NULL,
  `updated_at`     TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `op_dentaires_visite_id_fk`
    FOREIGN KEY (`visite_id`) REFERENCES `visites` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: ordonnances
-- =============================================================
CREATE TABLE `ordonnances` (
  `id`                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `visite_id`             BIGINT UNSIGNED NOT NULL,
  `patient_id`            BIGINT UNSIGNED NOT NULL,
  `dentiste_id`           BIGINT UNSIGNED NOT NULL,
  `date_delivrance`       DATE            NOT NULL,
  `instructions_generales` TEXT           NULL,
  `statut`                ENUM('active','expiree','annulee') NOT NULL DEFAULT 'active',
  `cree_le`               DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at`            TIMESTAMP       NULL,
  `updated_at`            TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `ordonnances_visite_id_fk`
    FOREIGN KEY (`visite_id`)   REFERENCES `visites`   (`id`) ON DELETE CASCADE,
  CONSTRAINT `ordonnances_patient_id_fk`
    FOREIGN KEY (`patient_id`)  REFERENCES `patients`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `ordonnances_dentiste_id_fk`
    FOREIGN KEY (`dentiste_id`) REFERENCES `dentistes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: medicaments
-- =============================================================
CREATE TABLE `medicaments` (
  `id`           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nom`          VARCHAR(255)    NOT NULL,
  `description`  TEXT            NULL,
  `forme`        VARCHAR(255)    NULL,
  `dosage`       VARCHAR(255)    NULL,
  `cree_le`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `mis_a_jour_le` DATETIME       NULL,
  `created_at`   TIMESTAMP       NULL,
  `updated_at`   TIMESTAMP       NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: ordonnance_medicaments
-- =============================================================
CREATE TABLE `ordonnance_medicaments` (
  `id`                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ordonnance_id`         BIGINT UNSIGNED NOT NULL,
  `medicament_id`         BIGINT UNSIGNED NOT NULL,
  `frequence`             VARCHAR(255)    NOT NULL,
  `duree_jours`           INT             NOT NULL,
  `instructions_speciales` TEXT           NULL,
  `created_at`            TIMESTAMP       NULL,
  `updated_at`            TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `ord_med_ordonnance_id_fk`
    FOREIGN KEY (`ordonnance_id`) REFERENCES `ordonnances`  (`id`) ON DELETE CASCADE,
  CONSTRAINT `ord_med_medicament_id_fk`
    FOREIGN KEY (`medicament_id`) REFERENCES `medicaments`  (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: factures
-- =============================================================
CREATE TABLE `factures` (
  `id`                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `numero_facture`      VARCHAR(255)    NOT NULL,
  `visite_id`           BIGINT UNSIGNED NOT NULL,
  `patient_id`          BIGINT UNSIGNED NOT NULL,
  `secretaire_id`       BIGINT UNSIGNED NULL,
  `date_facture`        DATE            NOT NULL,
  `frais_visite_base`   DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `frais_operations`    DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `montant_total`       DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
  `statut`              ENUM('en_attente','payee','annulee','partiellement_payee') NOT NULL DEFAULT 'en_attente',
  `date_paiement`       DATE            NULL,
  `notes`               TEXT            NULL,
  `created_at`          TIMESTAMP       NULL,
  `updated_at`          TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `factures_numero_facture_unique` (`numero_facture`),
  CONSTRAINT `factures_visite_id_fk`
    FOREIGN KEY (`visite_id`)     REFERENCES `visites`      (`id`) ON DELETE CASCADE,
  CONSTRAINT `factures_patient_id_fk`
    FOREIGN KEY (`patient_id`)    REFERENCES `patients`     (`id`) ON DELETE CASCADE,
  CONSTRAINT `factures_secretaire_id_fk`
    FOREIGN KEY (`secretaire_id`) REFERENCES `secretaires`  (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: paiements
-- =============================================================
CREATE TABLE `paiements` (
  `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `facture_id`        BIGINT UNSIGNED NOT NULL,
  `secretaire_id`     BIGINT UNSIGNED NULL,
  `montant_recu`      DECIMAL(10,2)   NOT NULL,
  `date_paiement`     DATE            NOT NULL,
  `methode_paiement`  ENUM('especes','carte','virement','cheque') NOT NULL DEFAULT 'especes',
  `numero_recu`       VARCHAR(255)    NULL,
  `notes`             TEXT            NULL,
  `created_at`        TIMESTAMP       NULL,
  `updated_at`        TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `paiements_facture_id_fk`
    FOREIGN KEY (`facture_id`)    REFERENCES `factures`    (`id`) ON DELETE CASCADE,
  CONSTRAINT `paiements_secretaire_id_fk`
    FOREIGN KEY (`secretaire_id`) REFERENCES `secretaires` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: notifications
-- =============================================================
CREATE TABLE `notifications` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `utilisateur_id` BIGINT UNSIGNED NOT NULL,
  `type`           ENUM('rdv_confirme','rdv_rejete','paiement_recu','rdv_demande') NOT NULL,
  `titre`          VARCHAR(255)    NOT NULL,
  `message`        TEXT            NOT NULL,
  `donnees`        JSON            NULL,
  `lu`             TINYINT(1)      NOT NULL DEFAULT 0,
  `lu_le`          DATETIME        NULL,
  `created_at`     TIMESTAMP       NULL,
  `updated_at`     TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `notifications_utilisateur_id_fk`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: audits
-- =============================================================
CREATE TABLE `audits` (
  `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `utilisateur_id`   BIGINT UNSIGNED NULL,
  `action`           ENUM('create','update','delete','login','logout') NOT NULL,
  `table_affectee`   VARCHAR(255)    NOT NULL,
  `id_enregistrement` BIGINT UNSIGNED NULL,
  `ancienne_valeur`  JSON            NULL,
  `nouvelle_valeur`  JSON            NULL,
  `horodatage`       DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `adresse_ip`       VARCHAR(255)    NULL,
  `created_at`       TIMESTAMP       NULL,
  `updated_at`       TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `audits_utilisateur_id_fk`
    FOREIGN KEY (`utilisateur_id`) REFERENCES `utilisateurs` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- TABLE: personal_access_tokens (Laravel Sanctum)
-- =============================================================
CREATE TABLE `personal_access_tokens` (
  `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` VARCHAR(255)    NOT NULL,
  `tokenable_id`   BIGINT UNSIGNED NOT NULL,
  `name`           TEXT            NOT NULL,
  `token`          VARCHAR(64)     NOT NULL,
  `abilities`      TEXT            NULL,
  `last_used_at`   TIMESTAMP       NULL,
  `expires_at`     TIMESTAMP       NULL,
  `created_at`     TIMESTAMP       NULL,
  `updated_at`     TIMESTAMP       NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`, `tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- SAMPLE DATA (mirrors DatabaseSeeder)
-- =============================================================

-- Utilisateurs
INSERT INTO `utilisateurs` (`email`, `password`, `role`, `statut`, `date_creation`) VALUES
('patient@clinic.ma',    '$2y$12$placeholderHashForDemo000000000000000000000000000000000', 'patient',    'actif', NOW()),
('secretaire@clinic.ma', '$2y$12$placeholderHashForDemo000000000000000000000000000000000', 'secretaire', 'actif', NOW()),
('dentiste@clinic.ma',   '$2y$12$placeholderHashForDemo000000000000000000000000000000000', 'dentiste',   'actif', NOW());

-- Patients
INSERT INTO `patients` (`utilisateur_id`, `nom`, `prenom`, `telephone`, `sexe`, `date_inscription`) VALUES
(1, 'Ben Ali', 'Karim', '0600000001', 'masculin', CURDATE());

-- Secretaires
INSERT INTO `secretaires` (`utilisateur_id`, `nom`, `prenom`, `numero_employe`, `date_embauche`) VALUES
(2, 'Moussaoui', 'Sara', 'SEC-001', '2024-01-01');

-- Dentistes
INSERT INTO `dentistes` (`utilisateur_id`, `nom`, `prenom`, `specialite`) VALUES
(3, 'Alaoui', 'Youssef', 'Orthodontie');

-- Catalogue operations
INSERT INTO `catalogue_operations` (`nom`, `description`, `cout`) VALUES
('Examen et diagnostic',               'Examen de la bouche, des dents et des gencives. Recherche de caries, infections, problèmes gingivaux. Utilisation de radiographies si nécessaire.', 150.00),
('Détartrage (nettoyage)',             'Élimination du tartre et de la plaque dentaire. Prévention des maladies des gencives.',                                                           200.00),
('Soins des caries (dentisterie conservatrice)', 'Élimination de la carie et restauration de la dent avec un matériau comme le composite.',                                             300.00),
('Traitement de canal (endodontie)',   'Traitement de la pulpe (nerf) infectée. Nettoyage et obturation des canaux.',                                                                     800.00),
('Extraction dentaire',                'Extraction d\'une dent trop abîmée ou des dents de sagesse.',                                                                                     250.00),
('Orthodontie',                        'Correction de la position des dents. Utilisation d\'appareils dentaires.',                                                                        5000.00),
('Prothèses dentaires',                'Remplacement des dents manquantes : couronnes, bridges, prothèses amovibles.',                                                                   3000.00),
('Implantologie',                      'Pose d\'implants dentaires (racines artificielles). Remplacement durable des dents.',                                                             8000.00);

-- Medicaments
INSERT INTO `medicaments` (`nom`, `description`, `forme`, `dosage`) VALUES
('Paracétamol',  'Antalgique. Soulagement de la douleur et de la fièvre.',  'Comprimé', '500mg - 1g'),
('Ibuprofène',   'Anti-inflammatoire non stéroïdien (AINS).',               'Comprimé', '200mg - 400mg'),
('Diclofénac',   'Anti-inflammatoire non stéroïdien (AINS).',               'Comprimé', '50mg - 75mg'),
('Surgam',       'Anti-inflammatoire non stéroïdien (AINS).',               'Comprimé', '300mg'),
('Amoxicilline', 'Antibiotique. Traitement des infections bactériennes.',   'Gélule',   '500mg - 1g');

SET FOREIGN_KEY_CHECKS = 1;
