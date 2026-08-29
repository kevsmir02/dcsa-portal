import { EmptyState } from '@/components/empty-state';
import { GradeBadge } from '@/components/grade-badge';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Award, BookOpen, CalendarDays, CheckCircle2, GraduationCap, Printer, TriangleAlert } from 'lucide-react';

interface SubjectRow {
    subject_class_id: number;
    subject_code: string;
    subject_title: string;
    teacher: string | null;
    quarters: Record<number, number | null>;
    semestral_final: number | null;
    descriptor: string;
    remarks: string | null;
}

interface Props {
    student: { id: number; lrn: string; full_name: string; section: string | null; strand: string | null; adviser: string | null } | null;
    semester: { id: number; name: string; school_year: string } | null;
    generalAverage: number | null;
    descriptor: string;
    stats: { subjects: number; passing: number; at_risk: number; highest: number | null };
    subjects: SubjectRow[];
    quarters: { number: number; name: string }[];
    upcomingEvents: { id: number; title: string; month: string; day: string; when: string; location: string | null }[];
}

export default function StudentDashboard({ student, semester, generalAverage, descriptor, stats, subjects, quarters, upcomingEvents }: Props) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />

            <PageHeader
                title="Dashboard"
                description={
                    semester
                        ? `Welcome back, ${student?.full_name}. ${semester.name}, S.Y. ${semester.school_year}.`
                        : `Welcome back, ${student?.full_name}.`
                }
                actions={
                    student && (
                        <Button variant="outline" asChild>
                            <a href={`/reports/report-card/${student.id}?semester=${semester?.id ?? ''}`} target="_blank" rel="noreferrer">
                                <Printer className="size-4" /> Print report card
                            </a>
                        </Button>
                    )
                }
            />

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="from-primary/8 border-primary/20 bg-gradient-to-br to-transparent lg:col-span-1">
                    <CardContent className="flex flex-col items-center py-6 text-center">
                        <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">General Average</div>
                        <div className="tabular text-primary mt-1 text-5xl font-bold">{generalAverage ?? '—'}</div>
                        <div className="mt-1 text-sm font-medium">{descriptor}</div>
                        <div className="text-muted-foreground mt-3 text-xs">
                            {student?.section} · {student?.strand}
                        </div>
                        <div className="text-muted-foreground tabular text-xs">LRN {student?.lrn}</div>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
                    <StatCard label="Subjects Enrolled" value={stats.subjects} icon={BookOpen} tone="navy" />
                    <StatCard label="Subjects Passing" value={stats.passing} icon={CheckCircle2} tone="laurel" />
                    <StatCard label="Needs Attention" value={stats.at_risk} icon={TriangleAlert} tone="ochre" hint="Below 80" />
                    <StatCard label="Highest Grade" value={stats.highest ?? '—'} icon={Award} tone="crimson" />
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base">My Grades</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/student/grades">
                                Full breakdown <GraduationCap className="size-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        {subjects.length === 0 ? (
                            <EmptyState
                                icon={GraduationCap}
                                title="No grades yet"
                                description="Your teachers have not encoded grades for this semester yet."
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Subject</TableHead>
                                        {quarters.map((quarter) => (
                                            <TableHead key={quarter.number} className="text-center">
                                                Q{quarter.number}
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-center">Final</TableHead>
                                        <TableHead className="pr-6">Descriptor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subjects.map((subject) => (
                                        <TableRow key={subject.subject_class_id}>
                                            <TableCell className="pl-6">
                                                <div className="text-sm font-medium">{subject.subject_code}</div>
                                                <div className="text-muted-foreground truncate text-xs">{subject.subject_title}</div>
                                            </TableCell>
                                            {quarters.map((quarter) => (
                                                <TableCell key={quarter.number} className="tabular text-center text-sm">
                                                    {subject.quarters[quarter.number] ?? '—'}
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
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Upcoming Events</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1">
                        {upcomingEvents.length === 0 ? (
                            <EmptyState icon={CalendarDays} title="No upcoming events" />
                        ) : (
                            <ul className="space-y-2.5">
                                {upcomingEvents.map((event) => (
                                    <li key={event.id} className="border-border flex gap-3 rounded-lg border p-2.5">
                                        <div className="bg-primary/8 text-primary flex size-11 shrink-0 flex-col items-center justify-center rounded-md">
                                            <span className="text-[10px] font-bold tracking-wide uppercase">{event.month}</span>
                                            <span className="tabular text-base leading-none font-bold">{event.day}</span>
                                        </div>
                                        <div className="min-w-0">
                                            <div className="truncate text-sm font-medium">{event.title}</div>
                                            <div className="text-muted-foreground text-xs">{event.when}</div>
                                            {event.location && <div className="text-muted-foreground truncate text-xs">{event.location}</div>}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
