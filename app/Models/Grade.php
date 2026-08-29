<?php

namespace App\Models;

use App\Support\GradeDescriptor;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id', 'subject_class_id', 'quarter_id',
        'ww_score', 'ww_total', 'pt_score', 'pt_total', 'qa_score', 'qa_total',
        'ww_ps', 'pt_ps', 'qa_ps', 'ww_ws', 'pt_ws', 'qa_ws',
        'initial_grade', 'final_grade', 'remarks', 'computed_at',
    ];

    protected function casts(): array
    {
        return [
            'ww_score' => 'float', 'ww_total' => 'float',
            'pt_score' => 'float', 'pt_total' => 'float',
            'qa_score' => 'float', 'qa_total' => 'float',
            'ww_ps' => 'float', 'pt_ps' => 'float', 'qa_ps' => 'float',
            'ww_ws' => 'float', 'pt_ws' => 'float', 'qa_ws' => 'float',
            'initial_grade' => 'float',
            'final_grade' => 'integer',
            'computed_at' => 'datetime',
        ];
    }

    protected $appends = ['descriptor'];

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function subjectClass(): BelongsTo
    {
        return $this->belongsTo(SubjectClass::class);
    }

    public function quarter(): BelongsTo
    {
        return $this->belongsTo(Quarter::class);
    }

    protected function descriptor(): Attribute
    {
        return Attribute::get(fn () => GradeDescriptor::for($this->final_grade));
    }
}
