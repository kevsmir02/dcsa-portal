<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'Report') — {{ $school['short_name'] ?? 'DCSA' }}</title>
    <style>
        :root {
            --crimson: #8b1a1a;
            --navy: #2a2a6b;
            --laurel: #1e6b3a;
            --ink: #1a1a1a;
            --muted: #5b5b66;
            --rule: #c9c9d1;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            padding: 24px;
            background: #ececed;
            font-family: "Times New Roman", Times, Georgia, serif;
            color: var(--ink);
            font-size: 11pt;
        }

        .sheet {
            background: #fff;
            width: @yield('sheet-width', '210mm');
            min-height: 297mm;
            margin: 0 auto 20px;
            padding: 14mm 12mm;
            box-shadow: 0 2px 14px rgba(0, 0, 0, .18);
        }

        .toolbar {
            max-width: 210mm;
            margin: 0 auto 16px;
            display: flex;
            gap: 8px;
            justify-content: flex-end;
            font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
        }

        .toolbar button, .toolbar a {
            padding: 8px 16px;
            border: 1px solid var(--crimson);
            border-radius: 6px;
            background: var(--crimson);
            color: #fff;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
        }

        .toolbar a.secondary { background: #fff; color: var(--crimson); }

        .letterhead {
            display: flex;
            align-items: center;
            gap: 14px;
            border-bottom: 2px solid var(--crimson);
            padding-bottom: 10px;
            margin-bottom: 14px;
        }

        .letterhead img { width: 62px; height: 62px; object-fit: contain; }
        .letterhead .school { font-size: 15pt; font-weight: 700; color: var(--crimson); letter-spacing: .2px; }
        .letterhead .system { font-size: 10pt; color: var(--muted); }
        .letterhead .meta { font-size: 8.5pt; color: var(--muted); margin-top: 2px; }

        h1.form-title {
            text-align: center;
            font-size: 13pt;
            margin: 0 0 2px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }

        .form-subtitle { text-align: center; font-size: 9.5pt; color: var(--muted); margin-bottom: 14px; }

        table { width: 100%; border-collapse: collapse; }

        th, td { border: 1px solid var(--rule); padding: 4px 6px; }

        thead th {
            background: #f4eaea;
            color: var(--crimson);
            font-size: 9pt;
            text-transform: uppercase;
            letter-spacing: .4px;
        }

        td { font-size: 10pt; }

        .num { text-align: center; font-variant-numeric: tabular-nums; }
        .muted { color: var(--muted); }
        .failed { color: var(--crimson); font-weight: 700; }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 2px 24px;
            margin-bottom: 14px;
            font-size: 10pt;
        }

        .info-grid .row { display: flex; gap: 6px; border-bottom: 1px dotted var(--rule); padding: 3px 0; }
        .info-grid .label { color: var(--muted); min-width: 96px; }
        .info-grid .value { font-weight: 600; }

        .signatures {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 28px;
            margin-top: 34px;
            font-size: 9.5pt;
            text-align: center;
        }

        .signatures .line { border-top: 1px solid var(--ink); margin-top: 34px; padding-top: 4px; font-weight: 600; }
        .signatures .role { color: var(--muted); font-size: 8.5pt; }

        .footnote { margin-top: 18px; font-size: 8.5pt; color: var(--muted); text-align: center; }

        @media print {
            body { background: #fff; padding: 0; }
            .sheet { box-shadow: none; margin: 0; width: auto; min-height: 0; padding: 10mm; }
            .toolbar { display: none; }
            @page { size: @yield('page-size', 'A4 portrait'); margin: 10mm; }
        }
    </style>
</head>
<body>
    <div class="toolbar">
        <a class="secondary" href="{{ url()->previous() }}">Back</a>
        <button onclick="window.print()">Print</button>
    </div>

    <div class="sheet">
        <div class="letterhead">
            <img src="{{ asset('images/dcsa-logo.png') }}" alt="{{ $school['short_name'] ?? 'DCSA' }} logo">
            <div>
                <div class="school">{{ $school['name'] ?? 'Datamex College of Saint Adeline' }}</div>
                <div class="system">{{ $school['system_name'] ?? 'Grade 12 Grading Management System' }}</div>
                <div class="meta">
                    {{ $school['address'] ?? '' }}
                    @if(!empty($school['school_id'])) &middot; School ID: {{ $school['school_id'] }} @endif
                </div>
            </div>
        </div>

        @yield('content')

        <div class="footnote">
            Generated {{ now()->format('F j, Y \a\t g:i A') }} &middot;
            Grades computed under DepEd Order No. 8, s. 2015.
        </div>
    </div>
</body>
</html>
