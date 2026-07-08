<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Patient;
use App\Models\Secretaire;
use App\Models\Dentiste;
use App\Models\RendezVous;
use App\Models\Visite;
use App\Models\Facture;
use App\Models\Ordonnance;
use App\Models\SaaSInvoice;
use App\Models\Subscription;
use App\Models\Utilisateur;
use App\Events\NewNotification;
use Carbon\Carbon;

class NotificationService
{
    private static function createAndBroadcast(array $data): Notification
    {
        $notif = Notification::create($data);
        event(new NewNotification($notif->fresh()));
        return $notif;
    }

    public static function rdvDemande(RendezVous $rdv): void
    {
        $patient   = Patient::with('utilisateur')->find($rdv->patient_id);
        $nomPatient = $patient ? "{$patient->utilisateur?->prenom} {$patient->utilisateur?->nom}" : 'Un patient';
        $dateHeure  = Carbon::parse($rdv->date_heure)->format('d/m/Y à H:i');

        $secretaireIds = Secretaire::pluck('utilisateur_id');

        foreach ($secretaireIds as $utilisateurId) {
            self::createAndBroadcast([
                'tenant_id'        => tenant_id(),
                'utilisateur_id'   => $utilisateurId,
                'type'             => 'rdv_demande',
                'titre'            => 'Nouveau rendez-vous en attente',
                'message'          => "{$nomPatient} a demandé un rendez-vous le {$dateHeure}.",
                'donnees'          => ['rendezvous_id' => $rdv->id, 'patient_id' => $rdv->patient_id],
            ]);
        }
    }

    public static function rdvConfirme(RendezVous $rdv): void
    {
        $utilisateurId = Patient::find($rdv->patient_id)?->utilisateur_id;
        if (!$utilisateurId) return;

        $dateHeure = Carbon::parse($rdv->date_heure)->format('d/m/Y à H:i');

        self::createAndBroadcast([
            'tenant_id'        => tenant_id(),
            'utilisateur_id'   => $utilisateurId,
            'type'             => 'rdv_confirme',
            'titre'            => 'Rendez-vous confirmé',
            'message'          => "Votre rendez-vous du {$dateHeure} a été confirmé.",
            'donnees'          => ['rendezvous_id' => $rdv->id, 'date_heure' => $rdv->date_heure],
        ]);
    }

    public static function rdvRejete(RendezVous $rdv, string $raison): void
    {
        $utilisateurId = Patient::find($rdv->patient_id)?->utilisateur_id;
        if (!$utilisateurId) return;

        $dateHeure = Carbon::parse($rdv->date_heure)->format('d/m/Y à H:i');

        self::createAndBroadcast([
            'tenant_id'        => tenant_id(),
            'utilisateur_id'   => $utilisateurId,
            'type'             => 'rdv_rejete',
            'titre'            => 'Rendez-vous annulé',
            'message'          => "Votre rendez-vous du {$dateHeure} a été annulé. Raison : {$raison}",
            'donnees'          => ['rendezvous_id' => $rdv->id, 'raison' => $raison],
        ]);
    }

    public static function factureRenouvellement(SaaSInvoice $invoice): void
    {
        $admins = Utilisateur::where('tenant_id', $invoice->tenant_id)
            ->where('role', 'admin_clinique')
            ->where('statut', 'actif')
            ->get();

        foreach ($admins as $admin) {
            self::createAndBroadcast([
                'tenant_id'        => $invoice->tenant_id,
                'utilisateur_id'   => $admin->id,
                'type'             => 'facture_saas',
                'titre'            => 'Nouvelle facture d\'abonnement',
                'message'          => "Votre facture {$invoice->numero} de {$invoice->montant} {$invoice->devise} est disponible. Effectuez le virement pour continuer à utiliser l'application.",
                'donnees'          => [
                    'invoice_id'  => $invoice->id,
                    'numero'      => $invoice->numero,
                    'montant'     => $invoice->montant,
                    'devise'      => $invoice->devise,
                ],
            ]);
        }
    }

    public static function paiementSaaSConfirme(SaaSInvoice $invoice): void
    {
        $subscription = Subscription::find($invoice->subscription_id);
        $finPeriode = $subscription?->fin_periode?->format('d/m/Y');

        $admins = Utilisateur::where('tenant_id', $invoice->tenant_id)
            ->where('role', 'admin_clinique')
            ->where('statut', 'actif')
            ->get();

        foreach ($admins as $admin) {
            self::createAndBroadcast([
                'tenant_id'        => $invoice->tenant_id,
                'utilisateur_id'   => $admin->id,
                'type'             => 'facture_saas',
                'titre'            => 'Paiement confirmé',
                'message'          => "Le paiement de votre facture {$invoice->numero} ({$invoice->montant} {$invoice->devise}) a été confirmé. Votre abonnement est actif jusqu'au {$finPeriode}.",
                'donnees'          => [
                    'invoice_id'  => $invoice->id,
                    'numero'      => $invoice->numero,
                    'montant'     => $invoice->montant,
                ],
            ]);
        }
    }

    public static function paiementRecu(Facture $facture): void
    {
        $utilisateurId = Patient::find($facture->patient_id)?->utilisateur_id;
        if (!$utilisateurId) return;

        self::createAndBroadcast([
            'tenant_id'        => tenant_id(),
            'utilisateur_id'   => $utilisateurId,
            'type'             => 'paiement_recu',
            'titre'            => 'Paiement reçu',
            'message'          => "Le paiement de votre facture {$facture->numero_facture} ({$facture->montant_total} MAD) a été enregistré.",
            'donnees'          => [
                'facture_id'      => $facture->id,
                'numero_facture'  => $facture->numero_facture,
                'montant_total'   => $facture->montant_total,
            ],
        ]);
    }

