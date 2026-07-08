<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['patients', 'dentistes', 'secretaires'] as $table) {
            DB::table($table)->orderBy('id')->each(function ($row) use ($table) {
                if ($row->nom || $row->prenom) {
                    DB::table('utilisateurs')
                        ->where('id', $row->utilisateur_id)
                        ->update([
                            'nom'    => $row->nom,
                            'prenom' => $row->prenom,
                        ]);
                }
            });
        }
    }

    public function down(): void
    {
        DB::table('utilisateurs')->update(['nom' => null, 'prenom' => null]);
    }
};
