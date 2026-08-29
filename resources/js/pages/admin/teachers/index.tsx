import { ConfirmDelete } from '@/components/confirm-delete';
import { EmptyState } from '@/components/empty-state';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type Paginated } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle, Pencil, Plus, Search, Trash2, UserCheck } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface TeacherRow {
    id: number;
    employee_no: string;
    full_name: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    sex: string | null;
    position: string | null;
    department: string | null;
    contact_number: string | null;
    email: string;
    is_active: boolean;
    load: number;
    advisory: string;
}

interface Props {
    teachers: Paginated<TeacherRow>;
    departments: string[];
    filters: { search?: string; department?: string };
}

const ALL = 'all';
const NONE = 'none';

export default function TeachersIndex({ teachers, departments, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [editing, setEditing] = useState<TeacherRow | null>(null);
    const [open, setOpen] = useState(false);

    const form = useForm({
        employee_no: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        sex: '',
        position: '',
        department: '',
        contact_number: '',
        email: '',
        is_active: true as boolean,
    });

    useEffect(() => {
        if (search === (filters.search ?? '')) return;
        const timer = setTimeout(() => {
            router.get('/admin/teachers', { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const openCreate = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setOpen(true);
    };

    const openEdit = (teacher: TeacherRow) => {
        setEditing(teacher);
        form.clearErrors();
        form.setData({
            employee_no: teacher.employee_no,
            first_name: teacher.first_name,
            middle_name: teacher.middle_name ?? '',
            last_name: teacher.last_name,
            suffix: '',
            sex: teacher.sex ?? '',
            position: teacher.position ?? '',
            department: teacher.department ?? '',
            contact_number: teacher.contact_number ?? '',
            email: teacher.email,
            is_active: teacher.is_active,
        });
        setOpen(true);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };
        editing ? form.put(`/admin/teachers/${editing.id}`, options) : form.post('/admin/teachers', options);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Teachers', href: '/admin/teachers' },
            ]}
        >
            <Head title="Teachers" />

            <PageHeader
                title="Teachers"
                description="Faculty records, teaching load and advisory assignments."
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="size-4" /> Add Teacher
                    </Button>
                }
            />

            <Card>
                <CardContent className="space-y-3 p-3">
                    <div className="flex flex-wrap gap-2">
                        <div className="relative min-w-56 flex-1">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search by name or employee no…"
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select
                            value={filters.department ?? ALL}
                            onValueChange={(value) =>
                                router.get(
                                    '/admin/teachers',
                                    { ...filters, search: search || undefined, department: value === ALL ? undefined : value },
                                    { preserveState: true, replace: true },
                                )
                            }
                        >
                            <SelectTrigger className="w-52">
                                <SelectValue placeholder="All departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All departments</SelectItem>
                                {departments.map((department) => (
                                    <SelectItem key={department} value={department}>
                                        {department}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {teachers.data.length === 0 ? (
                        <EmptyState icon={UserCheck} title="No teachers found" description="Adjust the filters, or add a faculty member." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Employee No.</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead className="text-center">Load</TableHead>
                                    <TableHead>Advisory</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {teachers.data.map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="tabular text-muted-foreground text-xs">{teacher.employee_no}</TableCell>
                                        <TableCell>
                                            <div className="text-sm font-medium">{teacher.full_name}</div>
                                            <div className="text-muted-foreground text-xs">{teacher.email}</div>
                                        </TableCell>
                                        <TableCell className="text-sm">{teacher.position ?? '—'}</TableCell>
                                        <TableCell className="text-sm">{teacher.department ?? '—'}</TableCell>
                                        <TableCell className="tabular text-center text-sm">{teacher.load}</TableCell>
                                        <TableCell className="text-sm">
                                            {teacher.advisory ? (
                                                <Badge variant="secondary">{teacher.advisory}</Badge>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(teacher)} title="Edit">
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <ConfirmDelete
                                                    url={`/admin/teachers/${teacher.id}`}
                                                    title={`Remove ${teacher.full_name}?`}
                                                    description="This deletes the faculty record and their portal login. Classes they handle will be left unassigned."
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

                    <Pagination meta={teachers} label="teachers" />
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Update this faculty record.' : 'A portal login is created automatically with the password "password".'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label>Employee No.</Label>
                            <Input value={form.data.employee_no} onChange={(e) => form.setData('employee_no', e.target.value)} />
                            <InputError message={form.errors.employee_no} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Email</Label>
                            <Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                            <InputError message={form.errors.email} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>First Name</Label>
                            <Input value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} />
                            <InputError message={form.errors.first_name} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Middle Name</Label>
                            <Input value={form.data.middle_name} onChange={(e) => form.setData('middle_name', e.target.value)} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Last Name</Label>
                            <Input value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)} />
                            <InputError message={form.errors.last_name} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Sex</Label>
                            <Select value={form.data.sex || NONE} onValueChange={(value) => form.setData('sex', value === NONE ? '' : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>Not specified</SelectItem>
                                    <SelectItem value="male">Male</SelectItem>
                                    <SelectItem value="female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Position</Label>
                            <Input value={form.data.position} onChange={(e) => form.setData('position', e.target.value)} placeholder="Teacher III" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Department</Label>
                            <Input
                                value={form.data.department}
                                onChange={(e) => form.setData('department', e.target.value)}
                                placeholder="Mathematics"
                            />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Contact Number</Label>
                            <Input value={form.data.contact_number} onChange={(e) => form.setData('contact_number', e.target.value)} />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <Switch
                                checked={form.data.is_active}
                                onCheckedChange={(checked) => form.setData('is_active', checked)}
                                id="teacher-active"
                            />
                            <Label htmlFor="teacher-active">Active</Label>
                        </div>

                        <DialogFooter className="sm:col-span-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                                {editing ? 'Save changes' : 'Add teacher'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
