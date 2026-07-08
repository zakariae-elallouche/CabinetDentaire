<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'slug',
        'nom',
        'prix_mensuel',
        'nb_dentistes_max',
        'nb_patients_max',
        'features',
        'actif',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
            'prix_mensuel' => 'integer',
            'actif' => 'boolean',
        ];
    }
}
