<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subscription extends Model
{
    protected $fillable = [
        'tenant_id',
        'statut',
        'montant',
        'devise',
        'methode_paiement',
        'debut_periode',
        'fin_periode',
        'auto_renouvellement',
    ];

    protected function casts(): array
    {
        return [
            'debut_periode' => 'datetime',
            'fin_periode' => 'datetime',
            'auto_renouvellement' => 'boolean',
        ];
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function invoices()
    {
        return $this->hasMany(SaaSInvoice::class, 'subscription_id');
    }
}
