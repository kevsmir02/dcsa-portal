<?php

namespace App\Models;

use App\Enums\GradeComponent;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assessment extends Model
{
    use HasFactory;

    protected $fillable = [
        'subject_class_id', 'quarter_id', 'component', 'title',
        'highest_possible_score', 'date_given', 'position',
    ];

    protected function casts(): array
    {
        return [
            'component' => GradeComponent::class,
            'date_given' => 'date',
        ];
    }

    public function subjectClass(): BelongsTo
    {
        return $this->belongsTo(SubjectClass::class);
    }

    public function quarter(): BelongsTo
    {
        return $this->belongsTo(Quarter::class);
    }

    public function scores(): HasMany
    {
        return $this->hasMany(AssessmentScore::class);
    }
}
