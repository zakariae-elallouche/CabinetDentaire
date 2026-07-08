<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Ordonnance extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'visite_id',
        'patient_id',
        'dentiste_id',
        'date_delivrance',
        'instructions_generales',
        'statut',
    ];

    public function medicaments() { return $this->hasMany(OrdonnanceMedicament::class); }
}
