<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Teacher extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'employee_no', 'first_name', 'middle_name', 'last_name', 'suffix',
        'sex', 'position', 'department', 'contact_number', 'email', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    protected $appends = ['full_name'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subjectClasses(): HasMany
    {
        return $this->hasMany(SubjectClass::class);
    }

    public function advisorySections(): HasMany
    {
        return $this->hasMany(Section::class, 'adviser_id');
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
