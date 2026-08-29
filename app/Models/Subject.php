<?php

namespace App\Models;

use App\Enums\SubjectType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'title', 'type', 'strand_id', 'semester_term', 'hours_per_week',
        'description', 'ww_weight', 'pt_weight', 'qa_weight', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => SubjectType::class,
            'is_active' => 'boolean',
        ];
    }

    public function strand(): BelongsTo
    {
        return $this->belongsTo(Strand::class);
    }

    public function subjectClasses(): HasMany
    {
        return $this->hasMany(SubjectClass::class);
    }
}
