<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The computed quarterly grade. Derived from assessment_scores, stored so that
        // report cards and analytics do not recompute the whole class record every time.
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_class_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quarter_id')->constrained()->cascadeOnDelete();

            // Raw totals per component
            $table->decimal('ww_score', 7, 2)->default(0);
            $table->decimal('ww_total', 7, 2)->default(0);
            $table->decimal('pt_score', 7, 2)->default(0);
            $table->decimal('pt_total', 7, 2)->default(0);
            $table->decimal('qa_score', 7, 2)->default(0);
            $table->decimal('qa_total', 7, 2)->default(0);

            // Percentage score = raw / total * 100
            $table->decimal('ww_ps', 6, 2)->default(0);
            $table->decimal('pt_ps', 6, 2)->default(0);
            $table->decimal('qa_ps', 6, 2)->default(0);

            // Weighted score = percentage score * component weight
            $table->decimal('ww_ws', 6, 2)->default(0);
            $table->decimal('pt_ws', 6, 2)->default(0);
            $table->decimal('qa_ws', 6, 2)->default(0);

            $table->decimal('initial_grade', 6, 2)->default(0);
            $table->unsignedTinyInteger('final_grade')->nullable();   // transmuted, 60..100
            $table->enum('remarks', ['passed', 'failed'])->nullable();
            $table->timestamp('computed_at')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'subject_class_id', 'quarter_id'], 'grades_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
