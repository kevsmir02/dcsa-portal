import { EmptyState } from '@/components/empty-state';
import { GradeBadge } from '@/components/grade-badge';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { GraduationCap, Printer } from 'lucide-react';

interface QuarterFigures {
    ww_ps: number | null;
    pt_ps: number | null;
    qa_ps: number | null;
    ww_ws: number | null;
    pt_ws: number | null;
    qa_ws: number | null;
    initial_grade: number | null;
    final_grade: number | null;
}

interface Props {
    student: { id: number; lrn: string; full_name: string; section: string | null; strand: string | null } | null;
    semesters: { id: number; label: string }[];
    selectedSemester: number | null;
    record: {
        semester: { id: number; name: string };
        quarters: { id: number; number: number; name: string }[];
        subjects: {
            subject_class_id: number;
            subject_code: string;
            subject_title: string;
            teacher: string | null;
            quarters: Record<number, number | null>;
            semestral_final: number | null;
            descriptor: string;
            remarks: string | null;
        }[];
        general_average: number | null;
        descriptor: string;
    } | null;
    breakdown: Record<number, Record<number, QuarterFigures>>;
}

export default function StudentGrades({ student, semesters, selectedSemester, record, breakdown }: Props) {
    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'My Grades', href: '/student/grades' },
            ]}
        >
            <Head title="My Grades" />

            <PageHeader
                title="My Grades"
                description={student ? `${student.full_name} · ${student.section ?? 'Unassigned'} · LRN ${student.lrn}` : undefined}
                actions={
                    <>
                        <Select
                            value={selectedSemester ? String(selectedSemester) : undefined}
                            onValueChange={(value) => router.get('/student/grades', { semester: value }, { preserveState: true })}
                        >
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Select semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map((semester) => (
                                    <SelectItem key={semester.id} value={String(semester.id)}>
                                        {semester.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {record && student && (
                            <Button variant="outline" asChild>
                                <a href={`/reports/report-card/${student.id}?semester=${record.semester.id}`} target="_blank" rel="noreferrer">
                                    <Printer className="size-4" /> Print report card
                                </a>
                            </Button>
                        )}
                    </>
                }
            />

            {!record || record.subjects.length === 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <EmptyState
                            icon={GraduationCap}
                            title="No grades yet"
                            description="Your teachers have not encoded grades for this semester yet. Check back after the encoding period."
                        />
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card className="from-primary/8 border-primary/20 bg-gradient-to-r to-transparent">
                        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
                            <div>
                                <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">General Average</div>
                                <div className="flex items-baseline gap-2">
                                    <span className="tabular text-primary text-4xl font-bold">{record.general_average ?? '—'}</span>
                                    <span className="text-sm font-medium">{record.descriptor}</span>
                                </div>
                            </div>
                            <div className="text-muted-foreground text-right text-xs">
                                <div>{record.semester.name}</div>
                                <div>
                                    {student?.section} · {student?.strand}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Subject Grades</CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Subject</TableHead>
                                        <TableHead>Teacher</TableHead>
                                        {record.quarters.map((quarter) => (
                                            <TableHead key={quarter.id} className="text-center">
                                                {quarter.name}
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-center">Final</TableHead>
                                        <TableHead className="pr-6">Descriptor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {record.subjects.map((subject) => (
                                        <TableRow key={subject.subject_class_id}>
                                            <TableCell className="pl-6">
                                                <div className="text-sm font-medium">{subject.subject_code}</div>
                                                <div className="text-muted-foreground text-xs">{subject.subject_title}</div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{subject.teacher ?? '—'}</TableCell>
                                            {record.quarters.map((quarter) => (
                                                <TableCell key={quarter.id} className="text-center">
                                                    <GradeBadge grade={subject.quarters[quarter.number]} />
                                                </TableCell>
                                            ))}
                                            <TableCell className="text-center">
                                                <GradeBadge grade={subject.semestral_final} />
                                            </TableCell>
                                            <TableCell className="text-muted-foreground pr-6 text-xs">{subject.descriptor}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">How each grade was computed</CardTitle>
                            <p className="text-muted-foreground text-xs">
                                Percentage score per component, weighted, summed into an initial grade, then transmuted to the 60–100 scale.
                            </p>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">Subject</TableHead>
                                            <TableHead>Quarter</TableHead>
                                            <TableHead className="text-center">WW %</TableHead>
                                            <TableHead className="text-center">PT %</TableHead>
                                            <TableHead className="text-center">QA %</TableHead>
                                            <TableHead className="text-center">Weighted total</TableHead>
                                            <TableHead className="pr-6 text-center">Transmuted</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {record.subjects.flatMap((subject) =>
                                            record.quarters.map((quarter) => {
                                                const figures = breakdown[subject.subject_class_id]?.[quarter.number];

                                                return (
                                                    <TableRow key={`${subject.subject_class_id}-${quarter.id}`}>
                                                        <TableCell className="pl-6 text-sm font-medium">{subject.subject_code}</TableCell>
                                                        <TableCell className="text-muted-foreground text-xs">{quarter.name}</TableCell>
                                                        <TableCell className="tabular text-center text-xs">
                                                            {figures?.ww_ps?.toFixed(2) ?? '—'}
                                                        </TableCell>
                                                        <TableCell className="tabular text-center text-xs">
                                                            {figures?.pt_ps?.toFixed(2) ?? '—'}
                                                        </TableCell>
                                                        <TableCell className="tabular text-center text-xs">
                                                            {figures?.qa_ps?.toFixed(2) ?? '—'}
                                                        </TableCell>
                                                        <TableCell className="tabular text-center text-sm font-medium">
                                                            {figures?.initial_grade?.toFixed(2) ?? '—'}
                                                        </TableCell>
                                                        <TableCell className="pr-6 text-center">
                                                            <GradeBadge grade={figures?.final_grade ?? null} />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }),
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </AppLayout>
    );
}
