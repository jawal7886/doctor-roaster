<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Specialty;
use Illuminate\Http\Request;

class SpecialtyController extends Controller
{
    public function index()
    {
        $specialties = Specialty::orderBy('name')->get();
        return response()->json($specialties);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:specialties',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $specialty = Specialty::create($validated);

        return response()->json([
            'message' => 'Specialty created successfully',
            'specialty' => $specialty
        ], 201);
    }

    public function show(Specialty $specialty)
    {
        return response()->json($specialty);
    }

    public function update(Request $request, Specialty $specialty)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:specialties,name,' . $specialty->id,
            'description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $specialty->update($validated);

        return response()->json([
            'message' => 'Specialty updated successfully',
            'specialty' => $specialty
        ]);
    }

    public function destroy(Specialty $specialty)
    {
        // Check if specialty is in use
        if ($specialty->users()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete specialty that is assigned to doctors'
            ], 422);
        }

        $specialty->delete();

        return response()->json([
            'message' => 'Specialty deleted successfully'
        ]);
    }
}
