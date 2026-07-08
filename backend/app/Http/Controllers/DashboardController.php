<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Dentiste;
use App\Models\Secretaire;
use App\Models\RendezVous;
use App\Models\Visite;
use App\Models\Facture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $role = $request->user()->role;

        $base = match (true) {
            $role === 'superadmin' => null,
            default => $tenantId,
        };

        $data = [
            'patients_count'  => Patient::when($base, fn($q) => $q->where('tenant_id', $base))->count(),
            'dentistes_count' => Dentiste::when($base, fn($q) => $q->where('tenant_id', $base))->count(),
            'secretaires_count' => Secretaire::when($base, fn($q) => $q->where('tenant_id', $base))->count(),
            'rdv_today'       => RendezVous::when($base, fn($q) => $q->where('tenant_id', $base))
                ->whereDate('date_heure', now())->count(),
        ];

        if (in_array($role, ['admin_clinique', 'superadmin'])) {
            // ── RDV by status ──
            $rdvStatuses = RendezVous::when($base, fn($q) => $q->where('tenant_id', $base))
                ->select('statut', DB::raw('count(*) as total'))
                ->groupBy('statut')
                ->pluck('total', 'statut');

            $statusMap = ['en_attente' => 'En attente', 'confirme' => 'Confirmé', 'complete' => 'Complété', 'annule' => 'Annulé'];
            $rdvChart = collect($statusMap)->map(fn($label, $key) => [
                'name'  => $label,
                'value' => (int) ($rdvStatuses[$key] ?? 0),
            ])->values();

            // ── Monthly revenue (last 12 months) ──
            $monthly = Facture::when($base, fn($q) => $q->where('tenant_id', $base))
                ->where('statut', 'payee')
                ->where('date_paiement', '>=', now()->subMonths(11)->startOfMonth())
                ->select(
                    DB::raw("TO_CHAR(date_paiement, 'YYYY-MM') as mois"),
                    DB::raw('SUM(montant_total) as total')
                )
                ->groupBy('mois')
                ->orderBy('mois')
                ->pluck('total', 'mois');

            $frMonths = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc'];
            $allMonths = collect();
            for ($i = 11; $i >= 0; $i--) {
                $d = now()->subMonths($i);
                $m = $d->format('Y-m');
                $label = $frMonths[(int) $d->format('n') - 1] . ' ' . $d->format('y');
                $allMonths->push([
                    'mois'   => $label,
                    'revenu' => (float) ($monthly[$m] ?? 0),
                ]);
            }

            // ── Revenue totals ──
            $revenuMois = Facture::when($base, fn($q) => $q->where('tenant_id', $base))
                ->where('statut', 'payee')
                ->where('date_paiement', '>=', now()->startOfMonth())
                ->sum('montant_total');

            $impaye = Facture::when($base, fn($q) => $q->where('tenant_id', $base))
                ->where('statut', 'en_attente')
                ->sum('montant_total');

            $rdvConfirmes = RendezVous::when($base, fn($q) => $q->where('tenant_id', $base))
                ->whereIn('statut', ['confirme', 'complete'])
                ->count();

            $rdvCompletes = RendezVous::when($base, fn($q) => $q->where('tenant_id', $base))
                ->where('statut', 'complete')
                ->count();

            $data['rdv_chart']         = $rdvChart;
            $data['revenu_mensuel']    = $allMonths;
            $data['revenu_mois']       = round((float) $revenuMois, 2);
            $data['impaye']            = round((float) $impaye, 2);
            $data['visites_mois']      = $rdvCompletes;
            $data['rdv_mois']          = $rdvConfirmes;
        }

        return response()->json($data);
    }
}
