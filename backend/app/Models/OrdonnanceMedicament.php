<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class OrdonnanceMedicament extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'ordonnance_id',
        'medicament_id',
        'frequence',
        'duree_jours',
        'instructions_speciales',
    ];

    public function medicament() { return $this->belongsTo(Medicament::class); }
}
