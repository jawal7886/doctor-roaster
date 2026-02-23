<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Drop the old enum role column
            $table->dropColumn('role');
            
            // Drop the old specialty string column
            $table->dropColumn('specialty');
        });

        Schema::table('users', function (Blueprint $table) {
            // Add foreign key for role
            $table->unsignedBigInteger('role_id')->nullable()->after('password');
            $table->foreign('role_id')->references('id')->on('roles')->onDelete('set null');
            
            // Add foreign key for specialty (for doctors)
            $table->unsignedBigInteger('specialty_id')->nullable()->after('role_id');
            $table->foreign('specialty_id')->references('id')->on('specialties')->onDelete('set null');
            
            $table->index('role_id');
            $table->index('specialty_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['role_id']);
            $table->dropForeign(['specialty_id']);
            $table->dropColumn(['role_id', 'specialty_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'doctor', 'nurse', 'staff', 'department_head'])->default('staff')->after('password');
            $table->string('specialty', 100)->nullable()->after('role');
        });
    }
};
