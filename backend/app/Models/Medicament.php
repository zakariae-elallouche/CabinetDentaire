<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Medicament extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'nom',
        'description',
        'forme',
        'dosage',
    ];
}
