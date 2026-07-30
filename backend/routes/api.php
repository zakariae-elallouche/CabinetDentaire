<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\RendezVousController;
use App\Http\Controllers\VisiteController;
use App\Http\Controllers\OperationController;
use App\Http\Controllers\MedicamentController;
use App\Http\Controllers\OrdonnanceController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ClinicRegistrationController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\SuperAdminController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ClinicSettingsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PasswordResetController;

// Routes publiques (pas de token requis) — limitées pour la sécurité
Route::get('/health', fn() => response()->json(['status' => 'ok', 'time' => now()->toIso8601String()]));
Route::post('/login',              [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/register',            [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/register-clinic',     [ClinicRegistrationController::class, 'register'])->middleware('throttle:10,1');
Route::get('/check-slug/{slug}',    [ClinicRegistrationController::class, 'checkSlug']);
Route::get('/clinics/{slug}',       [AuthController::class, 'clinicInfo']);
Route::post('/forgot-password',     [PasswordResetController::class, 'sendResetLink'])->middleware('throttle:10,1');
Route::post('/reset-password',      [PasswordResetController::class, 'reset'])->middleware('throttle:10,1');

// Routes protégées (token Sanctum requis + résolution tenant + abonnement actif)
Route::middleware(['auth:sanctum', 'tenant', 'subscription'])->group(function () {

    Route::post('/logout',   [AuthController::class, 'logout']);
    Route::get('/me',        [AuthController::class, 'profile']);
    Route::put('/me',        [AuthController::class, 'updateProfile']);
    Route::put('/password',  [AuthController::class, 'changePassword']);

    Route::get('/notifications',             [NotificationController::class, 'index']);
    Route::patch('/notifications/read-all',  [NotificationController::class, 'markAllRead']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);

    // Routes partagées — accessibles à tous les rôles connectés
    Route::get('/dashboard',                   [DashboardController::class, 'index']);
    Route::get('/patients',                    [PatientController::class, 'index']);
    Route::get('/patients/{id}',               [PatientController::class, 'show']);
    Route::get('/rendez-vous',                 [RendezVousController::class, 'index']);
    Route::get('/rendez-vous/available-slots', [RendezVousController::class, 'availableSlots']);
    Route::get('/rendez-vous/{id}',            [RendezVousController::class, 'show']);
    Route::get('/medicaments',                 [MedicamentController::class, 'index']);
    Route::get('/operations',                  [OperationController::class, 'index']);
    Route::get('/visites/{id}',               [VisiteController::class, 'show']);
    Route::get('/ordonnances/{id}',            [OrdonnanceController::class, 'show']);
    Route::get('/patient/{id}/visites',        [VisiteController::class, 'patientVisites']);
    Route::get('/patient/{id}/ordonnances',    [OrdonnanceController::class, 'patientOrdonnances']);
    Route::get('/patient/{id}/factures',       [FactureController::class, 'patientFactures']);
    Route::get('/patients/{id}/history',       [PatientController::class, 'history']);
    Route::delete('/rendez-vous/{id}',         [RendezVousController::class, 'destroy']);
    Route::get('/clinique/info', function (\Illuminate\Http\Request $r) {
        $t = $r->user()->tenant;
        return [
            'frais_visite' => (float)($t->frais_visite ?? 200),
            'horaires' => $t->horaires ?? [],
        ];
    });

    // Routes patient seulement
    Route::middleware('role:patient')->group(function () {
        Route::post('/rendez-vous', [RendezVousController::class, 'store']);
    });

    // Routes secrétaire + admin_clinique
    Route::middleware('role:secretaire|admin_clinique')->group(function () {
        Route::put('/patients/{id}',             [PatientController::class, 'update']);
        Route::put('/rendez-vous/{id}/confirm',  [RendezVousController::class, 'confirm']);
        Route::put('/rendez-vous/{id}/reject',   [RendezVousController::class, 'reject']);
        Route::get('/factures',                  [FactureController::class, 'index']);
        Route::get('/factures/report',           [FactureController::class, 'report']);
        Route::get('/factures/{id}',             [FactureController::class, 'show']);
        Route::post('/factures/{id}/payment',    [FactureController::class, 'payment']);
    });

    // Routes dentiste seulement
    Route::middleware('role:dentiste')->group(function () {
        Route::get('/dentiste/schedule',       [RendezVousController::class, 'dentisteSchedule']);
        Route::get('/dentiste/visites/today',  [VisiteController::class, 'today']);
        Route::post('/visites',                [VisiteController::class, 'store']);
        Route::post('/ordonnances',            [OrdonnanceController::class, 'store']);
    });

    // Routes admin_clinique seulement
    Route::middleware('role:admin_clinique')->group(function () {
        Route::get('/invitations',              [InvitationController::class, 'index']);
        Route::post('/invitations',             [InvitationController::class, 'send']);
        Route::put('/invitations/{id}/password', [InvitationController::class, 'resetPassword']);
        Route::delete('/invitations/{id}',      [InvitationController::class, 'destroy']);
        Route::get('/billing/status',           [BillingController::class, 'status']);
        Route::get('/billing/invoices',         [BillingController::class, 'invoices']);
        Route::post('/billing/subscribe',       [BillingController::class, 'subscribe']);

        // Paramètres clinique
        Route::get('/admin/settings',                    [ClinicSettingsController::class, 'index']);
        Route::put('/admin/settings',                    [ClinicSettingsController::class, 'update']);


        // Catalogue opérations
        Route::post('/operations',                       [OperationController::class, 'store']);
        Route::put('/operations/{id}',                   [OperationController::class, 'update']);
        Route::delete('/operations/{id}',                [OperationController::class, 'destroy']);

        // Médicaments
        Route::post('/medicaments',                      [MedicamentController::class, 'store']);
        Route::put('/medicaments/{id}',                  [MedicamentController::class, 'update']);
        Route::delete('/medicaments/{id}',               [MedicamentController::class, 'destroy']);
    });

    // Routes superadmin seulement
    Route::middleware('superadmin')->group(function () {
        Route::get('/superadmin/stats',                     [SuperAdminController::class, 'stats']);
        Route::get('/superadmin/stats/monthly',             [SuperAdminController::class, 'monthlyStats']);
        Route::get('/superadmin/tenants',                   [SuperAdminController::class, 'tenants']);
        Route::get('/superadmin/tenants/{id}',              [SuperAdminController::class, 'tenantShow']);
        Route::post('/superadmin/tenants/{id}/suspend',     [SuperAdminController::class, 'suspend']);
        Route::post('/superadmin/tenants/{id}/activate',    [SuperAdminController::class, 'activate']);
        Route::post('/superadmin/tenants/{id}/extend-trial',[SuperAdminController::class, 'extendTrial']);
        Route::post('/superadmin/invoices/{id}/confirm',    [BillingController::class, 'confirmPayment']);
        Route::post('/superadmin/tenants/{id}/invoice',     [SuperAdminController::class, 'createInvoice']);

        Route::get('/superadmin/plans',                    [SuperAdminController::class, 'plans']);
        Route::post('/superadmin/plans',                   [SuperAdminController::class, 'storePlan']);
        Route::put('/superadmin/plans/{id}',               [SuperAdminController::class, 'updatePlan']);
        Route::delete('/superadmin/plans/{id}',            [SuperAdminController::class, 'destroyPlan']);
    });
});
