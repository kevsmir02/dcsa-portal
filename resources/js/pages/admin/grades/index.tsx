import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, ClipboardList, GraduationCap, Lock, TriangleAlert } from 'lucide-react';

interface ClassRow {
    id: number;
    subject_code: string;
    subject_title: string;
    section: string;
    teacher: string;
    students: number;
    graded: number;
    progress: number;
    average: number | null;
}

interface Props {
    classes: ClassRow[];
    quarters: { id: number; name: string; number: number; is_locked: boolean }[];
    selectedQuarter: number | null;
    sections: { id: number; name: string }[];
    subjects: { id: number; code: string; title: string }[];
    teachers: { id: number; name: string }[];
    filters: { section_id?: string; subject_id?: string; teacher_id?: string };
    summary: { classes: number; complete: number; outstanding: number };
}

const ALL = 'all';

export default function GradesIndex({ classes, quarters, selectedQuarter, sections, subjects, teachers, filters, summary }: Props) {
    const activeQuarter = quarters.find((q) => q.id === selectedQuarter);

    const applyFilter = (key: string, value: string) =>
        router.get(
            '/admin/grades',
            { ...filters, quarter: selectedQuarter, [key]: value === ALL ? undefined : value },
            { preserveState: true, replace: true },
        );

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Grades', href: '/admin/grades' },
            ]}
        >
            <Head title="Grades" />

            <PageHeader
                title="Grades"
                description="Encoding progress across every class this semester."
                actions={
                    activeQuarter?.is_locked && (
                        <Badge variant="outline" className="gap-1.5 py-1.5">
                            <Lock className="size-3.5" /> {activeQuarter.name} is closed
                        </Badge>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Classes" value={summary.classes} icon={ClipboardList} tone="navy" />
                <StatCard label="Fully Encoded" value={summary.complete} icon={CheckCircle2} tone="laurel" />
                <StatCard label="Outstanding" value={summary.outstanding} icon={TriangleAlert} tone="ochre" />
            </div>

            <Card>
                <CardContent className="space-y-3 p-3">
                    <div className="flex flex-wrap gap-2">
                        {quarters.map((q) => (
                            <Button
                                key={q.id}
                                size="sm"
                                variant={q.id === selectedQuarter ? 'default' : 'outline'}
                                onClick={() => router.get('/admin/grades', { ...filters, quarter: q.id }, { preserveState: true })}
                            >
                                {q.name}
                                {q.is_locked && <Lock className="ml-1 size-3" />}
                            </Button>
                        ))}

                        <div className="ml-auto flex flex-wrap gap-2">
                            <Select value={filters.section_id ?? ALL} onValueChange={(value) => applyFilter('section_id', value)}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="All sections" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All sections</SelectItem>
                                    {sections.map((section) => (
                                        <SelectItem key={section.id} value={String(section.id)}>
                                            {section.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.subject_id ?? ALL} onValueChange={(value) => applyFilter('subject_id', value)}>
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder="All subjects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All subjects</SelectItem>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.id} value={String(subject.id)}>
                                            {subject.code}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={filters.teacher_id ?? ALL} onValueChange={(value) => applyFilter('teacher_id', value)}>
                                <SelectTrigger className="w-48">
                                    <SelectValue placeholder="All teachers" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All teachers</SelectItem>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={String(teacher.id)}>
                                            {teacher.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {classes.length === 0 ? (
                        <EmptyState
                            icon={GraduationCap}
                            title="No classes found"
                            description="Adjust the filters, or open classes for this semester first."
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead className="w-52">Encoding progress</TableHead>
                                    <TableHead className="text-center">Class average</TableHead>
                                    <TableHead className="text-right">Class record</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {classes.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableCell>
                                            <div className="text-sm font-semibold">{row.subject_code}</div>
                                            <div className="text-muted-foreground truncate text-xs">{row.subject_title}</div>
                                        </TableCell>
                                        <TableCell className="text-sm">{row.section}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">{row.teacher}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                                                    <div
                                                        className={row.progress === 100 ? 'h-full bg-[hsl(145,56%,32%)]' : 'bg-primary h-full'}
                                                        style={{ width: `${row.progress}%` }}
                                                    />
                                                </div>
                                                <span className="tabular text-muted-foreground w-14 shrink-0 text-right text-xs">
                                                    {row.graded}/{row.students}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="tabular text-center text-sm font-medium">{row.average ?? '—'}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/class-record/${row.id}?quarter=${selectedQuarter}`}>Open</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </AppLayout>
    );
}
