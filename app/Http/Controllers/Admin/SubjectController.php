<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SubjectType;
use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Strand;
use App\Models\Subject;
use App\Support\ComponentWeights;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{
    public function index(Request $request): Response
    {
        $subjects = Subject::query()
            ->with('strand:id,code,name,track')
            ->when($request->string('search')->trim()->value(), fn ($q, $search) => $q
                ->where(fn ($w) => $w->where('code', 'like', "%{$search}%")->orWhere('title', 'like', "%{$search}%")))
            ->when($request->string('type')->value(), fn ($q, $type) => $q->where('type', $type))
            ->when($request->integer('strand_id'), fn ($q, $id) => $q->where('strand_id', $id))
            ->orderBy('type')
            ->orderBy('code')
            ->paginate(15)
            ->withQueryString()
            ->through(function (Subject $subject) {
                $weights = ComponentWeights::resolve(
                    $subject->type,
                    $subject->strand?->track,
                    $subject->ww_weight,
                    $subject->pt_weight,
                    $subject->qa_weight,
                );

                return [
                    'id' => $subject->id,
                    'code' => $subject->code,
                    'title' => $subject->title,
                    'type' => $subject->type->value,
                    'type_label' => $subject->type->label(),
                    'strand_id' => $subject->strand_id,
                    'strand' => $subject->strand?->code,
                    'semester_term' => $subject->semester_term,
                    'hours_per_week' => $subject->hours_per_week,
                    'description' => $subject->description,
                    'ww_weight' => $subject->ww_weight,
                    'pt_weight' => $subject->pt_weight,
                    'qa_weight' => $subject->qa_weight,
                    'is_active' => $subject->is_active,
                    'effective_weights' => $weights->toArray(),
                    'has_override' => $subject->ww_weight !== null,
                ];
            });

        return Inertia::render('admin/subjects/index', [
            'subjects' => $subjects,
            'strands' => Strand::orderBy('code')->get(['id', 'code', 'name']),
            'types' => collect(SubjectType::cases())->map(fn ($t) => ['value' => $t->value, 'label' => $t->label()]),
            'filters' => $request->only('search', 'type', 'strand_id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $subject = Subject::create($this->validated($request));

        ActivityLog::record('subject.created', "New subject added: {$subject->title}", $subject);

        return back()->with('success', "{$subject->title} has been added.");
    }

    public function update(Request $request, Subject $subject): RedirectResponse
    {
        $subject->update($this->validated($request, $subject));

        ActivityLog::record('subject.updated', "Subject updated: {$subject->title}", $subject);

        return back()->with('success', "{$subject->title} has been updated.");
    }

    public function destroy(Subject $subject): RedirectResponse
    {
        $title = $subject->title;
        $subject->delete();

        ActivityLog::record('subject.deleted', "Subject removed: {$title}");

        return back()->with('success', "{$title} has been removed.");
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?Subject $subject = null): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:20', Rule::unique('subjects', 'code')->ignore($subject)],
            'title' => ['required', 'string', 'max:200'],
            'type' => ['required', Rule::enum(SubjectType::class)],
            'strand_id' => ['nullable', 'exists:strands,id'],
            'semester_term' => ['nullable', Rule::in([1, 2])],
            'hours_per_week' => ['required', 'integer', 'min:1', 'max:40'],
            'description' => ['nullable', 'string'],
            'ww_weight' => ['nullable', 'integer', 'min:0', 'max:100'],
            'pt_weight' => ['nullable', 'integer', 'min:0', 'max:100'],
            'qa_weight' => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        // A partial override would silently fall back to the DepEd default and
        // confuse whoever set it, so require all three or none.
        $override = array_filter([$data['ww_weight'] ?? null, $data['pt_weight'] ?? null, $data['qa_weight'] ?? null], fn ($v) => $v !== null);

        if ($override !== [] && (count($override) !== 3 || array_sum($override) !== 100)) {
            throw ValidationException::withMessages([
                'ww_weight' => 'Custom weights must set all three components and total exactly 100%.',
            ]);
        }

        return $data;
    }
}
