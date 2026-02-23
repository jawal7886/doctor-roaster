<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HospitalSetting extends Model
{
    protected $fillable = [
        'hospital_name',
        'address',
        'contact_number',
        'hospital_logo',
        'max_weekly_hours',
        'email_notifications_enabled',
        'sms_notifications_enabled',
    ];

    protected $casts = [
        'max_weekly_hours' => 'integer',
        'email_notifications_enabled' => 'boolean',
        'sms_notifications_enabled' => 'boolean',
    ];
}
