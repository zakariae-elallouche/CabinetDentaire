<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->json('horaires')->nullable()->after('couleur_primaire');
            $table->decimal('frais_visite', 10, 2)->default(0)->after('horaires');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['horaires', 'frais_visite']);
        });
    }
};
