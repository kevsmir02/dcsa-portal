<?php

namespace App\Services;

use App\Models\Grade;
use App\Models\Quarter;
use App\Models\Semester;
use App\Models\Student;
use App\Support\GradeDescriptor;
use Illuminate\Support\Collection;

/**
 * Assembles a learner's grades into the shape a report card needs:
 * per-subject quarterly grades, the semestral final grade for each subject,
 * and the general average across subjects.
 *
 * DepEd computes the Semestral Final Grade as the average of the semester's two
 * quarterly grades, and the General Average as the average of the semestral final
 * grades of all subjects. Both are reported as whole numbers.
 */
class AcademicRecord
{
    /**
     * The learner's full record for one semester.
     *
     * @return array{
     *     semester: Semester,
     *     quarters: Collection<int, Quarter>,
     *     subjects: list<array<string, mixed>>,
     *     general_average: int|null,
     *     descriptor: string,
     * }
     */
    public function forSemester(Student $student, Semester $semester): array
    {
        $quarters = $semester->quarters()->get();
        $quarterIds = $quarters->pluck('id');

        $grades = Grade::query()
            ->with(['subjectClass.subject', 'subjectClass.teacher'])
            ->where('student_id', $student->id)
            ->whereIn('quarter_id', $quarterIds)
            ->get();

        $subjects = $grades
            ->groupBy('subject_class_id')
            ->map(function (Collection $subjectGrades) use ($quarters) {
                $class = $subjectGrades->first()->subjectClass;

                $byQuarter = $quarters->mapWithKeys(function (Quarter $quarter) use ($subjectGrades) {
                    $grade = $subjectGrades->firstWhere('quarter_id', $quarter->id);

                    return [$quarter->number => $grade?->final_grade];
                });

                $semestralFinal = $this->average($byQuarter->values());

                return [
                    'subject_class_id' => $class->id,
                    'subject_code' => $class->subject->code,
                    'subject_title' => $class->subject->title,
                    'subject_type' => $class->subject->type->value,
                    'teacher' => $class->teacher?->full_name,
                    'quarters' => $byQuarter->all(),
                    'semestral_final' => $semestralFinal,
                    'descriptor' => GradeDescriptor::for($semestralFinal),
                    'remarks' => GradeDescriptor::remarks($semestralFinal),
                ];
            })
            ->sortBy('subject_code')
            ->values()
            ->all();

        $generalAverage = $this->average(collect($subjects)->pluck('semestral_final'));

        return [
            'semester' => $semester,
            'quarters' => $quarters,
            'subjects' => $subjects,
            'general_average' => $generalAverage,
            'descriptor' => GradeDescriptor::for($generalAverage),
        ];
    }

    /**
     * Average a set of grades, ignoring the ones not yet computed.
     * Returns null when nothing has been graded at all.
     *
     * @param  Collection<int, int|null>  $grades
     */
    private function average(Collection $grades): ?int
    {
        $present = $grades->filter(fn ($grade) => $grade !== null);

        if ($present->isEmpty()) {
            return null;
        }

        return (int) round($present->avg());
    }
}
