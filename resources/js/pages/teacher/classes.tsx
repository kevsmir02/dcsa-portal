import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type ComponentWeights, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ClipboardList, Clock, Lock, MapPin, Printer, Users } from 'lucide-react';

interface ClassRow {
    id: number;
    subject_code: string;
    subject_title: string;
    subject_type: string;
    section: string;
    strand: string;
    schedule: string | null;
    room: string | null;
    students: number;
    weights: ComponentWeights;
}

interface Props {
    classes: ClassRow[];
    quarters: { id: number; number: number; name: string; is_locked: boolean }[];
}

export default function TeacherClasses({ classes, quarters }: Props) {
    const { activeSemester } = usePage<SharedData>().props;
    const openQuarter = quarters.find((q) => !q.is_locked) ?? quarters[0];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'My Classes', href: '/teacher/classes' },
            ]}
        >
            <Head title="My Classes" />

            <PageHeader
                title="My Classes"
                description={
                    activeSemester
                        ? `Your teaching load for ${activeSemester.name}, S.Y. ${activeSemester.school_year.name}.`
                        : 'Your teaching load for the active semester.'
                }
                actions={
                    <div className="flex flex-wrap gap-1.5">
                        {quarters.map((q) => (
                            <Badge key={q.id} variant={q.is_locked ? 'outline' : 'secondary'} className="gap-1">
                                {q.name}
                                {q.is_locked && <Lock className="size-3" />}
                            </Badge>
                        ))}
                    </div>
                }
            />

            {classes.length === 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <EmptyState
                            icon={ClipboardList}
                            title="No classes assigned"
                            description="The registrar has not assigned you a teaching load for this semester yet."
                        />
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {classes.map((row) => (
                        <Card key={row.id} className="flex flex-col">
                            <CardContent className="flex flex-1 flex-col gap-3 p-4">
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <span className="text-primary text-sm font-bold">{row.subject_code}</span>
                                        <Badge variant="outline" className="text-[10px]">
                                            {row.strand}
                                        </Badge>
                                    </div>
                                    <div className="mt-0.5 leading-snug font-semibold">{row.subject_title}</div>
                                    <div className="text-muted-foreground text-sm">{row.section}</div>
                                </div>

                                <div className="text-muted-foreground space-y-1 text-xs">
                                    {row.schedule && (
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="size-3.5" /> {row.schedule}
                                        </div>
                                    )}
                                    {row.room && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="size-3.5" /> {row.room}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5">
                                        <Users className="size-3.5" /> {row.students} learners
                                    </div>
                                </div>

                                <Badge variant="secondary" className="tabular w-fit text-[11px]">
                                    WW {row.weights.written_work}% · PT {row.weights.performance_task}% · QA {row.weights.quarterly_assessment}%
                                </Badge>

                                <div className="mt-auto flex gap-2 pt-1">
                                    <Button size="sm" className="flex-1" asChild>
                                        <Link href={`/class-record/${row.id}${openQuarter ? `?quarter=${openQuarter.id}` : ''}`}>Class record</Link>
                                    </Button>
                                    <Button size="sm" variant="outline" asChild title="Print">
                                        <a
                                            href={`/reports/class-record/${row.id}${openQuarter ? `?quarter=${openQuarter.id}` : ''}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Printer className="size-4" />
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </AppLayout>
    );
}
