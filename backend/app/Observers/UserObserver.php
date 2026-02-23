<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Department;

class UserObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $user): void
    {
        $this->updateDepartmentCount($user->department_id);
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        // If department changed, update both old and new departments
        if ($user->isDirty('department_id')) {
            $this->updateDepartmentCount($user->getOriginal('department_id'));
            $this->updateDepartmentCount($user->department_id);
        }
        
        // If role or status changed, update current department
        if ($user->isDirty('role_id') || $user->isDirty('status')) {
            $this->updateDepartmentCount($user->department_id);
        }
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $user): void
    {
        $this->updateDepartmentCount($user->department_id);
    }

    /**
     * Update the doctor count for a department.
     */
    private function updateDepartmentCount($departmentId): void
    {
        if (!$departmentId) {
            return;
        }

        $department = Department::find($departmentId);
        if (!$department) {
            return;
        }

        $doctorCount = User::where('department_id', $departmentId)
            ->whereHas('role', function($q) {
                $q->whereIn('name', ['doctor', 'department_head']);
            })
            ->where('status', 'active')
            ->count();

        $department->doctor_count = $doctorCount;
        $department->save();
    }
}
