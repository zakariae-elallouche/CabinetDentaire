<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    use BelongsToTenant;

    protected $appends = ['nom', 'prenom'];

    protected $fillable = [
        'tenant_id',
        'utilisateur_id',
        'telephone',
        'adresse',
        'date_naissance',
        'sexe',
        'contact_urgence',
        'notes_generales',
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
