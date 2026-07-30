<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('patients')
            ->whereNotNull('telephone')
            ->orderBy('id')
            ->each(function ($row) {
                DB::table('utilisateurs')
                    ->where('id', $row->utilisateur_id)
                    ->whereNull('telephone')
                    ->update(['telephone' => $row->telephone]);
            });

        DB::table('tenants')
            ->whereNotNull('telephone')
            ->orderBy('id')
            ->each(function ($row) {
                DB::table('utilisateurs')
                    ->where('tenant_id', $row->id)
                    ->where('role', 'admin_clinique')
                    ->whereNull('telephone')
                    ->update(['telephone' => $row->telephone]);
            });
    }

    public function down(): void
    {
        DB::table('utilisateurs')->update(['telephone' => null]);
    }
};
