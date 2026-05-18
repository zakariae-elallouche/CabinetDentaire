<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Patient;
use App\Models\Secretaire;
use App\Models\RendezVous;
use App\Models\Facture;
use Carbon\Carbon;

class NotificationService
{
    public static function rdvDemande(RendezVous $rdv): void
    {
        $patient   = Patient::find($rdv->patient_id);
        $nomPatient = $patient ? "{$patient->prenom} {$patient->nom}" : 'Un patient';
        $dateHeure  = Carbon::parse($rdv->date_heure)->format('d/m/Y à H:i');

        $secretaireIds = Secretaire::pluck('utilisateur_id');

        foreach ($secretaireIds as $utilisateurId) {
            Notification::create([
                'utilisateur_id' => $utilisateurId,
                'type'           => 'rdv_demande',
                'titre'          => 'Nouveau rendez-vous en attente',
                'message'        => "{$nomPatient} a demandé un rendez-vous le {$dateHeure}.",
                'donnees'        => ['rendezvous_id' => $rdv->id, 'patient_id' => $rdv->patient_id],
            ]);
        }
    }

    public static function rdvConfirme(RendezVous $rdv): void
    {
        $utilisateurId = Patient::find($rdv->patient_id)?->utilisateur_id;
        if (!$utilisateurId) return;

        $dateHeure = Carbon::parse($rdv->date_heure)->format('d/m/Y à H:i');

        Notification::create([
            'utilisateur_id' => $utilisateurId,
            'type'           => 'rdv_confirme',
            'titre'          => 'Rendez-vous confirmé',
            'message'        => "Votre rendez-vous du {$dateHeure} a été confirmé.",
            'donnees'        => ['rendezvous_id' => $rdv->id, 'date_heure' => $rdv->date_heure],
        ]);
    }

    public static function rdvRejete(RendezVous $rdv, string $raison): void
    {
        $utilisateurId = Patient::find($rdv->patient_id)?->utilisateur_id;
        if (!$utilisateurId) return;

        $dateHeure = Carbon::parse($rdv->date_heure)->format('d/m/Y à H:i');

        Notification::create([
            'utilisateur_id' => $utilisateurId,
            'type'           => 'rdv_rejete',
            'titre'          => 'Rendez-vous annulé',
            'message'        => "Votre rendez-vous du {$dateHeure} a été annulé. Raison : {$raison}",
            'donnees'        => ['rendezvous_id' => $rdv->id, 'raison' => $raison],
        ]);
    }

    public static function paiementRecu(Facture $facture): void
    {
        $utilisateurId = Patient::find($facture->patient_id)?->utilisateur_id;
        if (!$utilisateurId) return;

        Notification::create([
            'utilisateur_id' => $utilisateurId,
            'type'           => 'paiement_recu',
            'titre'          => 'Paiement reçu',
            'message'        => "Le paiement de votre facture {$facture->numero_facture} ({$facture->montant_total} MAD) a été enregistré.",
            'donnees'        => [
                'facture_id'      => $facture->id,
                'numero_facture'  => $facture->numero_facture,
                'montant_total'   => $facture->montant_total,
            ],
        ]);
    }
}
