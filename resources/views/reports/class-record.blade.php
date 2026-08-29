@extends('reports.layout')

@section('title', 'Class Record — '.$subjectClass->subject->code.' '.$subjectClass->section->name)
@section('sheet-width', '297mm')
@section('page-size', 'A4 landscape')

@section('content')
    <h1 class="form-title">Class Record</h1>
    <div class="form-subtitle">{{ $quarter->name }} &middot; {{ $subjectClass->semester->name }}, S.Y. {{ $subjectClass->semester->schoolYear->name }}</div>

    <div class="info-grid">
        <div class="row"><span class="label">Subject</span><span class="value">{{ $subjectClass->subject->code }} — {{ $subjectClass->subject->title }}</span></div>
        <div class="row"><span class="label">Section</span><span class="value">{{ $subjectClass->section->name }} ({{ $subjectClass->section->strand->code }})</span></div>
        <div class="row"><span class="label">Teacher</span><span class="value">{{ $subjectClass->teacher?->full_name ?? '—' }}</span></div>
        <div class="row"><span class="label">Schedule</span><span class="value">{{ $subjectClass->schedule ?? '—' }} &middot; {{ $subjectClass->room ?? '—' }}</span></div>
        <div class="row">
            <span class="label">Weights</span>
            <span class="value">WW {{ $weights->writtenWork }}% &middot; PT {{ $weights->performanceTask }}% &middot; QA {{ $weights->quarterlyAssessment }}%</span>
        </div>
        <div class="row"><span class="label">Subject Type</span><span class="value">{{ $subjectClass->subject->type->label() }}</span></div>
    </div>

    @php
        $componentMeta = [
            'written_work' => ['label' => 'Written Work', 'weight' => $weights->writtenWork, 'prefix' => 'ww'],
            'performance_task' => ['label' => 'Performance Task', 'weight' => $weights->performanceTask, 'prefix' => 'pt'],
            'quarterly_assessment' => ['label' => 'Quarterly Assessment', 'weight' => $weights->quarterlyAssessment, 'prefix' => 'qa'],
        ];
    @endphp

    <table style="font-size: 8.5pt">
        <thead>
            <tr>
                <th rowspan="3" style="width: 4%">#</th>
                <th rowspan="3" style="width: 16%; text-align: left">Learner's Name</th>
                @foreach($componentMeta as $key => $meta)
                    @php $items = $components[$key]; @endphp
                    <th colspan="{{ max(1, $items->count()) + 3 }}">{{ $meta['label'] }} ({{ $meta['weight'] }}%)</th>
                @endforeach
                <th rowspan="3" style="width: 5%">Initial<br>Grade</th>
                <th rowspan="3" style="width: 5%">Quarterly<br>Grade</th>
            </tr>
            <tr>
                @foreach($componentMeta as $key => $meta)
                    @php $items = $components[$key]; @endphp
                    @forelse($items as $index => $item)
                        <th class="num">{{ $index + 1 }}</th>
                    @empty
                        <th class="num muted">—</th>
                    @endforelse
                    <th class="num">Total</th>
                    <th class="num">PS</th>
                    <th class="num">WS</th>
                @endforeach
            </tr>
            <tr>
                @foreach($componentMeta as $key => $meta)
                    @php $items = $components[$key]; @endphp
                    @forelse($items as $item)
                        <th class="num muted" style="font-weight: 400">{{ $item->highest_possible_score }}</th>
                    @empty
                        <th class="num muted">—</th>
                    @endforelse
                    <th class="num muted" style="font-weight: 400">{{ $items->sum('highest_possible_score') ?: '—' }}</th>
                    <th class="num muted" style="font-weight: 400">100</th>
                    <th class="num muted" style="font-weight: 400">{{ $meta['weight'] }}</th>
                @endforeach
            </tr>
        </thead>
        <tbody>
            @foreach($students as $i => $student)
                @php $grade = $grades->get($student->id); @endphp
                <tr>
                    <td class="num">{{ $i + 1 }}</td>
                    <td>{{ $student->full_name }}</td>
                    @foreach($componentMeta as $key => $meta)
                        @php $items = $components[$key]; $prefix = $meta['prefix']; @endphp
                        @forelse($items as $item)
                            @php $score = $item->scores->firstWhere('student_id', $student->id)?->score; @endphp
                            <td class="num">{{ $score !== null ? rtrim(rtrim(number_format((float) $score, 2), '0'), '.') : '' }}</td>
                        @empty
                            <td class="num muted">—</td>
                        @endforelse
                        <td class="num">{{ $grade ? rtrim(rtrim(number_format($grade->{$prefix.'_score'}, 2), '0'), '.') : '' }}</td>
                        <td class="num">{{ $grade ? number_format($grade->{$prefix.'_ps'}, 2) : '' }}</td>
                        <td class="num">{{ $grade ? number_format($grade->{$prefix.'_ws'}, 2) : '' }}</td>
                    @endforeach
                    <td class="num">{{ $grade ? number_format($grade->initial_grade, 2) : '' }}</td>
                    <td class="num {{ $grade?->final_grade !== null && $grade->final_grade < 75 ? 'failed' : '' }}">
                        <strong>{{ $grade?->final_grade ?? '—' }}</strong>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="signatures" style="grid-template-columns: repeat(2, 1fr); max-width: 60%">
        <div>
            <div class="line">{{ $subjectClass->teacher?->full_name ?? '' }}</div>
            <div class="role">Subject Teacher</div>
        </div>
        <div>
            <div class="line">&nbsp;</div>
            <div class="role">Verified by the Registrar</div>
        </div>
    </div>
@endsection
