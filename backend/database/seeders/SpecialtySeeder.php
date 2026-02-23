<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Specialty;

class SpecialtySeeder extends Seeder
{
    public function run(): void
    {
        $specialties = [
            ['name' => 'Cardiology', 'description' => 'Heart and cardiovascular system', 'is_active' => true],
            ['name' => 'Neurology', 'description' => 'Brain and nervous system', 'is_active' => true],
            ['name' => 'Pediatrics', 'description' => 'Medical care for children', 'is_active' => true],
            ['name' => 'Orthopedics', 'description' => 'Bones, joints, and muscles', 'is_active' => true],
            ['name' => 'Dermatology', 'description' => 'Skin conditions and diseases', 'is_active' => true],
            ['name' => 'Oncology', 'description' => 'Cancer treatment and care', 'is_active' => true],
            ['name' => 'Emergency Medicine', 'description' => 'Emergency and critical care', 'is_active' => true],
            ['name' => 'General Surgery', 'description' => 'Surgical procedures', 'is_active' => true],
        ];

        foreach ($specialties as $specialty) {
            Specialty::create($specialty);
        }
    }
}
