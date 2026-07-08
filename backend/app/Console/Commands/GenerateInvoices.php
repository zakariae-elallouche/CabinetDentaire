<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Models\SaaSInvoice;
use App\Models\Tenant;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class GenerateInvoices extends Command
{
    protected $signature = 'subscriptions:generate-invoices';
    protected $description = 'Génère les factures de renouvellement et suspend les abonnements expirés';

    public function handle(): void
    {
        // ── Suspendre les abonnements expirés ──────────────────────────
        $expired = Subscription::where('statut', 'actif')
            ->whereNotNull('fin_periode')
            ->where('fin_periode', '<', now())
            ->get();

        foreach ($expired as $sub) {
            $sub->update(['statut' => 'expired']);
            $tenant = Tenant::find($sub->tenant_id);
            if ($tenant && $tenant->statut !== 'suspendu') {
                $tenant->update(['statut' => 'suspendu']);
                $this->info("Tenant {$tenant->nom_clinique} suspendu — abonnement #{$sub->id} expiré");
            }
        }

        // ── Générer les factures de renouvellement ─────────────────────
        $soon = Subscription::where('statut', 'actif')
            ->whereNotNull('fin_periode')
            ->whereBetween('fin_periode', [now(), now()->copy()->addDays(7)])
            ->get();

        $generated = 0;

        foreach ($soon as $sub) {
            $already = SaaSInvoice::where('subscription_id', $sub->id)
                ->where('statut', 'pending')
                ->exists();

            if ($already) continue;

            $invoice = SaaSInvoice::create([
                'tenant_id' => $sub->tenant_id,
                'numero' => 'INV-SAAS-' . date('Y') . '-' . str_pad($sub->id, 5, '0', STR_PAD_LEFT) . '-' . strtoupper(\Str::random(3)),
                'subscription_id' => $sub->id,
                'montant' => $sub->montant,
                'devise' => 'MAD',
                'statut' => 'pending',
                'date_echeance' => now()->addDays(7),
                'notes' => 'Renouvellement mensuel automatique',
            ]);

            NotificationService::factureRenouvellement($invoice);

            $this->info("Invoice {$invoice->numero} generated for subscription #{$sub->id}");
            $generated++;
        }

        $this->info("Total invoices generated: {$generated}");
    }
}
