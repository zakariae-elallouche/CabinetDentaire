<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'utilisateur_id',
        'type',
        'titre',
        'message',
        'donnees',
        'lu',
        'lu_le',
    ];

    protected $casts = [
        'donnees' => 'array',
        'lu'      => 'boolean',
        'lu_le'   => 'datetime',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }
}
