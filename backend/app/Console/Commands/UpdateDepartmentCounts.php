<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Department;
use App\Models\User;

class UpdateDepartmentCounts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'departments:update-counts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update doctor counts and assign department heads';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Updating department counts and heads...');

        $departments = Department::all();

        foreach ($departments as $department) {
            // Calculate actual doctor count
            $doctorCount = User::where('department_id', $department->id)
                ->whereHas('role', function($q) {
                    $q->whereIn('name', ['doctor', 'department_head']);
                })
                ->where('status', 'active')
                ->count();

            // Find a department head (if not already set)
            if (!$department->head_id) {
                $departmentHead = User::where('department_id', $department->id)
                    ->whereHas('role', function($q) {
                        $q->where('name', 'department_head');
                    })
                    ->where('status', 'active')
                    ->first();

                if ($departmentHead) {
                    $department->head_id = $departmentHead->id;
                    $this->info("Assigned {$departmentHead->name} as head of {$department->name}");
                } else {
                    // If no department_head role, try to find a senior doctor
                    $seniorDoctor = User::where('department_id', $department->id)
                        ->whereHas('role', function($q) {
                            $q->where('name', 'doctor');
                        })
                        ->where('status', 'active')
                        ->orderBy('join_date', 'asc')
                        ->first();

                    if ($seniorDoctor) {
                        $department->head_id = $seniorDoctor->id;
                        $this->info("Assigned {$seniorDoctor->name} (senior doctor) as head of {$department->name}");
                    }
                }
            }

            // Update doctor count
            $department->doctor_count = $doctorCount;
            $department->save();

            $this->info("Updated {$department->name}: {$doctorCount} doctors");
        }

        $this->info('Department counts and heads updated successfully!');
        return 0;
    }
}
