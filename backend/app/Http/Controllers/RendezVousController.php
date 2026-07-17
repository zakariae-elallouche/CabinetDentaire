<?php

namespace App\Http\Controllers;

use App\Models\RendezVous;
use App\Models\Patient;
use App\Models\Dentiste;
use App\Models\Secretaire;
use App\Services\NotificationService;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class RendezVousController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        RendezVous::where('statut', 'confirme')
            ->where('date_heure', '<', Carbon::now()->subHours(2))
            ->update(['statut' => 'annule', 'notes' => 'Patient absent au rendez-vous']);

        RendezVous::where('statut', 'en_attente')
            ->where('date_heure', '<', Carbon::now())
            ->update(['statut' => 'annule', 'notes' => 'Non confirmé dans les délais']);

        $perPage = 25;

        $rdvs = match($user->role) {
            'patient' => RendezVous::with('patient')
                ->where('patient_id', Patient::where('utilisateur_id', $user->id)->value('id'))
                ->orderByDesc('date_heure')->paginate($perPage),

            'dentiste' => RendezVous::with('patient')
                ->where('statut', 'confirme')
                ->where('dentiste_id', Dentiste::where('utilisateur_id', $user->id)->value('id'))
                ->orderBy('date_heure')->paginate($perPage),

            'secretaire', 'admin_clinique' => RendezVous::with('patient')->orderByDesc('date_heure')->paginate($perPage),

            default => abort(403),
        };

        return response()->json($rdvs->through(fn($rdv) => $rdv->toFrontend()));
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'patient') abort(403);

        $request->validate([
            'date'        => 'required|date_format:Y-m-d',
            'heure'       => 'required|date_format:H:i',
            'duree'       => 'nullable|integer|min:15',
            'raison'      => 'nullable|string',
            'dentiste_id' => 'nullable|integer|exists:dentistes,id',
        ]);

        $patientId  = Patient::where('utilisateur_id', $request->user()->id)->value('id');

        $dentisteId = $request->dentiste_id ?? Dentiste::value('id');
        if (!$dentisteId) {
            return response()->json(['message' => 'Aucun dentiste disponible pour le moment. Veuillez réessayer plus tard.'], 422);
        }

        $rdv = RendezVous::create([
            'patient_id'  => $patientId,
            'dentiste_id' => $dentisteId,
            'date_heure'  => $request->date . ' ' . $request->heure . ':00',
            'duree'       => $request->duree ?? 30,
            'raison'      => $request->raison,
            'statut'      => 'en_attente',
            'tenant_id'   => tenant_id(),
        ]);

        AuditService::log('create', 'rendez_vous', $rdv->id, null, $rdv->toArray());
        NotificationService::rdvDemande($rdv);
        NotificationService::nouveauRdvDentiste($rdv, 'demande');

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
        if (!in_array($request->user()->role, ['secretaire', 'admin_clinique'], true)) abort(403);

        $rdv          = RendezVous::with('patient')->findOrFail($id);
        $secretaireId = Secretaire::where('utilisateur_id', $request->user()->id)->value('id');

        $old = $rdv->toArray();
        $rdv->update([
            'statut'        => 'confirme',
            'secretaire_id' => $secretaireId,
            'confirme_le'   => now(),
        ]);

        NotificationService::rdvConfirme($rdv->fresh());
        NotificationService::nouveauRdvDentiste($rdv->fresh(), 'confirme');
        AuditService::log('update', 'rendez_vous', $rdv->id, $old, $rdv->fresh()->toArray());

        return response()->json($rdv->fresh()->load('patient')->toFrontend());
    }

    public function reject(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['secretaire', 'admin_clinique'], true)) abort(403);

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
        $dentisteId = $request->dentiste_id ?? Dentiste::value('id');

        $cacheKey = 'available_slots.' . $date . '.' . ($dentisteId ?? 'all');

        $result = Cache::remember($cacheKey, 30, function () use ($request, $date, $dentisteId) {
            if (!$dentisteId) {
                return ['date' => $date, 'slots' => [], 'horaires' => [], 'frais_visite' => 0];
            }

            $tenant   = $request->user()->tenant;
            $horaires = $tenant->horaires ?? self::defaultHoraires();
            $fraisVisite = (float)($tenant->frais_visite ?? 200);

            $dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
            $carbon   = Carbon::parse($date);
            $dayKey   = $dayNames[(int)$carbon->format('w')];
            $dayHoraire = $horaires[$dayKey] ?? ['actif' => false];

            if (!($dayHoraire['actif'] ?? false)) {
                return ['date' => $date, 'slots' => [], 'horaires' => $horaires, 'frais_visite' => $fraisVisite];
            }

            $debut = $dayHoraire['debut'] ?? '09:00';
            $fin   = $dayHoraire['fin'] ?? '18:00';

            $taken = RendezVous::where('dentiste_id', $dentisteId)
                ->whereDate('date_heure', $date)
                ->whereIn('statut', ['en_attente', 'confirme'])
                ->pluck('date_heure')
                ->map(fn($d) => Carbon::parse($d)->format('H:i'))
                ->toArray();

            $now   = Carbon::now();
            $slots = [];
            $start = Carbon::parse("$date $debut");
            $end   = Carbon::parse("$date $fin");

            if ($start->gte($end)) {
                return ['date' => $date, 'slots' => [], 'horaires' => $horaires, 'frais_visite' => $fraisVisite];
            }

            while ($start < $end) {
                $slot = $start->format('H:i');
                if (!in_array($slot, $taken) && $start->gt($now)) $slots[] = $slot;
                $start->addMinutes(30);
            }

            return ['date' => $date, 'slots' => $slots, 'horaires' => $horaires, 'frais_visite' => $fraisVisite];
        });

        return response()->json($result);
    }

    private static function defaultHoraires(): array
    {
        $days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        $default = [];
        foreach ($days as $d) {
            $default[$d] = [
                'actif' => !in_array($d, ['samedi', 'dimanche']),
                'debut' => '09:00',
                'fin'   => $d === 'samedi' ? '13:00' : '18:00',
            ];
        }
        return $default;
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
            ->paginate(25);

        return response()->json($rdvs->through(fn($rdv) => $rdv->toFrontend()));
    }
}
