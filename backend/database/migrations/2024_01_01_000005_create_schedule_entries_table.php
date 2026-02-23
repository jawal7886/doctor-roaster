<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedule_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('shift_id')->constrained('shifts')->onDelete('cascade');
            $table->date('date');
            $table->foreignId('department_id')->constrained('departments')->onDelete('cascade');
            $table->enum('shift_type', ['morning', 'evening', 'night']);
            $table->enum('status', ['scheduled', 'confirmed', 'swapped', 'cancelled'])->default('scheduled');
            $table->boolean('is_on_call')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'date', 'shift_type']);
            $table->index('user_id');
            $table->index('date');
            $table->index('department_id');
            $table->index('status');
            $table->index(['date', 'department_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_entries');
    }
};
