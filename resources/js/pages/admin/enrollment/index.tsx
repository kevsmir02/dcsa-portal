import { ConfirmDelete } from '@/components/confirm-delete';
import { EmptyState } from '@/components/empty-state';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type Paginated, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ClipboardList, LoaderCircle, Search, Trash2, UserPlus } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface EnrollmentRow {
    id: number;
    student_id: number;
    lrn: string;
    student: string;
    section_id: number;
    section: string;
    date_enrolled: string;
    status: string;
}

interface Props {
    enrollments: Paginated<EnrollmentRow>;
    sections: { id: number; name: string; capacity: number; enrolled: number; slots: number }[];
    unenrolled: { id: number; label: string }[];
    filters: { search?: string; section_id?: string; status?: string };
}

const ALL = 'all';

export default function EnrollmentIndex({ enrollments, sections, unenrolled, filters }: Props) {
    const { activeSemester } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search ?? '');
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<EnrollmentRow | null>(null);

    const enrollForm = useForm({ student_id: '', section_id: '' });
    const updateForm = useForm({ section_id: '', status: 'enrolled', remarks: '' });

    useEffect(() => {
        if (search === (filters.search ?? '')) return;
        const timer = setTimeout(() => {
            router.get('/admin/enrollment', { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const applyFilter = (key: string, value: string) =>
        router.get(
            '/admin/enrollment',
            { ...filters, search: search || undefined, [key]: value === ALL ? undefined : value },
            { preserveState: true, replace: true },
        );

    const submitEnroll: FormEventHandler = (e) => {
        e.preventDefault();
        enrollForm.post('/admin/enrollment', { preserveScroll: true, onSuccess: () => enrollForm.reset() });
    };

    const openEdit = (enrollment: EnrollmentRow) => {
        setEditing(enrollment);
        updateForm.clearErrors();
        updateForm.setData({ section_id: String(enrollment.section_id), status: enrollment.status, remarks: '' });
        setOpen(true);
    };

    const submitUpdate: FormEventHandler = (e) => {
        e.preventDefault();
        updateForm.patch(`/admin/enrollment/${editing!.id}`, { preserveScroll: true, onSuccess: () => setOpen(false) });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Enrollment', href: '/admin/enrollment' },
            ]}
        >
            <Head title="Enrollment" />

            <PageHeader
                title="Enrollment"
                description={
                    activeSemester
                        ? `Learners enrolled for ${activeSemester.name}, S.Y. ${activeSemester.school_year.name}.`
                        : 'Learners enrolled for the active semester.'
                }
            />

            <div className="grid gap-4 lg:grid-cols-4">
                <Card className="lg:col-span-1">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Enroll a learner</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <form onSubmit={submitEnroll} className="space-y-3">
                            <div className="grid gap-1.5">
                                <Label>Student</Label>
                                <Select value={enrollForm.data.student_id} onValueChange={(value) => enrollForm.setData('student_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a learner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {unenrolled.length === 0 ? (
                                            <div className="text-muted-foreground px-2 py-4 text-center text-xs">Everyone is already enrolled.</div>
                                        ) : (
                                            unenrolled.map((student) => (
                                                <SelectItem key={student.id} value={String(student.id)}>
                                                    {student.label}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError message={enrollForm.errors.student_id} />
                            </div>

                            <div className="grid gap-1.5">
                                <Label>Section</Label>
                                <Select value={enrollForm.data.section_id} onValueChange={(value) => enrollForm.setData('section_id', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map((section) => (
                                            <SelectItem key={section.id} value={String(section.id)} disabled={section.slots === 0}>
                                                {section.name} — {section.slots} slot{section.slots === 1 ? '' : 's'} left
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={enrollForm.errors.section_id} />
                            </div>

                            <Button type="submit" className="w-full" disabled={enrollForm.processing}>
                                {enrollForm.processing ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                                Enroll
                            </Button>
                        </form>

                        <div className="border-border space-y-1.5 border-t pt-3">
                            <div className="text-muted-foreground text-xs font-medium tracking-wide uppercase">Section capacity</div>
                            {sections.map((section) => {
                                const fill = section.capacity > 0 ? Math.round((section.enrolled / section.capacity) * 100) : 0;

                                return (
                                    <div key={section.id} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span>{section.name}</span>
                                            <span className="tabular text-muted-foreground">
                                                {section.enrolled}/{section.capacity}
                                            </span>
                                        </div>
                                        <div className="bg-muted h-1 overflow-hidden rounded-full">
                                            <div
                                                className={fill >= 100 ? 'bg-destructive h-full' : 'bg-primary h-full'}
                                                style={{ width: `${Math.min(100, fill)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardContent className="space-y-3 p-3">
                        <div className="flex flex-wrap gap-2">
                            <div className="relative min-w-52 flex-1">
                                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                                <Input placeholder="Search learners…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                            </div>
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
                            <Select value={filters.status ?? ALL} onValueChange={(value) => applyFilter('status', value)}>
                                <SelectTrigger className="w-36">
                                    <SelectValue placeholder="All statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>All statuses</SelectItem>
                                    <SelectItem value="enrolled">Enrolled</SelectItem>
                                    <SelectItem value="dropped">Dropped</SelectItem>
                                    <SelectItem value="transferred">Transferred</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {enrollments.data.length === 0 ? (
                            <EmptyState icon={ClipboardList} title="No enrolments found" description="Enrol a learner using the form on the left." />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>LRN</TableHead>
                                        <TableHead>Learner</TableHead>
                                        <TableHead>Section</TableHead>
                                        <TableHead>Date Enrolled</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {enrollments.data.map((enrollment) => (
                                        <TableRow key={enrollment.id}>
                                            <TableCell className="tabular text-muted-foreground text-xs">{enrollment.lrn}</TableCell>
                                            <TableCell className="text-sm font-medium">{enrollment.student}</TableCell>
                                            <TableCell className="text-sm">{enrollment.section}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{enrollment.date_enrolled}</TableCell>
                                            <TableCell>
                                                <Badge variant={enrollment.status === 'enrolled' ? 'secondary' : 'outline'} className="capitalize">
                                                    {enrollment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => openEdit(enrollment)}>
                                                        Transfer / Drop
                                                    </Button>
                                                    <ConfirmDelete
                                                        url={`/admin/enrollment/${enrollment.id}`}
                                                        title={`Remove ${enrollment.student}'s enrolment?`}
                                                        description="This removes the enrolment record for this semester. Grades already computed stay in place."
                                                        trigger={
                                                            <Button variant="ghost" size="icon" className="text-destructive size-8" title="Delete">
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        <Pagination meta={enrollments} label="enrolments" />
                    </CardContent>
                </Card>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update enrolment</DialogTitle>
                        <DialogDescription>{editing?.student}</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submitUpdate} className="grid gap-3">
                        <div className="grid gap-1.5">
                            <Label>Section</Label>
                            <Select value={updateForm.data.section_id} onValueChange={(value) => updateForm.setData('section_id', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((section) => (
                                        <SelectItem key={section.id} value={String(section.id)}>
                                            {section.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Status</Label>
                            <Select value={updateForm.data.status} onValueChange={(value) => updateForm.setData('status', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="enrolled">Enrolled</SelectItem>
                                    <SelectItem value="dropped">Dropped</SelectItem>
                                    <SelectItem value="transferred">Transferred</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Remarks</Label>
                            <Input value={updateForm.data.remarks} onChange={(e) => updateForm.setData('remarks', e.target.value)} />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateForm.processing}>
                                {updateForm.processing && <LoaderCircle className="size-4 animate-spin" />}
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
