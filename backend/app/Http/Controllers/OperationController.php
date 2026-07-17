<?php

namespace App\Http\Controllers;

use App\Models\CatalogueOperation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class OperationController extends Controller
{
    public function index()
    {
        $data = Cache::remember('catalogue_operations', 3600, function () {
            return CatalogueOperation::paginate(25);
        });

        return response()->json($data);
    }

    public function store(Request $request)
    {
        if (!in_array($request->user()->role, ['secretaire', 'admin_clinique'], true)) abort(403);

        $request->validate([
            'nom'         => 'required|string|max:255',
            'description' => 'nullable|string',
            'cout'        => 'required|numeric|min:0',
        ]);

        $operation = CatalogueOperation::create(array_merge($request->only(['nom', 'description', 'cout']), [
            'tenant_id' => tenant_id(),
        ]));

        return response()->json($operation, 201);
    }

    public function update(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['secretaire', 'admin_clinique'], true)) abort(403);

        $request->validate([
            'nom'         => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'cout'        => 'sometimes|required|numeric|min:0',
        ]);

        $operation = CatalogueOperation::findOrFail($id);
        $operation->update($request->only(['nom', 'description', 'cout']));

        return response()->json($operation);
    }

    public function destroy(Request $request, $id)
    {
        if (!in_array($request->user()->role, ['secretaire', 'admin_clinique'], true)) abort(403);

        CatalogueOperation::findOrFail($id)->delete();

        return response()->json(['message' => 'Opération supprimée.']);
    }
}
