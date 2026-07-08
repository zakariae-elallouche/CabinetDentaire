<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'facture_id',
        'secretaire_id',
        'montant_recu',
        'date_paiement',
        'methode_paiement',
        'numero_recu',
        'notes',
    ];
}
