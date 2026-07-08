<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('factures', function (Blueprint $table) {
            $table->id();
            $table->string('numero_facture')->unique();
            $table->foreignId('visite_id')->constrained('visites')->onDelete('cascade');
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('secretaire_id')->nullable()->constrained('secretaires')->onDelete('set null');
            $table->date('date_facture');
            $table->decimal('frais_visite_base', 10, 2)->default(0);
            $table->decimal('frais_operations', 10, 2)->default(0);
            $table->decimal('montant_total', 10, 2)->default(0);
            $table->string('statut')->default('en_attente');
            $table->date('date_paiement')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('factures');
    }
};
