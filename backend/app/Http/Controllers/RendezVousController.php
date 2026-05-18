<?php

namespace App\Http\Controllers;

use App\Models\RendezVous;
use App\Models\Patient;
use App\Models\Dentiste;
use App\Models\Secretaire;
use App\Services\NotificationService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Carbon\Carbon;

class RendezVousController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Auto-cancel past RDVs
        RendezVous::where('statut', 'confirme')
            ->where('date_heure', '<', Carbon::now())
            ->update(['statut' => 'annule', 'notes' => 'Patient absent au rendez-vous']);

        RendezVous::where('statut', 'en_attente')
            ->where('date_heure', '<', Carbon::now())
            ->update(['statut' => 'annule', 'notes' => 'Non confirmé dans les délais']);

        $rdvs = match($user->role) {
            'patient' => RendezVous::with('patient')
                ->where('patient_id', Patient::where('utilisateur_id', $user->id)->value('id'))
                ->orderByDesc('date_heure')->get(),

            'dentiste' => RendezVous::with('patient')
                ->where('statut', 'confirme')
                ->where('dentiste_id', Dentiste::where('utilisateur_id', $user->id)->value('id'))
                ->orderBy('date_heure')->get(),

            'secretaire' => RendezVous::with('patient')->orderByDesc('date_heure')->get(),

            default => abort(403),
        };

        return response()->json($rdvs->map->toFrontend()->values());
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'patient') abort(403);

        $request->validate([
            'date'   => 'required|date_format:Y-m-d',
            'heure'  => 'required|date_format:H:i',
            'duree'  => 'nullable|integer|min:15',
            'raison' => 'nullable|string',
        ]);

        $patientId  = Patient::where('utilisateur_id', $request->user()->id)->value('id');
        $dentisteId = Dentiste::value('id');

        $rdv = RendezVous::create([
            'patient_id'  => $patientId,
            'dentiste_id' => $dentisteId,
            'date_heure'  => $request->date . ' ' . $request->heure . ':00',
            'duree'       => $request->duree ?? 30,
            'raison'      => $request->raison,
            'statut'      => 'en_attente',
        ]);

        AuditService::log('create', 'rendez_vous', $rdv->id, null, $rdv->toArray());
        NotificationService::rdvDemande($rdv);

        return response()->json($rdv->load('patient')->toFrontend(), 201);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $rdv  = RendezVous::with('patient')->findOrFail($id);

        if ($user->role === 'patient') {
            $patientId = Patient::where('utilisateur_id', $user->id)->value('id');
            if ($rdv->patient_id !== $patientId) abort(403);
        }

        if ($user->role === 'dentiste') {
            $dentisteId = Dentiste::where('utilisateur_id', $user->id)->value('id');
            if ($rdv->dentiste_id !== $dentisteId) abort(403);
        }

        return response()->json($rdv->toFrontend());
    }

    public function destroy(Request $request, $id)
    {
        if ($request->user()->role !== 'patient') abort(403);

        $rdv       = RendezVous::findOrFail($id);
        $patientId = Patient::where('utilisateur_id', $request->user()->id)->value('id');

        if ($rdv->patient_id !== $patientId) abort(403);
        if ($rdv->statut !== 'en_attente') abort(422, 'Impossible d\'annuler un RDV déjà traité.');

        $old = $rdv->toArray();
        $rdv->update(['statut' => 'annule']);
        AuditService::log('update', 'rendez_vous', $rdv->id, $old, $rdv->fresh()->toArray());

        return response()->json(['message' => 'Rendez-vous annulé.']);
    }

    public function confirm(Request $request, $id)
    {
        if ($request->user()->role !== 'secretaire') abort(403);

        $rdv          = RendezVous::with('patient')->findOrFail($id);
        $secretaireId = Secretaire::where('utilisateur_id', $request->user()->id)->value('id');

        $old = $rdv->toArray();
        $rdv->update([
            'statut'        => 'confirme',
            'secretaire_id' => $secretaireId,
            'confirme_le'   => now(),
        ]);

        NotificationService::rdvConfirme($rdv->fresh());
        AuditService::log('update', 'rendez_vous', $rdv->id, $old, $rdv->fresh()->toArray());

        return response()->json($rdv->fresh()->load('patient')->toFrontend());
    }

    public function reject(Request $request, $id)
    {
        if ($request->user()->role !== 'secretaire') abort(403);

        $request->validate(['raison' => 'required|string']);

        $rdv = RendezVous::with('patient')->findOrFail($id);
        $old = $rdv->toArray();

        $rdv->update(['statut' => 'annule', 'notes' => $request->raison]);

        NotificationService::rdvRejete($rdv->fresh(), $request->raison);
        AuditService::log('update', 'rendez_vous', $rdv->id, $old, $rdv->fresh()->toArray());

        return response()->json($rdv->fresh()->load('patient')->toFrontend());
    }

    public function availableSlots(Request $request)
    {
        $request->validate(['date' => 'required|date_format:Y-m-d']);

        $date       = $request->date;
        $dentisteId = Dentiste::value('id');

        $taken = RendezVous::where('dentiste_id', $dentisteId)
            ->whereDate('date_heure', $date)
            ->whereIn('statut', ['en_attente', 'confirme'])
            ->pluck('date_heure')
            ->map(fn($d) => Carbon::parse($d)->format('H:i'))
            ->toArray();

        $now   = Carbon::now();
        $slots = [];
        $start = Carbon::parse("$date 09:00");
        $end   = Carbon::parse("$date 18:00");

        while ($start < $end) {
            $slot = $start->format('H:i');
            if (!in_array($slot, $taken) && $start->gt($now)) $slots[] = $slot;
            $start->addMinutes(30);
        }

        return response()->json(['date' => $date, 'slots' => $slots]);
    }

    public function dentisteSchedule(Request $request)
    {
        if ($request->user()->role !== 'dentiste') abort(403);

        $dentisteId = Dentiste::where('utilisateur_id', $request->user()->id)->value('id');

        $rdvs = RendezVous::with('patient')
            ->where('dentiste_id', $dentisteId)
            ->where('statut', 'confirme')
            ->whereDate('date_heure', today())
            ->orderBy('date_heure')
            ->get();

        return response()->json($rdvs->map->toFrontend()->values());
    }
}
