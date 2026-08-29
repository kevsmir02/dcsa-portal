<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('strand_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_year_id')->constrained()->cascadeOnDelete();
            $table->foreignId('adviser_id')->nullable()->constrained('teachers')->nullOnDelete();
            $table->string('name');                 // "12-STEM A"
            $table->unsignedTinyInteger('grade_level')->default(12);
            $table->string('room')->nullable();
            $table->unsignedSmallInteger('capacity')->default(45);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['name', 'school_year_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sections');
    }
};
