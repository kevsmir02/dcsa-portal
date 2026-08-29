import { EnrollmentTrend } from '@/components/charts/enrollment-trend';
import { GradeDistribution } from '@/components/charts/grade-distribution';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, BookMarked, CalendarDays, ClipboardList, Library, Plus, UserCheck, Users } from 'lucide-react';

interface Props {
    stats: { students: number; teachers: number; subjects: number; sections: number };
    enrollmentTrend: { month: string; total: number }[];
    gradeDistribution: { label: string; count: number; percentage: number }[];
    recentActivities: { id: number; action: string; description: string; when: string }[];
    latestStudents: { id: number; lrn: string; full_name: string; section: string | null; status: string }[];
    upcomingEvents: { id: number; title: string; month: string; day: string; when: string; location: string | null }[];
}

export default function AdminDashboard({ stats, enrollmentTrend, gradeDistribution, recentActivities, latestStudents, upcomingEvents }: Props) {
    const { auth, activeSemester } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />

            <PageHeader
                title="Dashboard"
                description={
                    activeSemester
                        ? `Welcome back, ${auth.user?.name}. ${activeSemester.name}, S.Y. ${activeSemester.school_year.name}.`
                        : `Welcome back, ${auth.user?.name}.`
                }
                actions={
                    <Button asChild>
                        <Link href="/admin/students/create">
                            <Plus className="size-4" /> Add Student
                        </Link>
                    </Button>
                }
            />

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Total Students" value={stats.students} icon={Users} tone="crimson" href="/admin/students" />
                <StatCard label="Total Teachers" value={stats.teachers} icon={UserCheck} tone="navy" href="/admin/teachers" />
                <StatCard label="Total Subjects" value={stats.subjects} icon={Library} tone="laurel" href="/admin/subjects" />
                <StatCard label="Total Sections" value={stats.sections} icon={BookMarked} tone="ochre" href="/admin/sections" />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Enrollment Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <EnrollmentTrend data={enrollmentTrend} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Grade Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <GradeDistribution data={gradeDistribution} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-1">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">Recent Activities</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-1">
                        {recentActivities.length === 0 ? (
                            <EmptyState icon={ClipboardList} title="Nothing logged yet" />
                        ) : (
                            <ul className="space-y-3">
                                {recentActivities.map((activity) => (
                                    <li key={activity.id} className="flex gap-2.5">
                                        <span className="bg-primary mt-1.5 size-1.5 shrink-0 rounded-full" aria-hidden />
                                        <div className="min-w-0">
                                            <div className="text-sm leading-snug">{activity.description}</div>
                                            <div className="text-muted-foreground text-xs">{activity.when}</div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-base">Latest Students</CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/admin/students">
                                View all <ArrowRight className="size-3.5" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">LRN</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead className="pr-6">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {latestStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="tabular text-muted-foreground pl-6 text-xs">{student.lrn}</TableCell>
                                        <TableCell className="font-medium">
                                            <Link href={`/admin/students/${student.id}`} className="hover:text-primary hover:underline">
                                                {student.full_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{student.section ?? <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                                        <TableCell className="pr-6">
                                            <Badge variant={student.status === 'active' ? 'secondary' : 'outline'} className="capitalize">
                                                {student.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
