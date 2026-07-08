<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use Closure;
use Illuminate\Http\Request;

class CheckSubscription
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if (!$user) {
            return $next($request);
        }

        // SuperAdmin bypasses all subscription checks
        if ($user->role === 'superadmin') {
            return $next($request);
        }

        // Allow /me so frontend can retrieve tenant status
        if ($request->is('api/me')) {
            return $next($request);
        }

        // Try to resolve tenant from container (set by TenantMiddleware), otherwise fetch from DB
        try {
            $tenant = app(Tenant::class);
        } catch (\Throwable) {
            $tenant = null;
        }

        if (!$tenant && $user->tenant_id) {
            $tenant = Tenant::find($user->tenant_id);
        }

        if (!$tenant) {
            return $next($request);
        }

        // Block suspended / inactive tenants
        if (in_array($tenant->statut, ['suspendu', 'expire', 'inactif'], true)) {
            return response()->json([
                'message' => 'Votre abonnement est suspendu. Contactez le support.',
            ], 403);
        }

        // If trial period has expired and no active subscription, block
        $trialExpired = $tenant->trial_ends_at && $tenant->trial_ends_at->isPast();
        if ($trialExpired) {
            $hasActiveSubscription = $tenant->subscriptions()
                ->where('statut', 'active')
                ->where('fin_periode', '>=', now())
                ->exists();

            if (!$hasActiveSubscription) {
                return response()->json([
                    'message' => 'Votre période d\'essai a expiré. Veuillez souscrire à un abonnement.',
                ], 402);
            }
        }

        return $next($request);
    }
}
