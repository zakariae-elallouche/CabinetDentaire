<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = [
        'nom_clinique',
        'slug',
        'email_contact',
        'telephone',
        'adresse',
        'ville',
        'statut',
        'trial_ends_at',
        'subscription_starts_at',
        'subscription_ends_at',
        'horaires',
        'frais_visite',
    ];

    protected function casts(): array
    {
        return [
            'trial_ends_at' => 'datetime',
            'subscription_starts_at' => 'datetime',
            'subscription_ends_at' => 'datetime',
            'horaires' => 'array',
            'frais_visite' => 'decimal:2',
        ];
    }

    public function utilisateurs() { return $this->hasMany(Utilisateur::class); }
    public function patients() { return $this->hasMany(Patient::class); }
    public function secretaires() { return $this->hasMany(Secretaire::class); }
    public function dentistes() { return $this->hasMany(Dentiste::class); }
    public function rendezVous() { return $this->hasMany(RendezVous::class); }
    public function visites() { return $this->hasMany(Visite::class); }
    public function factures() { return $this->hasMany(Facture::class); }
    public function paiements() { return $this->hasMany(Paiement::class); }
    public function ordonnances() { return $this->hasMany(Ordonnance::class); }
    public function notifications() { return $this->hasMany(Notification::class); }
    public function audits() { return $this->hasMany(Audit::class); }
    public function subscriptions() { return $this->hasMany(Subscription::class); }
}
