@extends('reports.layout')

@section('title', 'Report Card — '.$student->full_name)

@section('content')
    <h1 class="form-title">Learner's Progress Report Card</h1>
    <div class="form-subtitle">DepEd School Form 9 (SF9-SHS) &middot; Senior High School</div>

    <div class="info-grid">
        <div class="row"><span class="label">Name</span><span class="value">{{ $student->full_name }}</span></div>
        <div class="row"><span class="label">LRN</span><span class="value">{{ $student->lrn }}</span></div>
        <div class="row"><span class="label">Grade &amp; Section</span><span class="value">{{ $section?->name ?? '—' }}</span></div>
        <div class="row"><span class="label">Track / Strand</span><span class="value">{{ $section?->strand?->track->label() }} — {{ $section?->strand?->code }}</span></div>
        <div class="row"><span class="label">School Year</span><span class="value">{{ $semester->schoolYear->name }}</span></div>
        <div class="row"><span class="label">Semester</span><span class="value">{{ $semester->name }}</span></div>
        <div class="row"><span class="label">Sex</span><span class="value">{{ ucfirst($student->sex ?? '—') }}</span></div>
        <div class="row"><span class="label">Adviser</span><span class="value">{{ $adviser?->full_name ?? '—' }}</span></div>
    </div>

    <table>
        <thead>
            <tr>
                <th rowspan="2" style="width: 14%">Subject Code</th>
                <th rowspan="2">Subject</th>
                @foreach($record['quarters'] as $quarter)
                    <th class="num" style="width: 8%">Q{{ $quarter->number }}</th>
                @endforeach
                <th class="num" style="width: 10%">Semestral<br>Final Grade</th>
                <th class="num" style="width: 14%">Remarks</th>
            </tr>
            <tr>
                @foreach($record['quarters'] as $quarter)
                    <th class="num muted" style="font-weight: 400; text-transform: none">{{ $quarter->name }}</th>
                @endforeach
                <th></th>
                <th></th>
            </tr>
        </thead>
        <tbody>
            @forelse($record['subjects'] as $subject)
                <tr>
                    <td>{{ $subject['subject_code'] }}</td>
                    <td>{{ $subject['subject_title'] }}</td>
                    @foreach($record['quarters'] as $quarter)
                        @php $mark = $subject['quarters'][$quarter->number] ?? null; @endphp
                        <td class="num {{ $mark !== null && $mark < 75 ? 'failed' : '' }}">{{ $mark ?? '—' }}</td>
                    @endforeach
                    <td class="num {{ $subject['semestral_final'] !== null && $subject['semestral_final'] < 75 ? 'failed' : '' }}">
                        <strong>{{ $subject['semestral_final'] ?? '—' }}</strong>
                    </td>
                    <td class="num {{ $subject['remarks'] === 'failed' ? 'failed' : '' }}">
                        {{ $subject['remarks'] ? ucfirst($subject['remarks']) : '—' }}
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="{{ 4 + count($record['quarters']) }}" class="num muted" style="padding: 18px">
                        No grades have been encoded for this semester yet.
                    </td>
                </tr>
            @endforelse
            <tr>
                <td colspan="{{ 2 + count($record['quarters']) }}" style="text-align: right; font-weight: 700">General Average</td>
                <td class="num"><strong>{{ $record['general_average'] ?? '—' }}</strong></td>
                <td class="num">{{ $record['descriptor'] }}</td>
            </tr>
        </tbody>
    </table>

    <table style="margin-top: 18px; width: 60%">
        <thead>
            <tr>
                <th colspan="3">Descriptors and Grading Scale</th>
            </tr>
            <tr>
                <th style="width: 26%">Grading Scale</th>
                <th>Descriptor</th>
                <th style="width: 24%">Remarks</th>
            </tr>
        </thead>
        <tbody>
            @foreach($descriptorLegend as $legend)
                <tr>
                    <td class="num">{{ $legend['range'] }}</td>
                    <td>{{ $legend['descriptor'] }}</td>
                    <td class="num">{{ $legend['remarks'] }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="signatures">
        <div>
            <div class="line">{{ $adviser?->full_name ?? '' }}</div>
            <div class="role">Class Adviser</div>
        </div>
        <div>
            <div class="line">&nbsp;</div>
            <div class="role">Parent / Guardian</div>
        </div>
        <div>
            <div class="line">&nbsp;</div>
            <div class="role">Principal</div>
        </div>
    </div>
@endsection
