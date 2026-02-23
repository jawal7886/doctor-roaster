<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('departments')->insert([
            [
                'name' => 'Emergency',
                'description' => 'Emergency and trauma care',
                'max_hours_per_doctor' => 40,
                'doctor_count' => 0,
                'color' => '#ef4444',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Cardiology',
                'description' => 'Heart and cardiovascular system',
                'max_hours_per_doctor' => 44,
                'doctor_count' => 0,
                'color' => '#3b82f6',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Pediatrics',
                'description' => 'Children and adolescent care',
                'max_hours_per_doctor' => 40,
                'doctor_count' => 0,
                'color' => '#22c55e',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Neurology',
                'description' => 'Brain and nervous system',
                'max_hours_per_doctor' => 42,
                'doctor_count' => 0,
                'color' => '#a855f7',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Surgery',
                'description' => 'General and specialized surgery',
                'max_hours_per_doctor' => 48,
                'doctor_count' => 0,
                'color' => '#f59e0b',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Orthopedics',
                'description' => 'Musculoskeletal system',
                'max_hours_per_doctor' => 40,
                'doctor_count' => 0,
                'color' => '#06b6d4',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
