<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use App\Models\Dentiste;
use App\Models\Secretaire;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class InvitationController extends Controller
{
    public function index(Request $request)
    {
        $members = Utilisateur::where('tenant_id', tenant_id())
            ->whereIn('role', ['dentiste', 'secretaire'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($u) {
                $profile = null;
                if ($u->role === 'dentiste') {
                    $profile = Dentiste::where('utilisateur_id', $u->id)->first();
                } elseif ($u->role === 'secretaire') {
                    $profile = Secretaire::where('utilisateur_id', $u->id)->first();
                }
                return [
                    'id'            => $u->id,
                    'email'         => $u->email,
                    'role'          => $u->role,
                    'statut'        => $u->statut,
                    'nom'           => $u->nom,
                    'prenom'        => $u->prenom,
                    'numero_employe'=> $profile?->numero_employe ?? null,
                    'created_at'    => $u->created_at,
                ];
            });

        return response()->json($members);
    }

    public function send(Request $request)
    {
        $request->validate([
            'email'  => 'required|email',
            'role'   => 'required|in:dentiste,secretaire',
            'nom'    => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
        ]);

        $existing = Utilisateur::where('email', $request->email)->first();
        if ($existing) {
            return response()->json(['message' => 'Cet email est déjà utilisé.'], 422);
        }

        $password = str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);

        $user = Utilisateur::create([
            'tenant_id' => tenant_id(),
            'email'     => $request->email,
            'password'  => Hash::make($password),
            'role'      => $request->role,
            'statut'    => 'actif',
            'nom'       => $request->nom,
            'prenom'    => $request->prenom,
        ]);

        if ($request->role === 'dentiste') {
            Dentiste::create([
                'tenant_id'      => tenant_id(),
                'utilisateur_id' => $user->id,
            ]);
        } elseif ($request->role === 'secretaire') {
            Secretaire::create([
                'tenant_id'      => tenant_id(),
                'utilisateur_id' => $user->id,
                'numero_employe' => 'EMP-' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
            ]);
        }
    }

    public function resetPassword(Request $request, $id)
    {
        $user = Utilisateur::where('tenant_id', tenant_id())->findOrFail($id);

        $password = str_pad((string) random_int(0, 99999999), 8, '0', STR_PAD_LEFT);
        $user->update(['password' => Hash::make($password)]);

        return response()->json([
            'id'       => $user->id,
            'email'    => $user->email,
            'password' => $password,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = Utilisateur::where('tenant_id', tenant_id())
            ->whereIn('role', ['dentiste', 'secretaire'])
            ->findOrFail($id);

        Dentiste::where('utilisateur_id', $user->id)->delete();
        Secretaire::where('utilisateur_id', $user->id)->delete();
        $user->delete();

        return response()->json(['message' => 'Membre supprimé.']);
    }
}
