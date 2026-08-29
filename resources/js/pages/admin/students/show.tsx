import { EmptyState } from '@/components/empty-state';
import { GradeBadge } from '@/components/grade-badge';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { GraduationCap, Pencil, Printer } from 'lucide-react';

interface Props {
    student: {
        id: number;
        lrn: string;
        full_name: string;
        first_name: string;
        last_name: string;
        sex: string | null;
        birthdate: string | null;
        birthplace: string | null;
        address: string | null;
        contact_number: string | null;
        guardian_name: string | null;
        guardian_contact: string | null;
        guardian_relationship: string | null;
        status: string;
        enrollments: {
            id: number;
            status: string;
            date_enrolled: string;
            section: { name: string; strand: { code: string; name: string } };
            semester: { id: number; name: string };
        }[];
    };
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
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="border-border/70 flex justify-between gap-4 border-b py-2 last:border-0">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className="text-right text-sm font-medium">{value || '—'}</span>
        </div>
    );
}

export default function StudentShow({ student, record }: Props) {
    const current = student.enrollments.find((e) => e.semester.id === record?.semester.id) ?? student.enrollments[0];

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Students', href: '/admin/students' },
                { title: student.full_name, href: '#' },
            ]}
        >
            <Head title={student.full_name} />

            <PageHeader
                title={student.full_name}
                description={`LRN ${student.lrn}${current ? ` · ${current.section.name}` : ''}`}
                actions={
                    <>
                        {record && (
                            <Button variant="outline" asChild>
                                <a href={`/reports/report-card/${student.id}?semester=${record.semester.id}`} target="_blank" rel="noreferrer">
                                    <Printer className="size-4" /> Report card
                                </a>
                            </Button>
                        )}
                        <Button asChild>
                            <Link href={`/admin/students/${student.id}/edit`}>
                                <Pencil className="size-4" /> Edit
                            </Link>
                        </Button>
                    </>
                }
            />

            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Learner Information</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-1">
                            <Detail label="LRN" value={student.lrn} />
                            <Detail label="Sex" value={student.sex ? student.sex[0].toUpperCase() + student.sex.slice(1) : null} />
                            <Detail label="Birthdate" value={student.birthdate?.slice(0, 10)} />
                            <Detail label="Birthplace" value={student.birthplace} />
                            <Detail label="Contact" value={student.contact_number} />
                            <Detail label="Address" value={student.address} />
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-muted-foreground text-sm">Status</span>
                                <Badge variant={student.status === 'active' ? 'secondary' : 'outline'} className="capitalize">
                                    {student.status}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Parent / Guardian</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-1">
                            <Detail label="Name" value={student.guardian_name} />
                            <Detail label="Relationship" value={student.guardian_relationship} />
                            <Detail label="Contact" value={student.guardian_contact} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">Enrollment History</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 pt-1">
                            {student.enrollments.length === 0 ? (
                                <p className="text-muted-foreground text-sm">Not yet enrolled in any semester.</p>
                            ) : (
                                student.enrollments.map((enrollment) => (
                                    <div key={enrollment.id} className="border-border rounded-md border p-2.5">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-medium">{enrollment.section.name}</span>
                                            <Badge variant="outline" className="capitalize">
                                                {enrollment.status}
                                            </Badge>
                                        </div>
                                        <div className="text-muted-foreground text-xs">
                                            {enrollment.semester.name} · {enrollment.section.strand.code}
                                        </div>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="lg:col-span-2">
                    <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                        <div>
                            <CardTitle className="text-base">Grades</CardTitle>
                            {record && <p className="text-muted-foreground mt-0.5 text-xs">{record.semester.name}</p>}
                        </div>
                        {record?.general_average !== null && record !== null && (
                            <div className="text-right">
                                <div className="text-muted-foreground text-[10px] tracking-wide uppercase">General Average</div>
                                <div className="tabular text-primary text-2xl leading-tight font-bold">{record.general_average}</div>
                                <div className="text-muted-foreground text-xs">{record.descriptor}</div>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                        {!record || record.subjects.length === 0 ? (
                            <EmptyState
                                icon={GraduationCap}
                                title="No grades encoded"
                                description="This learner has no computed grades for the active semester yet."
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Subject</TableHead>
                                        <TableHead>Teacher</TableHead>
                                        {record.quarters.map((quarter) => (
                                            <TableHead key={quarter.id} className="text-center">
                                                Q{quarter.number}
                                            </TableHead>
                                        ))}
                                        <TableHead className="text-center">Final</TableHead>
                                        <TableHead className="pr-6">Remarks</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {record.subjects.map((subject) => (
                                        <TableRow key={subject.subject_class_id}>
                                            <TableCell className="pl-6">
                                                <div className="text-sm font-medium">{subject.subject_code}</div>
                                                <div className="text-muted-foreground truncate text-xs">{subject.subject_title}</div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-xs">{subject.teacher ?? '—'}</TableCell>
                                            {record.quarters.map((quarter) => (
                                                <TableCell key={quarter.id} className="tabular text-center text-sm">
                                                    {subject.quarters[quarter.number] ?? '—'}
                                                </TableCell>
                                            ))}
                                            <TableCell className="text-center">
                                                <GradeBadge grade={subject.semestral_final} />
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <span
                                                    className={`text-xs capitalize ${subject.remarks === 'failed' ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}
                                                >
                                                    {subject.remarks ?? '—'}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
