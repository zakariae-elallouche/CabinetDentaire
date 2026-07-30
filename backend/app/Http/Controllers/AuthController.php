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

        $profile = $this->loadProfile($user);
        $tenantStatut = null;
        $branding = null;
        if ($user->tenant_id) {
            $tenant = Tenant::find($user->tenant_id);
            $tenantStatut = $tenant?->statut;
            $branding = $tenant?->only(['nom_clinique']);
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
            'profile' => $profile,
            'tenant_branding' => $branding,
            'tenant_statut' => $tenantStatut,
        ]);
    }

    private function loadProfile($user): array
    {
        return match($user->role) {
            'patient' => (function () use ($user) {
                $p = Patient::where('utilisateur_id', $user->id)->firstOrFail();
                $p->nom = $user->nom;
                $p->prenom = $user->prenom;
                $p->telephone = $user->telephone ?? $p->telephone;
                return $p->toArray();
            })(),
            'dentiste' => (function () use ($user) {
                $d = Dentiste::where('utilisateur_id', $user->id)->firstOrFail();
                $d->nom = $user->nom;
                $d->prenom = $user->prenom;
                $d->telephone = $user->telephone;
                return $d->toArray();
            })(),
            'secretaire' => (function () use ($user) {
                $s = Secretaire::where('utilisateur_id', $user->id)->firstOrFail();
                $s->nom = $user->nom;
                $s->prenom = $user->prenom;
                $s->telephone = $user->telephone;
                return $s->toArray();
            })(),
            'admin_clinique' => array_merge(
                Tenant::find($user->tenant_id)?->only(['nom_clinique', 'slug', 'email_contact', 'ville', 'statut']) ?? [],
                ['nom' => $user->nom, 'prenom' => $user->prenom, 'telephone' => $user->telephone]
            ),
            'superadmin'     => ['email' => $user->email, 'role' => strtoupper($user->role), 'nom' => $user->nom, 'prenom' => $user->prenom],
            default          => abort(403),
        };
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
                $p->telephone = $user->telephone ?? $p->telephone;
                return $p;
            })(),
            'dentiste' => (function () use ($user) {
                $d = Dentiste::where('utilisateur_id', $user->id)->firstOrFail();
                $d->nom = $user->nom;
                $d->prenom = $user->prenom;
                $d->telephone = $user->telephone;
                return $d;
            })(),
            'secretaire' => (function () use ($user) {
                $s = Secretaire::where('utilisateur_id', $user->id)->firstOrFail();
                $s->nom = $user->nom;
                $s->prenom = $user->prenom;
                $s->telephone = $user->telephone;
                return $s;
            })(),
            'admin_clinique' => array_merge(
                Tenant::find($user->tenant_id)?->only(['nom_clinique', 'slug', 'email_contact', 'ville', 'statut']) ?? [],
                ['nom' => $user->nom, 'prenom' => $user->prenom, 'telephone' => $user->telephone]
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

        $user->update($request->only(['nom', 'prenom', 'telephone']));

        if ($user->role === 'patient') {
            $patient = Patient::where('utilisateur_id', $user->id)->firstOrFail();
            $patient->update($request->only([
                'adresse', 'date_naissance', 'sexe', 'contact_urgence', 'notes_generales',
            ]));
            if ($request->has('telephone')) {
                $patient->update(['telephone' => $request->telephone]);
            }
            $profile = $patient->fresh();
            $profile->telephone = $user->fresh()->telephone;
            return response()->json(['profile' => $profile]);
        }

        if ($user->role === 'dentiste') {
            $dentiste = Dentiste::where('utilisateur_id', $user->id)->firstOrFail();
            $dentiste->update($request->only(['specialite']));
            $profile = $dentiste->fresh();
            $profile->telephone = $user->fresh()->telephone;
            return response()->json(['profile' => $profile]);
        }

        if ($user->role === 'secretaire') {
            $profile = Secretaire::where('utilisateur_id', $user->id)->firstOrFail();
            $profile = $profile->fresh();
            $profile->telephone = $user->fresh()->telephone;
            return response()->json(['profile' => $profile]);
        }

        if ($user->role === 'admin_clinique') {
            $tenant = Tenant::findOrFail($user->tenant_id);
            $tenant->update($request->only(['nom_clinique', 'email_contact', 'adresse', 'ville']));
            if ($request->has('telephone')) {
                $tenant->update(['telephone' => $request->telephone]);
            }
            $fresh = $user->fresh();
            return response()->json(['profile' => array_merge(
                $tenant->fresh()->only(['nom_clinique', 'slug', 'email_contact', 'ville', 'statut']),
                ['nom' => $fresh->nom, 'prenom' => $fresh->prenom, 'telephone' => $fresh->telephone]
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
