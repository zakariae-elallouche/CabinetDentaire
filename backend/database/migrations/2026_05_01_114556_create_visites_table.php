<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visites', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rendezvous_id')->nullable()->constrained('rendez_vous')->onDelete('set null');
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('dentiste_id')->constrained('dentistes')->onDelete('cascade');
            $table->date('date_visite');
            $table->text('diagnostic')->nullable();
            $table->text('traitement_fourni')->nullable();
            $table->text('notes')->nullable();
            $table->string('statut')->default('en_cours');
            $table->datetime('cree_le')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visites');
    }
};
