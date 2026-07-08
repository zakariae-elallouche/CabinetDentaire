<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class CatalogueOperation extends Model
{
    use BelongsToTenant;

    protected $table = 'catalogue_operations';

    protected $fillable = [
        'tenant_id',
        'nom',
        'description',
        'cout',
    ];
}
