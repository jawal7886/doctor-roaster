<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Full system access and management',
                'is_active' => true,
            ],
            [
                'name' => 'doctor',
                'display_name' => 'Doctor',
                'description' => 'Medical professional with patient care responsibilities',
                'is_active' => true,
            ],
            [
                'name' => 'nurse',
                'display_name' => 'Nurse',
                'description' => 'Nursing staff providing patient care',
                'is_active' => true,
            ],
            [
                'name' => 'department_head',
                'display_name' => 'Department Head',
                'description' => 'Head of a department with management responsibilities',
                'is_active' => true,
            ],
            [
                'name' => 'staff',
                'display_name' => 'Staff',
                'description' => 'General hospital staff',
                'is_active' => true,
            ],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
