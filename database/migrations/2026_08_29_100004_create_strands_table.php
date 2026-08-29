<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('strands', function (Blueprint $table) {
            $table->id();
            // Track drives the DepEd grading weights for applied/specialized subjects.
            $table->enum('track', ['academic', 'tvl', 'sports', 'arts_and_design']);
            $table->string('code')->unique();   // STEM, HUMSS, ABM, GAS
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('strands');
    }
};