    public static function factureEnAttente(Facture $facture): void
    {
        $utilisateurId = Patient::find($facture->patient_id)?->utilisateur_id;
        if (!$utilisateurId) return;

        self::createAndBroadcast([
            'tenant_id'        => tenant_id(),
            'utilisateur_id'   => $utilisateurId,
            'type'             => 'facture_en_attente',
            'titre'            => 'Facture en attente de paiement',
            'message'          => "Vous avez une facture {$facture->numero_facture} de {$facture->montant_total} MAD à régler.",
            'donnees'          => [
                'facture_id'      => $facture->id,
                'numero_facture'  => $facture->numero_facture,
                'montant_total'   => $facture->montant_total,
            ],
        ]);
    }

    public static function visiteComplete(Visite $visite): void
    {
        $utilisateurId = Patient::find($visite->patient_id)?->utilisateur_id;
        if (!$utilisateurId) return;

        $dateVisite = Carbon::parse($visite->date_visite)->format('d/m/Y');

        self::createAndBroadcast([
            'tenant_id'        => tenant_id(),
            'utilisateur_id'   => $utilisateurId,
            'type'             => 'visite_complete',
            'titre'            => 'Visite complétée',
            'message'          => "Votre visite du {$dateVisite} est complète. Vous pouvez consulter les détails et les documents associés.",
            'donnees'          => [
                'visite_id'  => $visite->id,
                'date_visite' => $visite->date_visite,
            ],
        ]);
    }

    public static function ordonnanceDisponible(Ordonnance $ordonnance): void
    {
        $utilisateurId = Patient::find($ordonnance->patient_id)?->utilisateur_id;
        if (!$utilisateurId) return;

        $date = Carbon::parse($ordonnance->date_delivrance)->format('d/m/Y');

        self::createAndBroadcast([
            'tenant_id'        => tenant_id(),
            'utilisateur_id'   => $utilisateurId,
            'type'             => 'ordonnance_disponible',
            'titre'            => 'Ordonnance disponible',
            'message'          => "Votre ordonnance du {$date} est disponible. Vous pouvez la consulter et la télécharger.",
            'donnees'          => [
                'ordonnance_id'     => $ordonnance->id,
                'visite_id'         => $ordonnance->visite_id,
                'date_delivrance'   => $ordonnance->date_delivrance,
            ],
        ]);
    }

    public static function nouveauPatient(Patient $patient): void
    {
        $nomComplet = "{$patient->utilisateur?->prenom} {$patient->utilisateur?->nom}";

        $secretaireIds = Secretaire::pluck('utilisateur_id');

        foreach ($secretaireIds as $utilisateurId) {
            self::createAndBroadcast([
                'tenant_id'        => tenant_id(),
                'utilisateur_id'   => $utilisateurId,
                'type'             => 'nouveau_patient',
                'titre'            => 'Nouveau patient inscrit',
                'message'          => "{$nomComplet} vient de s'inscrire au cabinet.",
                'donnees'          => [
                    'patient_id'    => $patient->id,
                ],
            ]);
        }
    }

    public static function nouveauRdvDentiste(RendezVous $rdv, string $contexte = 'demande'): void
    {
        $dentiste = Dentiste::find($rdv->dentiste_id);
        if (!$dentiste || !$dentiste->utilisateur_id) return;

        $patient   = Patient::with('utilisateur')->find($rdv->patient_id);
        $nomPatient = $patient ? "{$patient->utilisateur?->prenom} {$patient->utilisateur?->nom}" : 'Un patient';
        $dateHeure  = Carbon::parse($rdv->date_heure)->format('d/m/Y à H:i');

        if ($contexte === 'confirme') {
            $titre   = 'Rendez-vous confirmé';
            $message = "Le rendez-vous de {$nomPatient} du {$dateHeure} a été confirmé.";
        } else {
            $titre   = 'Nouveau rendez-vous';
            $message = "{$nomPatient} a demandé un rendez-vous le {$dateHeure}.";
        }

        self::createAndBroadcast([
            'tenant_id'        => tenant_id(),
            'utilisateur_id'   => $dentiste->utilisateur_id,
            'type'             => 'nouveau_rdv_dentiste',
            'titre'            => $titre,
            'message'          => $message,
            'donnees'          => [
                'rendezvous_id' => $rdv->id,
                'patient_id'    => $rdv->patient_id,
                'contexte'      => $contexte,
            ],
        ]);
    }

    public static function rappelVisite(RendezVous $rdv): void
    {
        $utilisateurId = Patient::find($rdv->patient_id)?->utilisateur_id;
        if (!$utilisateurId) return;

        $dateHeure = Carbon::parse($rdv->date_heure)->format('d/m/Y à H:i');

        self::createAndBroadcast([
            'tenant_id'        => tenant_id(),
            'utilisateur_id'   => $utilisateurId,
            'type'             => 'rappel_visite',
            'titre'            => 'Rappel de rendez-vous',
            'message'          => "Rappel : vous avez un rendez-vous demain à {$dateHeure}.",
            'donnees'          => [
                'rendezvous_id' => $rdv->id,
                'date_heure'    => $rdv->date_heure,
            ],
        ]);
    }
}
