<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rendez_vous', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('dentiste_id')->constrained('dentistes')->onDelete('cascade');
            $table->foreignId('secretaire_id')->nullable()->constrained('secretaires')->onDelete('set null');
            $table->datetime('date_heure');
            $table->integer('duree')->default(30);
            $table->text('raison')->nullable();
            $table->string('statut')->default('en_attente');
            $table->text('notes')->nullable();
            $table->datetime('cree_le')->useCurrent();
            $table->datetime('confirme_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rendez_vous');
    }
};
