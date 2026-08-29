<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // A single column of the DepEd class record: WW1, PT3, the quarterly exam...
        Schema::create('assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_class_id')->constrained()->cascadeOnDelete();
            $table->foreignId('quarter_id')->constrained()->cascadeOnDelete();
            $table->enum('component', ['written_work', 'performance_task', 'quarterly_assessment']);
            $table->string('title');                                  // "Written Work 1"
            $table->unsignedSmallInteger('highest_possible_score');   // HPS
            $table->date('date_given')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->index(['subject_class_id', 'quarter_id', 'component']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assessments');
    }
};
