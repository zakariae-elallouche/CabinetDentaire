<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use Illuminate\Console\Command;

class CheckTrials extends Command
{
    protected $signature = 'subscriptions:check-trials';
    protected $description = 'Vérifie les essais expirés et notifie les cliniques';

    public function handle(): void
    {
        $now = now();

        $expired = Tenant::where('statut', 'essai')
            ->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '<', $now)
            ->get();

        foreach ($expired as $tenant) {
            $tenant->update(['statut' => 'suspendu']);
            $this->info("Expired: {$tenant->nom_clinique} ({$tenant->slug})");
        }

        $expiringSoon = Tenant::where('statut', 'essai')
            ->whereNotNull('trial_ends_at')
            ->whereBetween('trial_ends_at', [$now, $now->copy()->addDays(7)])
            ->get();

        $this->info("Expired: {$expired->count()}, Expiring soon: {$expiringSoon->count()}");
    }
}
