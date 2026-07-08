<?php

use App\Models\Tenant;

if (!function_exists('tenant_id')) {
    function tenant_id(): ?int
    {
        return app()->resolved(Tenant::class) ? app(Tenant::class)->id : null;
    }
}

if (!function_exists('tenant')) {
    function tenant(): ?Tenant
    {
        return app()->resolved(Tenant::class) ? app(Tenant::class) : null;
    }
}
