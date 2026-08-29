<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();       // "GENMATH"
            $table->string('title');                // "General Mathematics"
            // DepEd classifies SHS subjects this way; it selects the grading weights.
            $table->enum('type', ['core', 'applied', 'specialized']);
            $table->foreignId('strand_id')->nullable()->constrained()->nullOnDelete(); // null = offered to all strands
            $table->unsignedTinyInteger('semester_term')->nullable();  // 1, 2, or null = either
            $table->unsignedSmallInteger('hours_per_week')->default(4);
            $table->text('description')->nullable();
            // Optional per-subject override of the DepEd default weights (percent, must total 100).
            $table->unsignedTinyInteger('ww_weight')->nullable();
            $table->unsignedTinyInteger('pt_weight')->nullable();
            $table->unsignedTinyInteger('qa_weight')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
