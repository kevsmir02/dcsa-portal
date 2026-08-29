<?php

namespace App\Models;

use App\Support\ComponentWeights;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

/**
 * One subject taught to one section for one semester.
 * This is the unit a teacher keeps a class record for.
 */
class SubjectClass extends Model
{
    use HasFactory;

    protected $fillable = ['subject_id', 'section_id', 'semester_id', 'teacher_id', 'schedule', 'room'];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function teacher(): BelongsTo
    {
        return $this->belongsTo(Teacher::class);
    }

    public function assessments(): HasMany
    {
        return $this->hasMany(Assessment::class);
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class);
    }

    /**
     * The DepEd component weights that apply to this class, which depend on the
     * subject's type and the track of the section taking it.
     */
    public function weights(): ComponentWeights
    {
        $this->loadMissing('subject', 'section.strand');

        return ComponentWeights::resolve(
            $this->subject->type,
            $this->section?->strand?->track,
            $this->subject->ww_weight,
            $this->subject->pt_weight,
            $this->subject->qa_weight,
        );
    }

    /** The learners enrolled in this class's section for this class's semester. */
    public function students(): Collection
    {
        return Student::query()
            ->whereHas('enrollments', fn ($q) => $q
                ->where('section_id', $this->section_id)
                ->where('semester_id', $this->semester_id)
                ->where('status', 'enrolled'))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();
    }
}
