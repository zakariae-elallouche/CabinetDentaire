<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;

class TenantMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $tenant = null;
        $user = $request->user();

        if ($user && $user->role === 'superadmin') {
            return $next($request);
        }

        if ($headerId = $request->header('X-Tenant-Id')) {
            $tenant = Tenant::find($headerId);
        }

        if (!$tenant && $user && $user->tenant_id) {
            $tenant = Tenant::find($user->tenant_id);
        }

        if (!$tenant && $user) {
            $token = $user->currentAccessToken();
            if ($token) {
                foreach ($token->abilities as $ability) {
                    if (str_starts_with($ability, 'tenant:')) {
                        $tenant = Tenant::find((int) substr($ability, 7));
                        break;
                    }
                }
            }
        }

        if ($tenant) {
            app()->instance(Tenant::class, $tenant);
        }

        return $next($request);
    }
}
