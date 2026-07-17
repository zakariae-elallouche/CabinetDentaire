<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Dentiste;
use App\Models\Secretaire;
use App\Models\RendezVous;
use App\Models\Visite;
use App\Models\Facture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
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

        $cacheKey = 'dashboard.' . ($base ?? 'global');

        $data = Cache::remember($cacheKey, 300, function () use ($base, $role) {
            $result = [
                'patients_count'   => Patient::when($base, fn($q) => $q->where('tenant_id', $base))->count(),
                'dentistes_count'  => Dentiste::when($base, fn($q) => $q->where('tenant_id', $base))->count(),
                'secretaires_count' => Secretaire::when($base, fn($q) => $q->where('tenant_id', $base))->count(),
                'rdv_today'        => RendezVous::when($base, fn($q) => $q->where('tenant_id', $base))
                    ->whereDate('date_heure', now())->count(),
            ];

            if (in_array($role, ['admin_clinique', 'superadmin'])) {
                $rdvStatuses = RendezVous::when($base, fn($q) => $q->where('tenant_id', $base))
                    ->select('statut', DB::raw('count(*) as total'))
                    ->groupBy('statut')
                    ->pluck('total', 'statut');

                $statusMap = ['en_attente' => 'En attente', 'confirme' => 'Confirmé', 'complete' => 'Complété', 'annule' => 'Annulé'];
                $rdvChart = collect($statusMap)->map(fn($label, $key) => [
                    'name'  => $label,
                    'value' => (int) ($rdvStatuses[$key] ?? 0),
                ])->values();

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

                $result['rdv_chart']      = $rdvChart;
                $result['revenu_mensuel'] = $allMonths;
                $result['revenu_mois']    = round((float) Facture::when($base, fn($q) => $q->where('tenant_id', $base))
                    ->where('statut', 'payee')
                    ->where('date_paiement', '>=', now()->startOfMonth())
                    ->sum('montant_total'), 2);
                $result['impaye']         = round((float) Facture::when($base, fn($q) => $q->where('tenant_id', $base))
                    ->where('statut', 'en_attente')
                    ->sum('montant_total'), 2);
                $result['visites_mois']   = RendezVous::when($base, fn($q) => $q->where('tenant_id', $base))
                    ->where('statut', 'complete')
                    ->count();
                $result['rdv_mois']       = RendezVous::when($base, fn($q) => $q->where('tenant_id', $base))
                    ->whereIn('statut', ['confirme', 'complete'])
                    ->count();
            }

            return $result;
        });

        return response()->json($data);
    }
}
