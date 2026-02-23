<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ScheduleEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'shift_id',
        'date',
        'department_id',
        'shift_type',
        'status',
        'is_on_call',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'is_on_call' => 'boolean',
    ];

    /**
     * Get the user assigned to this schedule entry.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the department for this schedule entry.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the shift template for this schedule entry.
     */
    public function shift()
    {
        return $this->belongsTo(Shift::class);
    }
}
