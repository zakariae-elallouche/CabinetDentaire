<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClinicRegistrationController extends Controller
{
    public function checkSlug(string $slug)
    {
        $exists = Tenant::where('slug', $slug)->exists();

        return response()->json([
            'slug' => $slug,
            'available' => !$exists,
        ]);
    }

    public function register(Request $request)
    {
        $request->validate([
            'nom_clinique' => 'required|string|max:255',
            'slug' => 'required|string|max:50|alpha_dash|unique:tenants,slug',
            'email' => 'required|email|unique:utilisateurs,email',
            'password' => 'required|string|min:6|confirmed',
            'telephone' => 'required|string|max:20',
            'ville' => 'required|string|max:100',
            'nom_admin' => 'required|string|max:255',
            'prenom_admin' => 'required|string|max:255',
        ]);

        $tenant = Tenant::create([
            'nom_clinique' => $request->nom_clinique,
            'slug' => $request->slug,
            'email_contact' => $request->email,
            'telephone' => $request->telephone,
            'ville' => $request->ville,
            'statut' => 'essai',
            'trial_ends_at' => now()->addDays(30),
        ]);

        $user = Utilisateur::create([
            'tenant_id' => $tenant->id,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'admin_clinique',
            'statut' => 'actif',
            'nom' => $request->nom_admin,
            'prenom' => $request->prenom_admin,
        ]);

        $token = $user->createToken('auth_token', ["tenant:{$tenant->id}"])->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'role' => 'ADMIN_CLINIQUE',
            ],
            'tenant' => [
                'id' => $tenant->id,
                'nom_clinique' => $tenant->nom_clinique,
                'slug' => $tenant->slug,
                'statut' => $tenant->statut,
                'trial_ends_at' => $tenant->trial_ends_at,
            ],
        ], 201);
    }
}
