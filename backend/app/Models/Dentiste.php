<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Dentiste extends Model
{
    use BelongsToTenant;

    protected $appends = ['nom', 'prenom'];

    protected $fillable = [
        'tenant_id',
        'utilisateur_id',
        'specialite',
        'biographie',
        'photo',
    ];

    public function utilisateur()
    {
        return $this->belongsTo(Utilisateur::class);
    }

    public function getNomAttribute()
    {
        return $this->utilisateur?->nom;
    }

    public function getPrenomAttribute()
    {
        return $this->utilisateur?->prenom;
    }
}
