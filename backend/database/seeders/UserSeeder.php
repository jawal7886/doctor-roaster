<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use App\Models\Specialty;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Get roles
        $adminRole = Role::where('name', 'admin')->first();
        $doctorRole = Role::where('name', 'doctor')->first();
        $nurseRole = Role::where('name', 'nurse')->first();
        $deptHeadRole = Role::where('name', 'department_head')->first();

        // Get specialties
        $emergencyMed = Specialty::where('name', 'Emergency Medicine')->first();
        $cardiology = Specialty::where('name', 'Cardiology')->first();
        $pediatrics = Specialty::where('name', 'Pediatrics')->first();
        $neurology = Specialty::where('name', 'Neurology')->first();
        $surgery = Specialty::where('name', 'General Surgery')->first();
        $orthopedics = Specialty::where('name', 'Orthopedics')->first();

        $users = [
            [
                'name' => 'Admin User',
                'email' => 'admin@hospital.com',
                'password' => Hash::make('password'),
                'phone' => '+1-555-0000',
                'role_id' => $adminRole->id,
                'specialty_id' => null,
                'department_id' => null,
                'status' => 'active',
                'join_date' => '2020-01-01',
            ],
            [
                'name' => 'Dr. Sarah Chen',
                'email' => 'sarah.chen@hospital.com',
                'password' => Hash::make('password'),
                'phone' => '+1-555-0101',
                'role_id' => $doctorRole->id,
                'specialty_id' => $emergencyMed->id,
                'department_id' => 1, // Emergency
                'status' => 'active',
                'join_date' => '2021-03-15',
            ],
            [
                'name' => 'Dr. James Wilson',
                'email' => 'james.wilson@hospital.com',
                'password' => Hash::make('password'),
                'phone' => '+1-555-0102',
                'role_id' => $doctorRole->id,
                'specialty_id' => $cardiology->id,
                'department_id' => 2, // Cardiology
                'status' => 'active',
                'join_date' => '2019-08-20',
            ],
            [
                'name' => 'Dr. Maria Garcia',
                'email' => 'maria.garcia@hospital.com',
                'password' => Hash::make('password'),
                'phone' => '+1-555-0103',
                'role_id' => $deptHeadRole->id,
                'specialty_id' => $pediatrics->id,
                'department_id' => 3, // Pediatrics
                'status' => 'active',
                'join_date' => '2018-01-10',
            ],
            [
                'name' => 'Dr. Ahmed Hassan',
                'email' => 'ahmed.hassan@hospital.com',
                'password' => Hash::make('password'),
                'phone' => '+1-555-0104',
                'role_id' => $doctorRole->id,
                'specialty_id' => $neurology->id,
                'department_id' => 4, // Neurology
                'status' => 'on_leave',
                'join_date' => '2020-06-01',
            ],
            [
                'name' => 'Dr. Emily Zhang',
                'email' => 'emily.zhang@hospital.com',
                'password' => Hash::make('password'),
                'phone' => '+1-555-0105',
                'role_id' => $doctorRole->id,
                'specialty_id' => $surgery->id,
                'department_id' => 5, // Surgery
                'status' => 'active',
                'join_date' => '2022-02-14',
            ],
            [
                'name' => 'Nurse Rachel Kim',
                'email' => 'rachel.kim@hospital.com',
                'password' => Hash::make('password'),
                'phone' => '+1-555-0106',
                'role_id' => $nurseRole->id,
                'specialty_id' => null,
                'department_id' => 1, // Emergency
                'status' => 'active',
                'join_date' => '2021-09-01',
            ],
            [
                'name' => 'Dr. Michael Brown',
                'email' => 'michael.brown@hospital.com',
                'password' => Hash::make('password'),
                'phone' => '+1-555-0107',
                'role_id' => $doctorRole->id,
                'specialty_id' => $orthopedics->id,
                'department_id' => 6, // Orthopedics
                'status' => 'active',
                'join_date' => '2020-11-30',
            ],
            [
                'name' => 'Nurse Lisa Park',
                'email' => 'lisa.park@hospital.com',
                'password' => Hash::make('password'),
                'phone' => '+1-555-0108',
                'role_id' => $nurseRole->id,
                'specialty_id' => null,
                'department_id' => 2, // Cardiology
                'status' => 'active',
                'join_date' => '2023-01-15',
            ],
        ];

        foreach ($users as $user) {
            User::create($user);
        }
    }
}
