<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('tenants')
            ->where('statut', 'trial')
            ->update(['statut' => 'essai']);

        DB::table('tenants')
            ->where('statut', 'active')
            ->update(['statut' => 'actif']);

        DB::table('tenants')
            ->where('statut', 'expired')
            ->update(['statut' => 'expire']);

        DB::table('tenants')
            ->where('statut', 'suspended')
            ->update(['statut' => 'suspendu']);

        Schema::table('tenants', function (Blueprint $table) {
            $table->string('statut')->default('essai')->change();
        });
    }

    public function down(): void
    {
        DB::table('tenants')
            ->where('statut', 'essai')
            ->update(['statut' => 'trial']);

        DB::table('tenants')
            ->where('statut', 'actif')
            ->update(['statut' => 'active']);

        DB::table('tenants')
            ->where('statut', 'expire')
            ->update(['statut' => 'expired']);

        DB::table('tenants')
            ->where('statut', 'suspendu')
            ->update(['statut' => 'suspended']);

        Schema::table('tenants', function (Blueprint $table) {
            $table->string('statut')->default('trial')->change();
        });
    }
};
