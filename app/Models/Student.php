<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'lrn', 'first_name', 'middle_name', 'last_name', 'suffix',
        'sex', 'birthdate', 'birthplace', 'address', 'contact_number',
        'guardian_name', 'guardian_contact', 'guardian_relationship', 'status',
    ];

    protected function casts(): array
    {
        return ['birthdate' => 'date'];
    }

    protected $appends = ['full_name'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    public function scores(): HasMany
    {
        return $this->hasMany(AssessmentScore::class);
    }

    /** The learner's enrolment record for a given semester, if any. */
    public function enrollmentFor(int $semesterId): ?Enrollment
    {
        return $this->enrollments()->where('semester_id', $semesterId)->first();
    }

    protected function fullName(): Attribute
    {
        return Attribute::get(fn () => trim(collect([
            $this->last_name.',',
            $this->first_name,
            $this->middle_name ? strtoupper(substr($this->middle_name, 0, 1)).'.' : null,
            $this->suffix,
        ])->filter()->implode(' ')));
    }
}
