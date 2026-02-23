<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'head_id',
        'max_hours_per_doctor',
        'doctor_count',
        'color',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'max_hours_per_doctor' => 'integer',
        'doctor_count' => 'integer',
    ];

    /**
     * Get the department head.
     */
    public function head()
    {
        return $this->belongsTo(User::class, 'head_id');
    }

    /**
     * Get the users in the department.
     */
    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get the shifts for the department.
     */
    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }

    /**
     * Get the schedule entries for the department.
     */
    public function scheduleEntries()
    {
        return $this->hasMany(ScheduleEntry::class);
    }

    /**
     * Get the actual count of doctors in this department.
     * This is calculated dynamically from the users table.
     */
    public function getActualDoctorCountAttribute()
    {
        return $this->users()
            ->whereHas('role', function($q) {
                $q->whereIn('name', ['doctor', 'department_head']);
            })
            ->where('status', 'active')
            ->count();
    }
}
