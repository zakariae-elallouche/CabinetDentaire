<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM('rdv_confirme', 'rdv_rejete', 'paiement_recu', 'rdv_demande') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE notifications MODIFY COLUMN type ENUM('rdv_confirme', 'rdv_rejete', 'paiement_recu') NOT NULL");
    }
};
