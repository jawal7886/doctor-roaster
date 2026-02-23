<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShiftSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [1, 2, 3, 4, 5, 6]; // All department IDs
        
        foreach ($departments as $deptId) {
            DB::table('shifts')->insert([
                [
                    'department_id' => $deptId,
                    'type' => 'morning',
                    'start_time' => '07:00:00',
                    'end_time' => '15:00:00',
                    'required_staff' => 3,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'department_id' => $deptId,
                    'type' => 'evening',
                    'start_time' => '15:00:00',
                    'end_time' => '23:00:00',
                    'required_staff' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'department_id' => $deptId,
                    'type' => 'night',
                    'start_time' => '23:00:00',
                    'end_time' => '07:00:00',
                    'required_staff' => 2,
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
        }
    }
}
