import { ConfirmDelete } from '@/components/confirm-delete';
import { EmptyState } from '@/components/empty-state';
import { GradeBadge } from '@/components/grade-badge';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { type ComponentWeights } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { ClipboardList, Loader2, Lock, Plus, Printer, Save, Trash2 } from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';

interface AssessmentColumn {
    id: number;
    title: string;
    highest_possible_score: number;
    date_given: string | null;
}

interface ComponentGroup {
    value: string;
    label: string;
    abbreviation: string;
    assessments: AssessmentColumn[];
}

interface Row {
    student_id: number;
    lrn: string;
    name: string;
    scores: Record<number, number | null>;
    ww_ps: number | null;
    pt_ps: number | null;
    qa_ps: number | null;
    ww_ws: number | null;
    pt_ws: number | null;
    qa_ws: number | null;
    initial_grade: number | null;
    final_grade: number | null;
    descriptor: string;
    remarks: string | null;
}

interface Props {
    subjectClass: {
        id: number;
        subject_code: string;
        subject_title: string;
        subject_type: string;
        section: string;
        track: string;
        strand: string;
        teacher: string | null;
        schedule: string | null;
        room: string | null;
        semester: string;
    };
    quarters: { id: number; number: number; name: string; is_locked: boolean }[];
    quarter: { id: number; name: string; is_locked: boolean };
    weights: ComponentWeights;
    components: ComponentGroup[];
    rows: Row[];
    canEdit: boolean;
}

const WEIGHT_KEY: Record<string, keyof ComponentWeights> = {
    written_work: 'written_work',
    performance_task: 'performance_task',
    quarterly_assessment: 'quarterly_assessment',
};

const PREFIX: Record<string, 'ww' | 'pt' | 'qa'> = {
    written_work: 'ww',
    performance_task: 'pt',
    quarterly_assessment: 'qa',
};

