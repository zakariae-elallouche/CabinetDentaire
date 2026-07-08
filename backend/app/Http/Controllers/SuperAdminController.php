<?php

namespace App\Http\Controllers;

use App\Models\Plan;
use App\Models\Tenant;
use App\Models\Utilisateur;
use App\Models\Facture;
use App\Models\SaaSInvoice;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\ValidationException;

class SuperAdminController extends Controller
{
    public function stats()
    {
        $now = now();
        $monthStart = $now->copy()->startOfMonth();

        $total = Tenant::count();
        $actifs = Tenant::where('statut', 'actif')->count();
        $essai = Tenant::where('statut', 'essai')->count();
        $suspendus = Tenant::whereIn('statut', ['suspendu', 'expire'])->count();

        $newSignups = Tenant::where('created_at', '>=', $monthStart)->count();

        $expiringTrials = Tenant::where('statut', 'essai')
            ->whereNotNull('trial_ends_at')
            ->whereBetween('trial_ends_at', [$now, $now->copy()->addDays(7)])
            ->get(['id', 'nom_clinique', 'slug', 'email_contact', 'trial_ends_at']);

        $mrr = Facture::where('statut', 'payee')
            ->whereMonth('date_paiement', $now->month)
            ->whereYear('date_paiement', $now->year)
            ->sum('montant_total');

        $churn = Tenant::whereIn('statut', ['expire', 'suspendu'])
            ->where('updated_at', '>=', $monthStart)
            ->count();

        return response()->json([
            'tenants' => [
                'total' => $total,
                'actifs' => $actifs,
                'essai' => $essai,
                'suspendus' => $suspendus,
            ],
            'mrr' => $mrr,
            'new_signups' => $newSignups,
            'expiring_trials' => $expiringTrials,
            'churn' => $churn,
        ]);
    }

    public function tenants(Request $request)
    {
        $query = Tenant::query();

        if ($statut = $request->statut) {
            $query->where('statut', $statut);
        }
        if ($ville = $request->ville) {
            $query->where('ville', $ville);
        }
        if ($search = $request->search) {
            $query->where(function ($q) use ($search) {
                $q->where('nom_clinique', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('email_contact', 'like', "%{$search}%");
            });
        }

        $tenants = $query->orderByDesc('created_at')->paginate(20);

        return response()->json($tenants);
    }

    public function tenantShow($id)
    {
        $tenant = Tenant::withCount([
            'utilisateurs',
            'patients',
            'dentistes',
            'secretaires',
            'rendezVous',
            'visites',
            'factures',
        ])->findOrFail($id);

        $utilisateurs = Utilisateur::where('tenant_id', $id)
            ->whereIn('role', ['admin_clinique', 'dentiste', 'secretaire'])
            ->select('id', 'email', 'nom', 'prenom', 'role', 'statut', 'derniere_connexion', 'created_at')
            ->get();

        $subscriptions = Subscription::where('tenant_id', $id)
            ->orderByDesc('created_at')
            ->get();

        $invoices = SaaSInvoice::where('tenant_id', $id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'tenant' => $tenant,
            'utilisateurs' => $utilisateurs,
            'subscriptions' => $subscriptions,
            'invoices' => $invoices,
        ]);
    }

    public function suspend($id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['statut' => 'suspendu']);
        return response()->json(['message' => 'Clinique suspendue', 'statut' => $tenant->statut]);
    }

    public function activate($id)
    {
        $tenant = Tenant::findOrFail($id);
        $tenant->update(['statut' => 'actif']);
        return response()->json(['message' => 'Clinique activée', 'statut' => $tenant->statut]);
    }

    public function extendTrial(Request $request, $id)
    {
        $request->validate(['days' => 'required|integer|min:1|max:90']);

        $tenant = Tenant::findOrFail($id);
        $newEnd = $tenant->trial_ends_at
            ? $tenant->trial_ends_at->addDays($request->days)
            : now()->addDays($request->days);
        $tenant->update(['trial_ends_at' => $newEnd]);

        return response()->json(['message' => 'Essai prolongé', 'trial_ends_at' => $newEnd]);
    }

    public function createInvoice(Request $request, $id)
    {
        $request->validate([
            'montant' => 'required|numeric|min:0',
            'date_echeance' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $tenant = Tenant::findOrFail($id);

        $numero = 'SAAS-' . $tenant->id . '-' . now()->format('Ymd') . '-' . strtoupper(\Str::random(4));

        $invoice = SaaSInvoice::create([
            'tenant_id' => $tenant->id,
            'numero' => $numero,
            'montant' => $request->montant,
            'devise' => 'MAD',
            'statut' => 'pending',
            'date_echeance' => $request->date_echeance,
            'notes' => $request->notes,
        ]);

        return response()->json(['message' => 'Facture créée', 'invoice' => $invoice]);
    }

    public function monthlyStats()
    {
        $months = collect();
        $now = now();

        for ($i = 5; $i >= 0; $i--) {
            $date = $now->copy()->startOfMonth()->subMonths($i);
            $end  = $date->copy()->endOfMonth();

            $signups = Tenant::whereBetween('created_at', [$date, $end])->count();

            $mrr = SaaSInvoice::where('statut', 'paid')
                ->whereBetween('date_paiement', [$date, $end])
                ->sum('montant');

            $months->push([
                'month'   => $date->format('M'),
                'signups' => $signups,
                'mrr'     => (int) $mrr,
            ]);
        }

        return response()->json(['months' => $months]);
    }

    // ─── Plans CRUD ────────────────────────────────────────────────

    public function plans()
    {
        return response()->json(Plan::orderBy('prix_mensuel')->get());
    }

    public function storePlan(Request $request)
    {
        $request->validate([
            'slug'            => 'required|string|unique:plans,slug|max:50',
            'nom'             => 'required|string|max:100',
            'prix_mensuel'    => 'required|integer|min:0',
            'nb_dentistes_max' => 'nullable|integer|min:0',
            'nb_patients_max'  => 'nullable|integer|min:0',
            'features'         => 'nullable|array',
            'actif'            => 'boolean',
        ]);

        $plan = Plan::create($request->all());

        return response()->json($plan, 201);
    }

    public function updatePlan(Request $request, $id)
    {
        $plan = Plan::findOrFail($id);

        $request->validate([
            'slug'            => 'string|max:50|unique:plans,slug,' . $id,
            'nom'             => 'string|max:100',
            'prix_mensuel'    => 'integer|min:0',
            'nb_dentistes_max' => 'nullable|integer|min:0',
            'nb_patients_max'  => 'nullable|integer|min:0',
            'features'         => 'nullable|array',
            'actif'            => 'boolean',
        ]);

        $plan->update($request->all());

        return response()->json($plan);
    }

    public function destroyPlan($id)
    {
        $plan = Plan::findOrFail($id);

        $hasSubscriptions = \App\Models\Subscription::where('plan_id', $id)->exists();
        if ($hasSubscriptions) {
            throw ValidationException::withMessages([
                'plan' => 'Impossible de supprimer un plan qui a des abonnements actifs.',
            ]);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan supprimé']);
    }
}
