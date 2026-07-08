<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('statut'); // trial, active, suspended, cancelled
            $table->string('plan'); // starter, pro, clinic
            $table->integer('montant')->default(0);
            $table->string('devise', 10)->default('MAD');
            $table->string('methode_paiement')->nullable(); // virement, carte, stripe
            $table->timestamp('debut_periode')->nullable();
            $table->timestamp('fin_periode')->nullable();
            $table->boolean('auto_renouvellement')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