export default function ClassRecord({ subjectClass, quarters, quarter, weights, components, rows, canEdit }: Props) {
    // Every edited cell, keyed "studentId:assessmentId", until the batch is saved.
    const [edits, setEdits] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const [addOpen, setAddOpen] = useState(false);

    const assessmentById = useMemo(() => {
        const map = new Map<number, AssessmentColumn>();
        components.forEach((group) => group.assessments.forEach((assessment) => map.set(assessment.id, assessment)));
        return map;
    }, [components]);

    const addForm = useForm({
        quarter_id: quarter.id,
        component: 'written_work',
        title: '',
        highest_possible_score: 20,
        date_given: '',
    });

    const dirtyCount = Object.keys(edits).length;

    const cellValue = (row: Row, assessmentId: number) => {
        const key = `${row.student_id}:${assessmentId}`;
        if (key in edits) return edits[key];
        const score = row.scores[assessmentId];
        return score === null || score === undefined ? '' : String(Number(score));
    };

    const setCell = (studentId: number, assessmentId: number, raw: string) => {
        const max = assessmentById.get(assessmentId)?.highest_possible_score ?? 100;
        const cleaned = raw === '' ? '' : String(Math.min(Math.max(Number(raw), 0), max));
        setEdits((current) => ({ ...current, [`${studentId}:${assessmentId}`]: cleaned }));
    };

    const save = () => {
        if (dirtyCount === 0) return;

        const scores = Object.entries(edits).map(([key, value]) => {
            const [studentId, assessmentId] = key.split(':').map(Number);
            return { student_id: studentId, assessment_id: assessmentId, score: value === '' ? null : Number(value) };
        });

        setSaving(true);
        router.post(
            `/class-record/${subjectClass.id}/scores`,
            { quarter_id: quarter.id, scores },
            {
                preserveScroll: true,
                onSuccess: () => setEdits({}),
                onFinish: () => setSaving(false),
            },
        );
    };

    const submitAdd: FormEventHandler = (e) => {
        e.preventDefault();
        addForm.post(`/class-record/${subjectClass.id}/assessments`, {
            preserveScroll: true,
            onSuccess: () => {
                addForm.reset('title');
                setAddOpen(false);
            },
        });
    };

    const totalColumns = components.reduce((sum, group) => sum + Math.max(1, group.assessments.length) + 2, 0);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Class Record', href: '#' },
            ]}
        >
            <Head title={`${subjectClass.subject_code} — ${subjectClass.section}`} />

            <PageHeader
                title={`${subjectClass.subject_code} — ${subjectClass.section}`}
                description={`${subjectClass.subject_title} · ${subjectClass.teacher ?? 'Unassigned'}${subjectClass.schedule ? ` · ${subjectClass.schedule}` : ''}`}
                actions={
                    <>
                        <Button variant="outline" asChild>
                            <a href={`/reports/class-record/${subjectClass.id}?quarter=${quarter.id}`} target="_blank" rel="noreferrer">
                                <Printer className="size-4" /> Print
                            </a>
                        </Button>
                        {canEdit && (
                            <>
                                <Button variant="outline" onClick={() => setAddOpen(true)}>
                                    <Plus className="size-4" /> Add assessment
                                </Button>
                                <Button onClick={save} disabled={dirtyCount === 0 || saving}>
                                    {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                                    Save{dirtyCount > 0 ? ` (${dirtyCount})` : ''}
                                </Button>
                            </>
                        )}
                    </>
                }
            />

            <div className="flex flex-wrap items-center gap-2">
                {quarters.map((q) => (
                    <Button
                        key={q.id}
                        size="sm"
                        variant={q.id === quarter.id ? 'default' : 'outline'}
                        onClick={() => router.get(`/class-record/${subjectClass.id}`, { quarter: q.id }, { preserveScroll: true })}
                    >
                        {q.name}
                        {q.is_locked && <Lock className="ml-1 size-3" />}
                    </Button>
                ))}

                <div className="flex flex-wrap items-center gap-1.5 text-xs sm:ml-auto">
                    <Badge variant="outline">{subjectClass.subject_type}</Badge>
                    <Badge variant="outline">{subjectClass.track}</Badge>
                    <Badge variant="secondary" className="tabular">
                        WW {weights.written_work}% · PT {weights.performance_task}% · QA {weights.quarterly_assessment}%
                    </Badge>
                </div>
            </div>

            {quarter.is_locked && (
                <div className="border-destructive/25 bg-destructive/8 text-destructive flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-sm">
                    <Lock className="size-4 shrink-0" />
                    <span>
                        <strong>{quarter.name} is closed.</strong> The administrator has locked this quarter, so grades can no longer be edited.
                    </span>
                </div>
            )}

            <Card>
                <CardContent className="p-0">
                    {rows.length === 0 ? (
                        <EmptyState
                            icon={ClipboardList}
                            title="No learners enrolled"
                            description="No one is enrolled in this section for this semester yet."
                        />
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr className="border-border border-b">
                                        <th
                                            rowSpan={2}
                                            className="bg-card text-muted-foreground sticky left-0 z-20 min-w-52 px-3 py-2 text-left text-xs font-semibold tracking-wide uppercase"
                                        >
                                            Learner's Name
                                        </th>
                                        {components.map((group) => (
                                            <th
                                                key={group.value}
                                                colSpan={Math.max(1, group.assessments.length) + 2}
                                                className="border-border text-muted-foreground border-l px-2 py-1.5 text-center text-xs font-semibold tracking-wide uppercase"
                                            >
                                                {group.label} ({weights[WEIGHT_KEY[group.value]]}%)
                                            </th>
                                        ))}
                                        <th
                                            rowSpan={2}
                                            className="border-border text-muted-foreground border-l px-2 py-2 text-center text-xs font-semibold uppercase"
                                        >
                                            Initial
                                        </th>
                                        <th rowSpan={2} className="text-muted-foreground px-2 py-2 text-center text-xs font-semibold uppercase">
                                            Grade
                                        </th>
                                    </tr>
                                    <tr className="border-border border-b">
                                        {components.map((group) =>
                                            group.assessments.length === 0
                                                ? [
                                                      <th
                                                          key={`${group.value}-empty`}
                                                          className="border-border text-muted-foreground border-l px-2 py-1 text-center text-[11px]"
                                                      >
                                                          none
                                                      </th>,
                                                      <th
                                                          key={`${group.value}-ps`}
                                                          className="text-muted-foreground px-2 py-1 text-center text-[11px]"
                                                      >
                                                          PS
                                                      </th>,
                                                      <th
                                                          key={`${group.value}-ws`}
                                                          className="text-muted-foreground px-2 py-1 text-center text-[11px]"
                                                      >
                                                          WS
                                                      </th>,
                                                  ]
                                                : [
                                                      ...group.assessments.map((assessment, index) => (
                                                          <th
                                                              key={assessment.id}
                                                              className={cn(
                                                                  'text-muted-foreground min-w-[4.25rem] px-1 py-1 text-center text-[11px] font-medium',
                                                                  index === 0 && 'border-border border-l',
                                                              )}
                                                              title={`${assessment.title} · highest possible score ${assessment.highest_possible_score}`}
                                                          >
                                                              <div className="flex flex-col items-center gap-0.5">
                                                                  <span className="max-w-16 truncate">
                                                                      {group.abbreviation}
                                                                      {index + 1}
                                                                  </span>
                                                                  <span className="tabular opacity-60">/{assessment.highest_possible_score}</span>
                                                                  {canEdit && (
                                                                      <ConfirmDelete
                                                                          url={`/class-record/${subjectClass.id}/assessments/${assessment.id}`}
                                                                          title={`Delete ${assessment.title}?`}
                                                                          description="The column and every score in it will be removed, and the quarter recomputed."
                                                                          trigger={
                                                                              <button
                                                                                  type="button"
                                                                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                                                                  title="Delete column"
                                                                              >
                                                                                  <Trash2 className="size-3" />
                                                                              </button>
                                                                          }
                                                                      />
                                                                  )}
                                                              </div>
                                                          </th>
                                                      )),
                                                      <th
                                                          key={`${group.value}-ps`}
                                                          className="border-border text-muted-foreground border-l px-2 py-1 text-center text-[11px]"
                                                      >
                                                          PS
                                                      </th>,
                                                      <th
                                                          key={`${group.value}-ws`}
                                                          className="text-muted-foreground px-2 py-1 text-center text-[11px]"
                                                      >
                                                          WS
                                                      </th>,
                                                  ],
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((row) => (
                                        <tr key={row.student_id} className="border-border hover:bg-muted/30 border-b transition-colors">
                                            <td className="bg-card sticky left-0 z-10 px-3 py-1.5">
                                                <div className="truncate font-medium">{row.name}</div>
                                                <div className="text-muted-foreground tabular text-[11px]">{row.lrn}</div>
                                            </td>

                                            {components.map((group) => {
                                                const prefix = PREFIX[group.value];

                                                return [
                                                    ...(group.assessments.length === 0
                                                        ? [
                                                              <td
                                                                  key={`${group.value}-empty`}
                                                                  className="border-border text-muted-foreground border-l px-2 py-1 text-center text-xs"
                                                              >
                                                                  —
                                                              </td>,
                                                          ]
                                                        : group.assessments.map((assessment, index) => (
                                                              <td
                                                                  key={assessment.id}
                                                                  className={cn('px-1 py-1', index === 0 && 'border-border border-l')}
                                                              >
                                                                  <Input
                                                                      type="number"
                                                                      min={0}
                                                                      max={assessment.highest_possible_score}
                                                                      step="0.25"
                                                                      disabled={!canEdit}
                                                                      value={cellValue(row, assessment.id)}
                                                                      onChange={(e) => setCell(row.student_id, assessment.id, e.target.value)}
                                                                      className={cn(
                                                                          'score-input tabular h-8 w-16 px-1 text-center text-sm',
                                                                          `${row.student_id}:${assessment.id}` in edits &&
                                                                              'border-primary bg-primary/5',
                                                                      )}
                                                                  />
                                                              </td>
                                                          ))),
                                                    <td
                                                        key={`${group.value}-ps`}
                                                        className="border-border tabular text-muted-foreground border-l px-2 py-1 text-center text-xs"
                                                    >
                                                        {row[`${prefix}_ps`]?.toFixed(2) ?? '—'}
                                                    </td>,
                                                    <td key={`${group.value}-ws`} className="tabular px-2 py-1 text-center text-xs font-medium">
                                                        {row[`${prefix}_ws`]?.toFixed(2) ?? '—'}
                                                    </td>,
                                                ];
                                            })}

                                            <td className="border-border tabular border-l px-2 py-1 text-center text-xs">
                                                {row.initial_grade?.toFixed(2) ?? '—'}
                                            </td>
                                            <td className="px-2 py-1 text-center">
                                                <GradeBadge grade={row.final_grade} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <p className="text-muted-foreground text-xs">
                PS = percentage score (raw ÷ highest possible × 100). WS = weighted score (PS × component weight). The initial grade is the sum of the
                three weighted scores, transmuted to the 60–100 scale under DepEd Order No. 8, s. 2015. A grade appears only once all three components
                have at least one encoded score.
                {totalColumns === 0 && ' Add an assessment column to begin encoding.'}
            </p>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add assessment</DialogTitle>
                        <DialogDescription>A new column in the class record for {quarter.name}.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitAdd} className="grid gap-3">
                        <div className="grid gap-1.5">
                            <Label>Component</Label>
                            <Select value={addForm.data.component} onValueChange={(value) => addForm.setData('component', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {components.map((group) => (
                                        <SelectItem key={group.value} value={group.value}>
                                            {group.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={addForm.errors.component} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Title</Label>
                            <Input
                                value={addForm.data.title}
                                onChange={(e) => addForm.setData('title', e.target.value)}
                                placeholder="Written Work 5"
                            />
                            <InputError message={addForm.errors.title} />
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="grid gap-1.5">
                                <Label>Highest possible score</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={addForm.data.highest_possible_score}
                                    onChange={(e) => addForm.setData('highest_possible_score', Number(e.target.value))}
                                />
                                <InputError message={addForm.errors.highest_possible_score} />
                            </div>
                            <div className="grid gap-1.5">
                                <Label>Date given</Label>
                                <Input type="date" value={addForm.data.date_given} onChange={(e) => addForm.setData('date_given', e.target.value)} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={addForm.processing}>
                                {addForm.processing && <Loader2 className="size-4 animate-spin" />}
                                Add column
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
