<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\SchoolYear;
use App\Models\Section;
use App\Models\Semester;
use App\Models\Strand;
use App\Models\Teacher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SectionController extends Controller
{
    public function index(Request $request): Response
    {
        $semester = Semester::active();

        $sections = Section::query()
            ->with(['strand:id,code,name,track', 'adviser:id,first_name,middle_name,last_name'])
            ->withCount(['enrollments' => fn ($q) => $q->where('semester_id', $semester?->id)->where('status', 'enrolled')])
            ->when($request->string('search')->trim()->value(), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->when($request->integer('strand_id'), fn ($q, $id) => $q->where('strand_id', $id))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Section $section) => [
                'id' => $section->id,
                'name' => $section->name,
                'grade_level' => $section->grade_level,
                'strand_id' => $section->strand_id,
                'strand' => $section->strand?->code,
                'track' => $section->strand?->track->label(),
                'adviser_id' => $section->adviser_id,
                'adviser' => $section->adviser?->full_name,
                'room' => $section->room,
                'capacity' => $section->capacity,
                'enrolled' => $section->enrollments_count,
                'is_active' => $section->is_active,
            ]);

        return Inertia::render('admin/sections/index', [
            'sections' => $sections,
            'strands' => Strand::orderBy('code')->get(['id', 'code', 'name']),
            'teachers' => Teacher::where('is_active', true)->orderBy('last_name')->get()
                ->map(fn (Teacher $t) => ['id' => $t->id, 'name' => $t->full_name]),
            'filters' => $request->only('search', 'strand_id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $section = Section::create($this->validated($request));

        ActivityLog::record('section.created', "New section created: {$section->name}", $section);

        return back()->with('success', "{$section->name} has been created.");
    }

    public function update(Request $request, Section $section): RedirectResponse
    {
        $section->update($this->validated($request, $section));

        ActivityLog::record('section.updated', "Section updated: {$section->name}", $section);

        return back()->with('success', "{$section->name} has been updated.");
    }

    public function destroy(Section $section): RedirectResponse
    {
        $name = $section->name;
        $section->delete();

        ActivityLog::record('section.deleted', "Section removed: {$name}");

        return back()->with('success', "{$name} has been removed.");
    }

    /** @return array<string, mixed> */
    private function validated(Request $request, ?Section $section = null): array
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:50', Rule::unique('sections', 'name')
                ->where('school_year_id', SchoolYear::active()?->id)
                ->ignore($section)],
            'strand_id' => ['required', 'exists:strands,id'],
            'adviser_id' => ['nullable', 'exists:teachers,id'],
            'grade_level' => ['required', 'integer', 'min:11', 'max:12'],
            'room' => ['nullable', 'string', 'max:50'],
            'capacity' => ['required', 'integer', 'min:1', 'max:100'],
            'is_active' => ['boolean'],
        ]);

        return [...$data, 'school_year_id' => SchoolYear::active()?->id];
    }
}
