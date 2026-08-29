<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One subject taught to one section for one semester, by one teacher.
        Schema::create('subject_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('semester_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()->constrained()->nullOnDelete();
            $table->string('schedule')->nullable();   // "MWF 08:00-09:00"
            $table->string('room')->nullable();
            $table->timestamps();

            $table->unique(['subject_id', 'section_id', 'semester_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subject_classes');
    }
};
