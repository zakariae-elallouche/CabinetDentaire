<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Utilisateur;
use App\Models\Patient;
use App\Models\Secretaire;
use App\Models\Dentiste;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = Utilisateur::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect.'], 401);
        }

        $user->update(['derniere_connexion' => now()]);

        $abilities = $user->tenant_id ? ["tenant:{$user->tenant_id}"] : [];
        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        $tenantStatut = null;
        if ($user->tenant_id) {
            $tenant = Tenant::find($user->tenant_id);
            $tenantStatut = $tenant?->statut;
        }

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'email' => $user->email,
                'role'  => strtoupper($user->role),
                'nom'   => $user->nom,
                'prenom'=> $user->prenom,
            ],
            'tenant_branding' => $this->getBranding($user->tenant_id),
            'tenant_statut' => $tenantStatut,
        ]);
    }

    private function getBranding(?int $tenantId): ?array
    {
        if (!$tenantId) return null;
        $tenant = Tenant::find($tenantId);
        if (!$tenant) return null;
        return $tenant->only(['nom_clinique']);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    public function clinicInfo(string $slug)
    {
        $tenant = Tenant::where('slug', $slug)->firstOrFail();

        return response()->json($tenant->only([
            'nom_clinique', 'slug', 'adresse', 'ville',
        ]));
    }

    public function register(Request $request)
    {
        if ($request->slug === null || $request->slug === '') {
            $request->merge(['slug' => null]);
        }

        $request->validate([
            'email'                 => 'required|email|unique:utilisateurs,email',
            'password'              => 'required|string|min:6|confirmed',
            'nom'                   => 'required',
            'prenom'                => 'required',
            'telephone'             => 'required',
            'date_naissance'        => 'required|date',
            'sexe'                  => 'required|in:masculin,feminin',
            'slug'                  => 'nullable|string|exists:tenants,slug',
        ]);

        $tenantId = $request->slug
            ? Tenant::where('slug', $request->slug)->value('id')
            : tenant_id();

        $user = Utilisateur::create([
            'tenant_id' => $tenantId,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => 'patient',
            'nom'      => $request->nom,
            'prenom'   => $request->prenom,
        ]);

        $patient = Patient::create([
            'tenant_id'        => $tenantId,
            'utilisateur_id'   => $user->id,
            'telephone'        => $request->telephone,
            'sexe'             => $request->sexe,
            'adresse'          => $request->adresse,
            'date_naissance'   => $request->date_naissance,
            'contact_urgence'  => $request->contact_urgence,
            'notes_generales'  => $request->notes_generales,
        ]);

        if ($request->slug) {
            NotificationService::nouveauPatient($patient);
        }

        $abilities = $tenantId ? ["tenant:{$tenantId}"] : [];
        $token = $user->createToken('auth_token', $abilities)->plainTextToken;

        return response()->json([
            'user'  => [
                'id'    => $user->id,
                'email' => $user->email,
                'role'  => strtoupper($user->role),
                'nom'   => $user->nom,
                'prenom'=> $user->prenom,
            ],
            'token' => $token,
            'tenant_branding' => $this->getBranding($tenantId),
        ], 201);
    }

    public function profile(Request $request)
    {
        $user = $request->user();

        $data = match($user->role) {
            'patient' => (function () use ($user) {
                $p = Patient::where('utilisateur_id', $user->id)->firstOrFail();
                $p->nom = $user->nom;
                $p->prenom = $user->prenom;
                return $p;
            })(),
            'dentiste' => (function () use ($user) {
                $d = Dentiste::where('utilisateur_id', $user->id)->firstOrFail();
                $d->nom = $user->nom;
                $d->prenom = $user->prenom;
                return $d;
            })(),
            'secretaire' => (function () use ($user) {
                $s = Secretaire::where('utilisateur_id', $user->id)->firstOrFail();
                $s->nom = $user->nom;
                $s->prenom = $user->prenom;
                return $s;
            })(),
            'admin_clinique' => array_merge(
                Tenant::find($user->tenant_id)?->only(['nom_clinique', 'slug', 'email_contact', 'telephone', 'ville', 'statut']) ?? [],
                ['nom' => $user->nom, 'prenom' => $user->prenom]
            ),
            'superadmin'     => ['email' => $user->email, 'role' => strtoupper($user->role), 'nom' => $user->nom, 'prenom' => $user->prenom],
            default          => abort(403),
        };

        $tenantStatut = null;
        if ($user->tenant_id) {
            $tenant = Tenant::find($user->tenant_id);
            $tenantStatut = $tenant?->statut;
        }

        return response()->json([
            'user'    => [
                'id'    => $user->id,
                'email' => $user->email,
                'role'  => strtoupper($user->role),
                'nom'   => $user->nom,
                'prenom'=> $user->prenom,
            ],
            'profile' => $data,
            'tenant_branding' => $this->getBranding($user->tenant_id),
            'tenant_statut' => $tenantStatut,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            $user->update($request->only(['nom', 'prenom']));
            $patient = Patient::where('utilisateur_id', $user->id)->firstOrFail();
            $patient->update($request->only([
                'telephone', 'adresse',
                'date_naissance', 'sexe', 'contact_urgence', 'notes_generales',
            ]));
            return response()->json(['profile' => $patient->fresh()]);
        }

        if ($user->role === 'dentiste') {
            $user->update($request->only(['nom', 'prenom']));
            $dentiste = Dentiste::where('utilisateur_id', $user->id)->firstOrFail();
            $dentiste->update($request->only(['telephone', 'specialite']));
            return response()->json(['profile' => $dentiste->fresh()]);
        }

        if ($user->role === 'secretaire') {
            $user->update($request->only(['nom', 'prenom']));
            $sec = Secretaire::where('utilisateur_id', $user->id)->firstOrFail();
            $sec->update($request->only(['telephone']));
            return response()->json(['profile' => $sec->fresh()]);
        }

        if ($user->role === 'admin_clinique') {
            $user->update($request->only(['nom', 'prenom']));
            $tenant = Tenant::findOrFail($user->tenant_id);
            $tenant->update($request->only(['nom_clinique', 'email_contact', 'telephone', 'adresse', 'ville']));
            return response()->json(['profile' => array_merge(
                $tenant->fresh()->only(['nom_clinique', 'slug', 'email_contact', 'telephone', 'ville', 'statut']),
                ['nom' => $user->fresh()->nom, 'prenom' => $user->fresh()->prenom]
            )]);
        }

        abort(403);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'ancien'  => 'required',
            'nouveau' => 'required|min:6',
        ]);

        $user = $request->user();

        if (!Hash::check($request->ancien, $user->password)) {
            throw ValidationException::withMessages([
                'ancien' => 'Ancien mot de passe incorrect.',
            ]);
        }

        $user->update(['password' => Hash::make($request->nouveau)]);

        return response()->json(['message' => 'Mot de passe modifié avec succès.']);
    }
}
