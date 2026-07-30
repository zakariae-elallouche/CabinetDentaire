<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Auth\Passwords\CanResetPassword;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Utilisateur extends Authenticatable
{
    use BelongsToTenant, HasApiTokens, CanResetPassword;

    protected $fillable = [
        'tenant_id',
        'email',
        'nom',
        'prenom',
        'telephone',
        'password',
        'role',
        'statut',
        'derniere_connexion',
    ];

    protected $hidden = ['password'];

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function patient()
    {
        return $this->hasOne(Patient::class);
    }

    public function dentiste()
    {
        return $this->hasOne(Dentiste::class);
    }

    public function secretaire()
    {
        return $this->hasOne(Secretaire::class);
    }
}
