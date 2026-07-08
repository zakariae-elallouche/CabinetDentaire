<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use App\Models\Paiement;
use App\Models\Patient;
use App\Models\Secretaire;
use App\Services\NotificationService;
use App\Services\AuditService;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    public function index(Request $request)
    {
        if (!in_array($request->user()->role, ['secretaire', 'admin_clinique'], true)) {
            abort(403);
        }

        return response()->json(Facture::with('patient')->get());
    }

    public function show(Request $request, $id)
    {
        $user    = $request->user();
        $facture = Facture::with('patient')->findOrFail($id);

        if ($user->role === 'patient') {
            $patientId = Patient::where('utilisateur_id', $user->id)->value('id');
            if ($facture->patient_id !== $patientId) abort(403);
        }

        return response()->json($facture);
    }

    public function patientFactures(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            $patientId = Patient::where('utilisateur_id', $user->id)->value('id');
            if ((int)$id !== $patientId) abort(403);
        }

        return response()->json(
            Facture::with(['patient', 'visite.operations', 'visite.dentiste'])
                ->where('patient_id', $id)
                ->orderByDesc('date_facture')
                ->get()
        );
    }

    public function payment(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['secretaire', 'admin_clinique'], true)) {
            abort(403);
        }

        $request->validate([
            'montant_recu'     => 'required|numeric|min:0',
            'methode_paiement' => 'required|in:especes,carte,virement,cheque',
            'numero_recu'      => 'nullable|string',
            'notes'            => 'nullable|string',
        ]);

        $facture = Facture::findOrFail($id);

        if ($facture->statut === 'payee') {
            abort(422, 'Facture déjà payée.');
        }

        $secretaireId = Secretaire::where('utilisateur_id', $request->user()->id)->value('id');

        $paiement = Paiement::create([
            'facture_id'       => $facture->id,
            'secretaire_id'    => $secretaireId,
            'montant_recu'     => $request->montant_recu,
            'date_paiement'    => today(),
            'methode_paiement' => $request->methode_paiement,
            'numero_recu'      => $request->numero_recu,
            'notes'            => $request->notes,
            'tenant_id'        => tenant_id(),
        ]);

        AuditService::log('create', 'paiements', $paiement->id, null, $paiement->toArray());

        $factureOld = $facture->toArray();
        $facture->update([
            'statut'        => 'payee',
            'date_paiement' => today(),
        ]);

        AuditService::log('update', 'factures', $facture->id, $factureOld, $facture->fresh()->toArray());
        NotificationService::paiementRecu($facture->fresh());

        return response()->json($facture->fresh()->load('patient'));
    }

    public function report(Request $request)
    {
        if (!in_array($request->user()->role, ['secretaire', 'admin_clinique'], true)) {
            abort(403);
        }

        $total      = Facture::sum('montant_total');
        $payees     = Facture::where('statut', 'payee')->sum('montant_total');
        $en_attente = Facture::where('statut', 'en_attente')->sum('montant_total');

        return response()->json([
            'total_revenus'       => $total,
            'montant_payee'       => $payees,
            'montant_en_attente'  => $en_attente,
            'nb_factures_payees'  => Facture::where('statut', 'payee')->count(),
            'nb_factures_attente' => Facture::where('statut', 'en_attente')->count(),
        ]);
    }
}
