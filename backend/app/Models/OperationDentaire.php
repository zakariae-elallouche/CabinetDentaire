<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class OperationDentaire extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'visite_id',
        'nom_operation',
        'description',
        'cout',
        'date_effectuee',
    ];
}
