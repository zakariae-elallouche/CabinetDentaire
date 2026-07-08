<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Audit extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'utilisateur_id',
        'action',
        'table_affectee',
        'id_enregistrement',
        'ancienne_valeur',
        'nouvelle_valeur',
        'adresse_ip',
    ];
}
