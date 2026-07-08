<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'numero_facture',
        'visite_id',
        'patient_id',
        'secretaire_id',
        'date_facture',
        'frais_visite_base',
        'frais_operations',
        'montant_total',
        'statut',
        'date_paiement',
        'notes',
    ];

    public function patient() { return $this->belongsTo(Patient::class); }
    public function visite()  { return $this->belongsTo(Visite::class); }
}
