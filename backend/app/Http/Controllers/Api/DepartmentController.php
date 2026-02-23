<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
{
    /**
     * Display a listing of departments.
     */
    public function index()
    {
        $departments = Department::with('head')->where('is_active', true)->get();

        return response()->json([
            'success' => true,
            'data' => DepartmentResource::collection($departments)
        ]);
    }

    /**
     * Store a newly created department.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100|unique:departments,name',
            'description' => 'nullable|string',
            'head_id' => 'nullable|exists:users,id',
            'max_hours_per_doctor' => 'required|integer|min:1',
            'color' => 'required|string|max:7',
        ], [
            'name.unique' => 'A department with this name already exists.',
            'name.required' => 'Department name is required.',
            'max_hours_per_doctor.required' => 'Maximum hours per doctor is required.',
            'max_hours_per_doctor.min' => 'Maximum hours must be at least 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $department = Department::create($request->all());
        $department->load('head');

        // Notify all admins about new department
        $admins = \App\Models\User::whereHas('role', function($q) {
            $q->where('name', 'admin');
        })->get();
        foreach ($admins as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'title' => 'New Department Created',
                'message' => "A new department '{$department->name}' has been created.",
                'type' => 'general',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Department created successfully',
            'data' => new DepartmentResource($department)
        ], 201);
    }

    /**
     * Display the specified department.
     */
    public function show($id)
    {
        $department = Department::with(['head', 'users'])->find($id);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new DepartmentResource($department)
        ]);
    }

    /**
     * Update the specified department.
     */
    public function update(Request $request, $id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:100|unique:departments,name,' . $id,
            'description' => 'nullable|string',
            'head_id' => 'nullable|exists:users,id',
            'max_hours_per_doctor' => 'sometimes|required|integer|min:1',
            'color' => 'sometimes|required|string|max:7',
            'is_active' => 'sometimes|boolean',
        ], [
            'name.unique' => 'A department with this name already exists.',
            'name.required' => 'Department name is required.',
            'max_hours_per_doctor.required' => 'Maximum hours per doctor is required.',
            'max_hours_per_doctor.min' => 'Maximum hours must be at least 1.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $department->update($request->all());
        $department->load('head');

        // Notify department staff about update
        $departmentUsers = \App\Models\User::where('department_id', $department->id)->get();
        foreach ($departmentUsers as $user) {
            \App\Models\Notification::create([
                'user_id' => $user->id,
                'title' => 'Department Updated',
                'message' => "Your department '{$department->name}' information has been updated.",
                'type' => 'general',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Department updated successfully',
            'data' => new DepartmentResource($department)
        ]);
    }

    /**
     * Remove the specified department.
     */
    public function destroy($id)
    {
        $department = Department::find($id);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found'
            ], 404);
        }

        // Store info before deletion
        $departmentName = $department->name;
        $departmentUsers = \App\Models\User::where('department_id', $department->id)->get();

        $department->delete();

        // Notify affected users
        foreach ($departmentUsers as $user) {
            \App\Models\Notification::create([
                'user_id' => $user->id,
                'title' => 'Department Removed',
                'message' => "The department '{$departmentName}' has been removed. Please contact administration for reassignment.",
                'type' => 'general',
            ]);
        }

        // Notify admins
        $admins = \App\Models\User::whereHas('role', function($q) {
            $q->where('name', 'admin');
        })->get();
        foreach ($admins as $admin) {
            \App\Models\Notification::create([
                'user_id' => $admin->id,
                'title' => 'Department Deleted',
                'message' => "Department '{$departmentName}' has been deleted from the system.",
                'type' => 'general',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Department deleted successfully'
        ]);
    }
}
