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
import { BookMarked, FileText, LoaderCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface SectionRow {
    id: number;
    name: string;
    grade_level: number;
    strand_id: number;
    strand: string;
    track: string;
    adviser_id: number | null;
    adviser: string | null;
    room: string | null;
    capacity: number;
    enrolled: number;
    is_active: boolean;
}

interface Props {
    sections: Paginated<SectionRow>;
    strands: { id: number; code: string; name: string }[];
    teachers: { id: number; name: string }[];
    filters: { search?: string; strand_id?: string };
}

const ALL = 'all';
const NONE = 'none';

export default function SectionsIndex({ sections, strands, teachers, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [editing, setEditing] = useState<SectionRow | null>(null);
    const [open, setOpen] = useState(false);

    const form = useForm({
        name: '',
        strand_id: '',
        adviser_id: '',
        grade_level: 12,
        room: '',
        capacity: 45,
        is_active: true as boolean,
    });

    useEffect(() => {
        if (search === (filters.search ?? '')) return;
        const timer = setTimeout(() => {
            router.get('/admin/sections', { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const openCreate = () => {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setOpen(true);
    };

    const openEdit = (section: SectionRow) => {
        setEditing(section);
        form.clearErrors();
        form.setData({
            name: section.name,
            strand_id: String(section.strand_id),
            adviser_id: section.adviser_id ? String(section.adviser_id) : '',
            grade_level: section.grade_level,
            room: section.room ?? '',
            capacity: section.capacity,
            is_active: section.is_active,
        });
        setOpen(true);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };
        if (editing) {
            form.put(`/admin/sections/${editing.id}`, options);
        } else {
            form.post('/admin/sections', options);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Sections', href: '/admin/sections' },
            ]}
        >
            <Head title="Sections" />

            <PageHeader
                title="Sections"
                description="Grade 12 sections, their strand, adviser and how full they are."
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="size-4" /> Add Section
                    </Button>
                }
            />

            <Card>
                <CardContent className="space-y-3 p-3">
                    <div className="flex flex-wrap gap-2">
                        <div className="relative min-w-56 flex-1">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input placeholder="Search sections…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <Select
                            value={filters.strand_id ?? ALL}
                            onValueChange={(value) =>
                                router.get(
                                    '/admin/sections',
                                    { ...filters, search: search || undefined, strand_id: value === ALL ? undefined : value },
                                    { preserveState: true, replace: true },
                                )
                            }
                        >
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="All strands" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All strands</SelectItem>
                                {strands.map((strand) => (
                                    <SelectItem key={strand.id} value={String(strand.id)}>
                                        {strand.code}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {sections.data.length === 0 ? (
                        <EmptyState icon={BookMarked} title="No sections found" description="Create a section to start enrolling learners." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Strand</TableHead>
                                    <TableHead>Adviser</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead className="text-center">Enrolled</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sections.data.map((section) => {
                                    const fill = section.capacity > 0 ? Math.round((section.enrolled / section.capacity) * 100) : 0;

                                    return (
                                        <TableRow key={section.id}>
                                            <TableCell>
                                                <div className="text-sm font-semibold">{section.name}</div>
                                                <div className="text-muted-foreground text-xs">Grade {section.grade_level}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{section.strand}</Badge>
                                                <div className="text-muted-foreground mt-0.5 text-xs">{section.track}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {section.adviser ?? <span className="text-muted-foreground">Unassigned</span>}
                                            </TableCell>
                                            <TableCell className="text-sm">{section.room ?? '—'}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="tabular text-sm">
                                                        {section.enrolled} / {section.capacity}
                                                    </span>
                                                    <div className="bg-muted h-1 w-16 overflow-hidden rounded-full">
                                                        <div
                                                            className={fill >= 100 ? 'bg-destructive h-full' : 'bg-primary h-full'}
                                                            style={{ width: `${Math.min(100, fill)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="size-8" asChild title="Master list">
                                                        <a href={`/reports/master-list/${section.id}`} target="_blank" rel="noreferrer">
                                                            <FileText className="size-4" />
                                                        </a>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                        onClick={() => openEdit(section)}
                                                        title="Edit"
                                                    >
                                                        <Pencil className="size-4" />
                                                    </Button>
                                                    <ConfirmDelete
                                                        url={`/admin/sections/${section.id}`}
                                                        title={`Remove ${section.name}?`}
                                                        description="Enrolments, classes and grades attached to this section will be deleted."
                                                        trigger={
                                                            <Button variant="ghost" size="icon" className="text-destructive size-8" title="Delete">
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        }
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}

                    <Pagination meta={sections} label="sections" />
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Section' : 'Add Section'}</DialogTitle>
                        <DialogDescription>Sections belong to the active school year.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label>Section name</Label>
                            <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="12-STEM A" />
                            <InputError message={form.errors.name} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Grade level</Label>
                            <Select value={String(form.data.grade_level)} onValueChange={(value) => form.setData('grade_level', Number(value))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="11">Grade 11</SelectItem>
                                    <SelectItem value="12">Grade 12</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Strand</Label>
                            <Select value={form.data.strand_id} onValueChange={(value) => form.setData('strand_id', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select strand" />
                                </SelectTrigger>
                                <SelectContent>
                                    {strands.map((strand) => (
                                        <SelectItem key={strand.id} value={String(strand.id)}>
                                            {strand.code} — {strand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.strand_id} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Adviser</Label>
                            <Select
                                value={form.data.adviser_id || NONE}
                                onValueChange={(value) => form.setData('adviser_id', value === NONE ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Unassigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>Unassigned</SelectItem>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher.id} value={String(teacher.id)}>
                                            {teacher.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Room</Label>
                            <Input value={form.data.room} onChange={(e) => form.setData('room', e.target.value)} placeholder="Room 301" />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Capacity</Label>
                            <Input
                                type="number"
                                min={1}
                                value={form.data.capacity}
                                onChange={(e) => form.setData('capacity', Number(e.target.value))}
                            />
                            <InputError message={form.errors.capacity} />
                        </div>
                        <div className="flex items-center gap-2 sm:col-span-2">
                            <Switch
                                checked={form.data.is_active}
                                onCheckedChange={(checked) => form.setData('is_active', checked)}
                                id="section-active"
                            />
                            <Label htmlFor="section-active">Active</Label>
                        </div>

                        <DialogFooter className="sm:col-span-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                                {editing ? 'Save changes' : 'Add section'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
