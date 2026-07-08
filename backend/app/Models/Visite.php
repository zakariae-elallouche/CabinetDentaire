<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Visite extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'rendezvous_id',
        'patient_id',
        'dentiste_id',
        'date_visite',
        'diagnostic',
        'traitement_fourni',
        'notes',
        'statut',
    ];

    public function operations() { return $this->hasMany(OperationDentaire::class); }
    public function ordonnance() { return $this->hasOne(Ordonnance::class); }
    public function facture()    { return $this->hasOne(Facture::class); }
    public function patient()    { return $this->belongsTo(Patient::class); }
    public function dentiste()   { return $this->belongsTo(Dentiste::class); }
}
