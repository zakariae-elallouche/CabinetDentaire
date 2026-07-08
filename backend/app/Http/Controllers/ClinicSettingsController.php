<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;

class ClinicSettingsController extends Controller
{
    public function index(Request $request)
    {
        $tenant = Tenant::findOrFail($request->user()->tenant_id);

        return response()->json($tenant->only([
            'nom_clinique', 'slug', 'email_contact', 'telephone',
            'adresse', 'ville',
            'horaires', 'frais_visite',
        ]));
    }

    public function update(Request $request)
    {
        $tenant = Tenant::findOrFail($request->user()->tenant_id);

        $request->validate([
            'nom_clinique'    => 'sometimes|required|string|max:255',
            'email_contact'   => 'sometimes|required|email|max:255',
            'telephone'       => 'nullable|string|max:50',
            'adresse'         => 'nullable|string',
            'ville'           => 'nullable|string|max:255',
            'horaires'        => 'nullable|array',
            'frais_visite'    => 'nullable|numeric|min:0',
        ]);

        $tenant->update($request->only([
            'nom_clinique', 'email_contact', 'telephone',
            'adresse', 'ville',
            'horaires', 'frais_visite',
        ]));

        return response()->json($tenant->fresh()->only([
            'nom_clinique', 'slug', 'email_contact', 'telephone',
            'adresse', 'ville',
            'horaires', 'frais_visite',
        ]));
    }
}
