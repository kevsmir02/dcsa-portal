<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('lrn', 12)->unique();   // DepEd Learner Reference Number
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable();
            $table->enum('sex', ['male', 'female'])->nullable();
            $table->date('birthdate')->nullable();
            $table->string('birthplace')->nullable();
            $table->text('address')->nullable();
            $table->string('contact_number')->nullable();
            $table->string('guardian_name')->nullable();
            $table->string('guardian_contact')->nullable();
            $table->string('guardian_relationship')->nullable();
            $table->enum('status', ['active', 'dropped', 'transferred', 'graduated'])->default('active');
            $table->timestamps();

            $table->index(['last_name', 'first_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
