<?php

namespace App\Console\Commands;

use App\Models\RendezVous;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Carbon\Carbon;

class SendRappelVisite extends Command
{
    protected $signature = 'notifications:rappel-visite';
    protected $description = 'Envoie un rappel de rendez-vous J-1 aux patients';

    public function handle(): void
    {
        $demain = Carbon::tomorrow()->toDateString();

        $rdvs = RendezVous::whereIn('statut', ['confirme'])
            ->whereDate('date_heure', $demain)
            ->get();

        $count = 0;
        foreach ($rdvs as $rdv) {
            NotificationService::rappelVisite($rdv);
            $count++;
        }

        $this->info("{$count} rappels de visite envoyés pour le {$demain}");
    }
}
