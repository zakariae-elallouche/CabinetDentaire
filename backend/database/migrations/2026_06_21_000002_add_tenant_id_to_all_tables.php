<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private array $tables = [
        'utilisateurs',
        'patients',
        'secretaires',
        'dentistes',
        'rendez_vous',
        'visites',
        'operation_dentaires',
        'factures',
        'paiements',
        'ordonnances',
        'ordonnance_medicaments',
        'medicaments',
        'catalogue_operations',
        'notifications',
        'audits',
    ];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (!Schema::hasColumn($table, 'tenant_id')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->foreignId('tenant_id')->nullable()->constrained('tenants')->cascadeOnDelete();
                });
            }
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE utilisateurs MODIFY role VARCHAR(50) NOT NULL DEFAULT 'patient'");
        } elseif (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE utilisateurs ALTER COLUMN role TYPE VARCHAR(50)");
            DB::statement("ALTER TABLE utilisateurs ALTER COLUMN role SET NOT NULL");
            DB::statement("ALTER TABLE utilisateurs ALTER COLUMN role SET DEFAULT 'patient'");
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $tableName) {
            if (Schema::hasColumn($tableName, 'tenant_id')) {
                Schema::table($tableName, function (Blueprint $t) use ($tableName) {
                    $t->dropForeign(['tenant_id']);
                    $t->dropColumn('tenant_id');
                });
            }
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE utilisateurs MODIFY role ENUM('patient','secretaire','dentiste','admin') NOT NULL DEFAULT 'patient'");
        }
    }
};
