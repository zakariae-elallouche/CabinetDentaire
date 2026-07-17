<?php

namespace App\Http\Controllers;

use App\Models\Subscription;
use App\Models\SaaSInvoice;
use App\Models\Tenant;
use App\Services\AuditService;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class BillingController extends Controller
{
    public function status()
    {
        $tenant = tenant();

        $subscription = Subscription::where('tenant_id', $tenant->id)
            ->latest()
            ->first();

        $nextInvoice = SaaSInvoice::where('tenant_id', $tenant->id)
            ->where('statut', 'pending')
            ->latest()
            ->first();

        return response()->json([
            'tenant' => [
                'statut' => $tenant->statut,
                'trial_ends_at' => $tenant->trial_ends_at,
                'subscription_starts_at' => $tenant->subscription_starts_at,
                'subscription_ends_at' => $tenant->subscription_ends_at,
            ],
            'subscription' => $subscription,
            'next_invoice' => $nextInvoice,
        ]);
    }

    public function invoices()
    {
        $invoices = SaaSInvoice::where('tenant_id', tenant_id())
            ->with('subscription')
            ->orderByDesc('created_at')
            ->paginate(25);

        return response()->json($invoices);
    }

    public function subscribe(Request $request)
    {
        $tenant = tenant();

        $request->validate([
            'methode_paiement' => 'required|in:virement',
        ]);

        $montant = 299;

        $subscription = Subscription::create([
            'tenant_id' => $tenant->id,
            'statut' => 'actif',
            'montant' => $montant,
            'devise' => 'MAD',
            'methode_paiement' => $request->methode_paiement,
            'debut_periode' => now(),
            'fin_periode' => now()->addMonth(),
            'auto_renouvellement' => true,
        ]);

        $invoice = SaaSInvoice::create([
            'tenant_id' => $tenant->id,
            'numero' => 'INV-SAAS-' . date('Y') . '-' . str_pad($subscription->id, 5, '0', STR_PAD_LEFT),
            'subscription_id' => $subscription->id,
            'montant' => $montant,
            'devise' => 'MAD',
            'statut' => 'pending',
            'methode_paiement' => $request->methode_paiement,
            'date_echeance' => now()->addDays(7),
        ]);

        $tenant->update([
            'statut' => 'actif',
            'trial_ends_at' => null,
            'subscription_starts_at' => now(),
            'subscription_ends_at' => now()->addMonth(),
        ]);

        NotificationService::factureRenouvellement($invoice);

        return response()->json([
            'subscription' => $subscription,
            'invoice' => $invoice,
            'message' => 'Abonnement souscrit. Veuillez effectuer le virement bancaire pour confirmer.',
        ], 201);
    }

    public function confirmPayment(Request $request, $id)
    {
        $invoice = SaaSInvoice::findOrFail($id);
        $invoice->update([
            'statut' => 'paid',
            'date_paiement' => now(),
        ]);

        $tenant = Tenant::find($invoice->tenant_id);
        $tenant->update([
            'statut' => 'actif',
            'trial_ends_at' => null,
            'subscription_ends_at' => now()->addMonth(),
        ]);

        $subscription = Subscription::find($invoice->subscription_id);
        if ($subscription) {
            $subscription->update([
                'statut' => 'actif',
                'fin_periode' => now()->addMonth(),
            ]);
        }

        NotificationService::paiementSaaSConfirme($invoice);

        AuditService::log('update', 'saas_invoices', $invoice->id, [
            'statut' => 'pending',
        ], [
            'statut' => 'paid',
            'date_paiement' => now()->toDateString(),
            'tenant_id' => $tenant->id,
        ]);

        return response()->json(['message' => 'Paiement confirmé']);
    }


}
