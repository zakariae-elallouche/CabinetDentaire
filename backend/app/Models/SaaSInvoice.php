<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SaaSInvoice extends Model
{
    protected $table = 'saas_invoices';

    protected $fillable = [
        'tenant_id',
        'numero',
        'subscription_id',
        'montant',
        'devise',
        'statut',
        'methode_paiement',
        'date_echeance',
        'date_paiement',
        'pdf_url',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_echeance' => 'datetime',
            'date_paiement' => 'datetime',
        ];
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }
}
