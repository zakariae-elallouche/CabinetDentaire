<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('plan');
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropColumn('plan');
        });

        Schema::dropIfExists('plans');
    }

    public function down(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('nom');
            $table->integer('prix_mensuel');
            $table->integer('nb_dentistes_max')->nullable();
            $table->integer('nb_patients_max')->nullable();
            $table->json('features');
            $table->boolean('actif')->default(true);
            $table->timestamps();
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->string('plan')->default('starter');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->string('plan')->default('starter');
        });
    }
};
