<?php

namespace App\Services;

use App\Models\Audit;

class AuditService
{
    public static function log(
        string $action,
        string $table,
        int    $recordId,
        ?array $ancienne = null,
        ?array $nouvelle = null
    ): void {
        Audit::create([
            'tenant_id'         => tenant_id(),
            'utilisateur_id'    => auth()->id(),
            'action'            => $action,
            'table_affectee'    => $table,
            'id_enregistrement' => $recordId,
            'ancienne_valeur'   => $ancienne ? json_encode($ancienne) : null,
            'nouvelle_valeur'   => $nouvelle ? json_encode($nouvelle) : null,
            'adresse_ip'        => request()->ip(),
        ]);
    }
}
