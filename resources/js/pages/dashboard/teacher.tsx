import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { BookMarked, CalendarDays, ClipboardList, Library, PenLine, Users } from 'lucide-react';

interface ClassRow {
    id: number;
    subject_code: string;
    subject_title: string;
    section: string;
    schedule: string | null;
    room: string | null;
    students: number;
    graded: number;
    progress: number;
    quarter_id: number | null;
}

interface Props {
    teacher: { name: string | null; position: string | null; department: string | null; advisory: string | null };
    stats: { classes: number; sections: number; students: number; subjects: number };
    openQuarter: { id: number; name: string } | null;
    classes: ClassRow[];
    upcomingEvents: { id: number; title: string; month: string; day: string; when: string; location: string | null }[];
}

export default function TeacherDashboard({ teacher, stats, openQuarter, classes, upcomingEvents }: Props) {
    const { activeSemester } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />

            <PageHeader
                title="Dashboard"
                description={
                    activeSemester
                        ? `Welcome back, ${teacher.name}. ${activeSemester.name}, S.Y. ${activeSemester.school_year.name}.`
                        : `Welcome back, ${teacher.name}.`
                }
                actions={
                    openQuarter ? (
                        <Badge variant="secondary" className="gap-1.5 py-1.5">
                            <PenLine className="size-3.5" /> Encoding open — {openQuarter.name}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="py-1.5">
                            All quarters closed
                        </Badge>
                    )
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="My Classes" value={stats.classes} icon={ClipboardList} tone="crimson" href="/teacher/classes" />
                <StatCard label="Sections Handled" value={stats.sections} icon={BookMarked} tone="navy" />
                <StatCard label="Learners" value={stats.students} icon={Users} tone="laurel" />
                <StatCard label="Subjects" value={stats.subjects} icon={Library} tone="ochre" />
            </div>

            {teacher.advisory && (
                <Card className="border-primary/20 bg-primary/[0.03]">
                    <CardContent className="flex flex-wrap items-center gap-2 py-3 text-sm">
                        <BookMarked className="text-primary size-4" />
                        <span className="font-medium">Advisory class:</span>
                        <span>{teacher.advisory}</span>
                        <span className="text-muted-foreground">
                            · {teacher.position} · {teacher.department}
                        </span>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Encoding Progress{openQuarter ? ` — ${openQuarter.name}` : ''}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1">
                        {classes.length === 0 ? (
                            <EmptyState
                                icon={ClipboardList}
                                title="No classes assigned"
                                description="The registrar has not assigned you a teaching load for this semester yet."
                            />
                        ) : (
                            <ul className="space-y-2.5">
                                {classes.map((row) => (
                                    <li key={row.id} className="border-border rounded-lg border p-3">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold">
                                                    {row.subject_code} — {row.section}
                                                </div>
                                                <div className="text-muted-foreground truncate text-xs">
                                                    {row.subject_title}
                                                    {row.schedule ? ` · ${row.schedule}` : ''}
                                                    {row.room ? ` · ${row.room}` : ''}
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={`/class-record/${row.id}${row.quarter_id ? `?quarter=${row.quarter_id}` : ''}`}>
                                                    Open class record
                                                </Link>
                                            </Button>
                                        </div>
                                        <div className="mt-2.5 flex items-center gap-3">
                                            <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                                                <div
                                                    className="bg-primary h-full rounded-full transition-all"
                                                    style={{ width: `${row.progress}%` }}
                                                />
                                            </div>
                                            <span className="tabular text-muted-foreground shrink-0 text-xs">
                                                {row.graded}/{row.students} graded
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
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
