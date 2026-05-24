<?php

namespace App\Http\Controllers;

use App\Models\Visite;
use App\Models\RendezVous;
use App\Models\OperationDentaire;
use App\Models\Facture;
use App\Models\Patient;
use App\Models\Dentiste;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VisiteController extends Controller
{
    public function store(Request $request)
    {
        if ($request->user()->role !== 'dentiste') {
            abort(403);
        }

        $request->validate([
            'rendezvous_id'     => 'required|exists:rendez_vous,id',
            'diagnostic'        => 'nullable|string',
            'traitement_fourni' => 'nullable|string',
            'notes'             => 'nullable|string',
            'frais_visite_base' => 'nullable|numeric|min:0',
            'operations'        => 'nullable|array',
            'operations.*.nom_operation' => 'required|string',
            'operations.*.cout'          => 'required|numeric|min:0',
            'operations.*.description'   => 'nullable|string',
        ]);

        $rdv = RendezVous::findOrFail($request->rendezvous_id);

        if ($rdv->statut !== 'confirme') {
            abort(422, 'Le rendez-vous doit être confirmé pour créer une visite.');
        }

        $dentisteId = Dentiste::where('utilisateur_id', $request->user()->id)->value('id');

        $visiteId = null;

        DB::transaction(function () use ($request, $rdv, $dentisteId, &$visiteId) {
            $visite = Visite::create([
                'rendezvous_id'     => $rdv->id,
                'patient_id'        => $rdv->patient_id,
                'dentiste_id'       => $dentisteId,
                'date_visite'       => today(),
                'diagnostic'        => $request->diagnostic,
                'traitement_fourni' => $request->traitement_fourni,
                'notes'             => $request->notes,
                'statut'            => 'complete',
            ]);

            $fraisOperations = 0;
            foreach ($request->operations ?? [] as $op) {
                OperationDentaire::create([
                    'visite_id'      => $visite->id,
                    'nom_operation'  => $op['nom_operation'],
                    'description'    => $op['description'] ?? null,
                    'cout'           => $op['cout'],
                    'date_effectuee' => today(),
                ]);
                $fraisOperations += $op['cout'];
            }

            $fraisBase = $request->frais_visite_base ?? 0;

            Facture::create([
                'numero_facture'    => 'FAC-' . date('Y') . '-' . str_pad($visite->id, 5, '0', STR_PAD_LEFT),
                'visite_id'         => $visite->id,
                'patient_id'        => $rdv->patient_id,
                'date_facture'      => today(),
                'frais_visite_base' => $fraisBase,
                'frais_operations'  => $fraisOperations,
                'montant_total'     => $fraisBase + $fraisOperations,
                'statut'            => 'en_attente',
            ]);

            $rdv->update(['statut' => 'complete']);

            AuditService::log('create', 'visites', $visite->id, null, $visite->toArray());

            $visiteId = $visite->id;
        });

        $visite = Visite::with(['operations', 'facture'])->findOrFail($visiteId);

        return response()->json($visite, 201);
    }

    public function show(Request $request, $id)
    {
        $user   = $request->user();
        $visite = Visite::with(['operations', 'ordonnance', 'facture'])->findOrFail($id);

        if ($user->role === 'patient') {
            $patientId = Patient::where('utilisateur_id', $user->id)->value('id');
            if ($visite->patient_id !== $patientId) abort(403);
        }

        if ($user->role === 'dentiste') {
            $dentisteId = Dentiste::where('utilisateur_id', $user->id)->value('id');
            if ($visite->dentiste_id !== $dentisteId) abort(403);
        }

        return response()->json($visite);
    }

    public function patientVisites(Request $request, $id)
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            $patientId = Patient::where('utilisateur_id', $user->id)->value('id');
            if ((int)$id !== $patientId) abort(403);
        }

        $visites = Visite::with(['facture', 'operations', 'ordonnance.medicaments.medicament', 'dentiste'])->where('patient_id', $id)->orderByDesc('date_visite')->get();

        return response()->json($visites);
    }

    public function today(Request $request)
    {
        if ($request->user()->role !== 'dentiste') {
            abort(403);
        }

        $dentisteId = Dentiste::where('utilisateur_id', $request->user()->id)->value('id');

        $visites = Visite::with(['patient', 'operations', 'facture', 'ordonnance'])
            ->where('dentiste_id', $dentisteId)
            ->whereDate('date_visite', today())
            ->orderBy('created_at')
            ->get();

        return response()->json($visites);
    }
}
