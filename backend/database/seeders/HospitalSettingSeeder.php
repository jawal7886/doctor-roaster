<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HospitalSettingSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('hospital_settings')->insert([
            'hospital_name' => 'City General Hospital',
            'address' => '123 Medical Center Blvd, Healthcare City, HC 12345',
            'contact_number' => '+1-555-0000',
            'max_weekly_hours' => 48,
            'email_notifications_enabled' => true,
            'sms_notifications_enabled' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
