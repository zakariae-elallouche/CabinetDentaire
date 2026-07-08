<?php

namespace App\Http\Controllers;

use App\Models\Medicament;
use Illuminate\Http\Request;

class MedicamentController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->user()->role;
        if (!in_array($role, ['dentiste', 'secretaire', 'admin_clinique'])) abort(403);

        return response()->json(Medicament::all());
    }

    public function store(Request $request)
    {
        if (!in_array($request->user()->role, ['secretaire', 'admin_clinique'], true)) abort(403);

        $request->validate([
            'nom'         => 'required|string',
            'description' => 'nullable|string',
            'forme'       => 'nullable|string',
            'dosage'      => 'nullable|string',
        ]);

        $medicament = Medicament::create(array_merge($request->only(['nom', 'description', 'forme', 'dosage']), [
            'tenant_id' => tenant_id(),
        ]));

        return response()->json($medicament, 201);
    }

    public function update(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['secretaire', 'admin_clinique'], true)) abort(403);

        $request->validate([
            'nom'         => 'sometimes|required|string',
            'description' => 'nullable|string',
            'forme'       => 'nullable|string',
            'dosage'      => 'nullable|string',
        ]);

        $medicament = Medicament::findOrFail($id);
        $medicament->update($request->only(['nom', 'description', 'forme', 'dosage']));

        return response()->json($medicament);
    }

    public function destroy(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['secretaire', 'admin_clinique'], true)) abort(403);

        Medicament::findOrFail($id)->delete();

        return response()->json(['message' => 'Médicament supprimé.']);
    }
}
