<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HospitalSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class HospitalSettingController extends Controller
{
    public function index()
    {
        $settings = HospitalSetting::first();
        
        if (!$settings) {
            $settings = HospitalSetting::create([
                'hospital_name' => 'MedScheduler',
                'address' => '123 Medical Center Blvd, Suite 100',
                'contact_number' => '+1-555-0000',
                'max_weekly_hours' => 48,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'hospital_name' => 'required|string|max:255',
            'address' => 'nullable|string',
            'contact_number' => 'nullable|string|max:20',
            'max_weekly_hours' => 'nullable|integer|min:1|max:168',
            'hospital_logo' => 'nullable|string', // Base64 encoded image
        ]);

        $settings = HospitalSetting::first();
        
        if (!$settings) {
            $settings = new HospitalSetting();
        }

        $settings->hospital_name = $validated['hospital_name'];
        $settings->address = $validated['address'] ?? null;
        $settings->contact_number = $validated['contact_number'] ?? null;
        $settings->max_weekly_hours = $validated['max_weekly_hours'] ?? 48;
        
        // Handle logo upload if provided
        if (isset($validated['hospital_logo']) && $validated['hospital_logo']) {
            $settings->hospital_logo = $validated['hospital_logo'];
        }

        $settings->save();

        return response()->json([
            'success' => true,
            'message' => 'Hospital settings updated successfully',
            'data' => $settings
        ]);
    }
}
