<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Utilisateur;
use App\Models\Visite;
use App\Models\Ordonnance;
use App\Models\Facture;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->user()->role;

        if (!in_array($role, ['secretaire', 'dentiste', 'admin_clinique'])) {
            abort(403);
        }

        return response()->json(Patient::all());
    }

    public function show(Request $request, $id)
    {
        $user    = $request->user();
        $patient = Patient::findOrFail($id);

        if ($user->role === 'patient' && $patient->utilisateur_id !== $user->id) {
            abort(403);
        }

        return response()->json($patient);
    }

    public function update(Request $request, $id)
    {
        $user    = $request->user();
        $patient = Patient::findOrFail($id);

        if ($user->role === 'patient' && $patient->utilisateur_id !== $user->id) {
            abort(403);
        }

        $request->validate([
            'nom'             => 'required',
            'prenom'          => 'required',
            'telephone'       => 'required',
            'adresse'         => 'nullable',
            'date_naissance'  => 'required|date',
            'sexe'            => 'required|in:masculin,feminin',
            'contact_urgence' => 'nullable',
            'notes_generales' => 'nullable',
        ]);

        $utilisateur = Utilisateur::findOrFail($patient->utilisateur_id);
        $utilisateur->update($request->only(['nom', 'prenom']));

        $patient->update($request->only([
            'telephone', 'adresse',
            'date_naissance', 'sexe', 'contact_urgence', 'notes_generales',
        ]));

        return response()->json($patient->fresh());
    }

    public function history(Request $request, $id)
    {
        $user    = $request->user();
        $patient = Patient::findOrFail($id);

        if ($user->role === 'patient' && $patient->utilisateur_id !== $user->id) {
            abort(403);
        }

        return response()->json([
            'visites'     => Visite::where('patient_id', $id)->get(),
            'ordonnances' => Ordonnance::where('patient_id', $id)->get(),
            'factures'    => Facture::where('patient_id', $id)->get(),
        ]);
    }
}
