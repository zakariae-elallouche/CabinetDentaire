<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        DB::statement('CREATE INDEX IF NOT EXISTS idx_rendez_vous_tenant_statut ON rendez_vous (tenant_id, statut)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_rendez_vous_tenant_date ON rendez_vous (tenant_id, date_heure)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_rendez_vous_patient_statut ON rendez_vous (patient_id, statut)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_rendez_vous_dentiste_date ON rendez_vous (dentiste_id, date_heure)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_visites_patient ON visites (patient_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_factures_tenant_statut ON factures (tenant_id, statut)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_factures_patient ON factures (patient_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_ordonnances_patient ON ordonnances (patient_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_utilisateurs_email ON utilisateurs (email)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_patients_utilisateur ON patients (utilisateur_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_dentistes_utilisateur ON dentistes (utilisateur_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_secretaires_utilisateur ON secretaires (utilisateur_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_notifications_utilisateur ON notifications (utilisateur_id)');
        DB::statement('CREATE INDEX IF NOT EXISTS idx_audits_tenant ON audits (tenant_id)');
    }

    public function down()
    {
        DB::statement('DROP INDEX IF EXISTS idx_rendez_vous_tenant_statut');
        DB::statement('DROP INDEX IF EXISTS idx_rendez_vous_tenant_date');
        DB::statement('DROP INDEX IF EXISTS idx_rendez_vous_patient_statut');
        DB::statement('DROP INDEX IF EXISTS idx_rendez_vous_dentiste_date');
        DB::statement('DROP INDEX IF EXISTS idx_visites_patient');
        DB::statement('DROP INDEX IF EXISTS idx_factures_tenant_statut');
        DB::statement('DROP INDEX IF EXISTS idx_factures_patient');
        DB::statement('DROP INDEX IF EXISTS idx_ordonnances_patient');
        DB::statement('DROP INDEX IF EXISTS idx_utilisateurs_email');
        DB::statement('DROP INDEX IF EXISTS idx_patients_utilisateur');
        DB::statement('DROP INDEX IF EXISTS idx_dentistes_utilisateur');
        DB::statement('DROP INDEX IF EXISTS idx_secretaires_utilisateur');
        DB::statement('DROP INDEX IF EXISTS idx_notifications_utilisateur');
        DB::statement('DROP INDEX IF EXISTS idx_audits_tenant');
    }
};
