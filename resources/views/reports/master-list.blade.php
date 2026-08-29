@extends('reports.layout')

@section('title', 'Master List — '.$section->name)
@section('sheet-width', '297mm')
@section('page-size', 'A4 landscape')

@section('content')
    <h1 class="form-title">Section Master List and Grade Sheet</h1>
    <div class="form-subtitle">{{ $semester->name }}, S.Y. {{ $semester->schoolYear->name }}</div>

    <div class="info-grid">
        <div class="row"><span class="label">Section</span><span class="value">{{ $section->name }}</span></div>
        <div class="row"><span class="label">Track / Strand</span><span class="value">{{ $section->strand->track->label() }} — {{ $section->strand->code }}</span></div>
        <div class="row"><span class="label">Adviser</span><span class="value">{{ $section->adviser?->full_name ?? '—' }}</span></div>
        <div class="row"><span class="label">Enrolled</span><span class="value">{{ $students->count() }} learners</span></div>
    </div>

    <table style="font-size: 8.5pt">
        <thead>
            <tr>
                <th style="width: 3%">#</th>
                <th style="width: 10%">LRN</th>
                <th style="text-align: left">Learner's Name</th>
                @foreach($classes as $class)
                    <th class="num" style="width: 5%">{{ $class->subject->code }}</th>
                @endforeach
                <th class="num" style="width: 6%">General<br>Average</th>
                <th class="num" style="width: 7%">Remarks</th>
            </tr>
        </thead>
        <tbody>
            @foreach($students as $i => $student)
                @php $row = $matrix[$student->id]; @endphp
                <tr>
                    <td class="num">{{ $i + 1 }}</td>
                    <td class="num">{{ $student->lrn }}</td>
                    <td>{{ $student->full_name }}</td>
                    @foreach($classes as $class)
                        @php $mark = $row['grades'][$class->id] ?? null; @endphp
                        <td class="num {{ $mark !== null && $mark < $passingGrade ? 'failed' : '' }}">{{ $mark ?? '—' }}</td>
                    @endforeach
                    <td class="num"><strong>{{ $row['general_average'] ?? '—' }}</strong></td>
                    <td class="num {{ $row['general_average'] !== null && $row['general_average'] < $passingGrade ? 'failed' : '' }}">
                        {{ $row['general_average'] === null ? '—' : ($row['general_average'] >= $passingGrade ? 'Passed' : 'Failed') }}
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <table style="margin-top: 14px; width: 45%">
        <thead><tr><th colspan="2">Subject Legend</th></tr></thead>
        <tbody>
            @foreach($classes as $class)
                <tr>
                    <td class="num" style="width: 22%">{{ $class->subject->code }}</td>
                    <td>{{ $class->subject->title }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="signatures" style="grid-template-columns: repeat(2, 1fr); max-width: 60%">
        <div>
            <div class="line">{{ $section->adviser?->full_name ?? '' }}</div>
            <div class="role">Class Adviser</div>
        </div>
        <div>
            <div class="line">&nbsp;</div>
            <div class="role">School Registrar</div>
        </div>
    </div>
@endsection
