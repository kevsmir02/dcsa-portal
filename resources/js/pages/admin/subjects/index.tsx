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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type ComponentWeights, type Paginated } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Library, LoaderCircle, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

interface SubjectRow {
    id: number;
    code: string;
    title: string;
    type: string;
    type_label: string;
    strand_id: number | null;
    strand: string | null;
    semester_term: number | null;
    hours_per_week: number;
    description: string | null;
    ww_weight: number | null;
    pt_weight: number | null;
    qa_weight: number | null;
    is_active: boolean;
    effective_weights: ComponentWeights;
    has_override: boolean;
}

interface Props {
    subjects: Paginated<SubjectRow>;
    strands: { id: number; code: string; name: string }[];
    types: { value: string; label: string }[];
    filters: { search?: string; type?: string; strand_id?: string };
}

const ALL = 'all';
const NONE = 'none';

export default function SubjectsIndex({ subjects, strands, types, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [editing, setEditing] = useState<SubjectRow | null>(null);
    const [open, setOpen] = useState(false);
    const [customWeights, setCustomWeights] = useState(false);

    const form = useForm({
        code: '',
        title: '',
        type: 'core',
        strand_id: '',
        semester_term: '',
        hours_per_week: 4,
        description: '',
        ww_weight: '' as number | '',
        pt_weight: '' as number | '',
        qa_weight: '' as number | '',
        is_active: true as boolean,
    });

    useEffect(() => {
        if (search === (filters.search ?? '')) return;
        const timer = setTimeout(() => {
            router.get('/admin/subjects', { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 350);
        return () => clearTimeout(timer);
    }, [search]);

    const applyFilter = (key: string, value: string) =>
        router.get(
            '/admin/subjects',
            { ...filters, search: search || undefined, [key]: value === ALL ? undefined : value },
            { preserveState: true, replace: true },
        );

    const openCreate = () => {
        setEditing(null);
        setCustomWeights(false);
        form.reset();
        form.clearErrors();
        setOpen(true);
    };

    const openEdit = (subject: SubjectRow) => {
        setEditing(subject);
        setCustomWeights(subject.has_override);
        form.clearErrors();
        form.setData({
            code: subject.code,
            title: subject.title,
            type: subject.type,
            strand_id: subject.strand_id ? String(subject.strand_id) : '',
            semester_term: subject.semester_term ? String(subject.semester_term) : '',
            hours_per_week: subject.hours_per_week,
            description: subject.description ?? '',
            ww_weight: subject.ww_weight ?? '',
            pt_weight: subject.pt_weight ?? '',
            qa_weight: subject.qa_weight ?? '',
            is_active: subject.is_active,
        });
        setOpen(true);
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => setOpen(false) };

        // Clearing the override hands the subject back to the DepEd default.
        // transform runs at send time, so it beats setData's async state update.
        form.transform((data) => (customWeights ? data : { ...data, ww_weight: '', pt_weight: '', qa_weight: '' }));

        editing ? form.put(`/admin/subjects/${editing.id}`, options) : form.post('/admin/subjects', options);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Subjects', href: '/admin/subjects' },
            ]}
        >
            <Head title="Subjects" />

            <PageHeader
                title="Subjects"
                description="The Grade 12 offering, with the DepEd grading weights that apply to each subject."
                actions={
                    <Button onClick={openCreate}>
                        <Plus className="size-4" /> Add Subject
                    </Button>
                }
            />

            <Card>
                <CardContent className="space-y-3 p-3">
                    <div className="flex flex-wrap gap-2">
                        <div className="relative min-w-56 flex-1">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input
                                placeholder="Search by code or title…"
                                className="pl-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Select value={filters.type ?? ALL} onValueChange={(value) => applyFilter('type', value)}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="All types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All types</SelectItem>
                                {types.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={filters.strand_id ?? ALL} onValueChange={(value) => applyFilter('strand_id', value)}>
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

                    {subjects.data.length === 0 ? (
                        <EmptyState icon={Library} title="No subjects found" description="Adjust the filters, or add a subject to the offering." />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Strand</TableHead>
                                    <TableHead className="text-center">Sem</TableHead>
                                    <TableHead className="text-center">WW / PT / QA</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {subjects.data.map((subject) => (
                                    <TableRow key={subject.id}>
                                        <TableCell className="text-sm font-semibold">{subject.code}</TableCell>
                                        <TableCell className="text-sm">{subject.title}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="text-xs">
                                                {subject.type_label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {subject.strand ?? <span className="text-muted-foreground">All strands</span>}
                                        </TableCell>
                                        <TableCell className="tabular text-center text-sm">{subject.semester_term ?? '—'}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="tabular text-sm">
                                                {subject.effective_weights.written_work} / {subject.effective_weights.performance_task} /{' '}
                                                {subject.effective_weights.quarterly_assessment}
                                            </span>
                                            {subject.has_override && (
                                                <Badge variant="secondary" className="ml-1.5 text-[10px]">
                                                    custom
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(subject)} title="Edit">
                                                    <Pencil className="size-4" />
                                                </Button>
                                                <ConfirmDelete
                                                    url={`/admin/subjects/${subject.id}`}
                                                    title={`Remove ${subject.title}?`}
                                                    description="Every class opened for this subject, along with its class records and grades, will be deleted."
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

                    <Pagination meta={subjects} label="subjects" />
                </CardContent>
            </Card>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit Subject' : 'Add Subject'}</DialogTitle>
                        <DialogDescription>Weights follow DepEd Order No. 8, s. 2015 unless you set a custom scheme.</DialogDescription>
                    </DialogHeader>

                    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
                        <div className="grid gap-1.5">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                placeholder="GENMATH"
                            />
                            <InputError message={form.errors.code} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Hours per week</Label>
                            <Input
                                type="number"
                                min={1}
                                value={form.data.hours_per_week}
                                onChange={(e) => form.setData('hours_per_week', Number(e.target.value))}
                            />
                            <InputError message={form.errors.hours_per_week} />
                        </div>
                        <div className="grid gap-1.5 sm:col-span-2">
                            <Label>Title</Label>
                            <Input value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />
                            <InputError message={form.errors.title} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Type</Label>
                            <Select value={form.data.type} onValueChange={(value) => form.setData('type', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {types.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={form.errors.type} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Strand</Label>
                            <Select
                                value={form.data.strand_id || NONE}
                                onValueChange={(value) => form.setData('strand_id', value === NONE ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All strands" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>All strands</SelectItem>
                                    {strands.map((strand) => (
                                        <SelectItem key={strand.id} value={String(strand.id)}>
                                            {strand.code} — {strand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Semester offered</Label>
                            <Select
                                value={form.data.semester_term || NONE}
                                onValueChange={(value) => form.setData('semester_term', value === NONE ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Either" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={NONE}>Either semester</SelectItem>
                                    <SelectItem value="1">First Semester</SelectItem>
                                    <SelectItem value="2">Second Semester</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                            <Switch
                                checked={form.data.is_active}
                                onCheckedChange={(checked) => form.setData('is_active', checked)}
                                id="subject-active"
                            />
                            <Label htmlFor="subject-active">Active</Label>
                        </div>

                        <div className="bg-muted/40 grid gap-2.5 rounded-lg p-3 sm:col-span-2">
                            <div className="flex items-center gap-2">
                                <Switch checked={customWeights} onCheckedChange={setCustomWeights} id="custom-weights" />
                                <Label htmlFor="custom-weights">Use custom component weights</Label>
                            </div>
                            {customWeights ? (
                                <>
                                    <div className="grid gap-2 sm:grid-cols-3">
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs">Written Work %</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={form.data.ww_weight}
                                                onChange={(e) => form.setData('ww_weight', e.target.value === '' ? '' : Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs">Performance Task %</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={form.data.pt_weight}
                                                onChange={(e) => form.setData('pt_weight', e.target.value === '' ? '' : Number(e.target.value))}
                                            />
                                        </div>
                                        <div className="grid gap-1.5">
                                            <Label className="text-xs">Quarterly Assessment %</Label>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                value={form.data.qa_weight}
                                                onChange={(e) => form.setData('qa_weight', e.target.value === '' ? '' : Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <InputError message={form.errors.ww_weight} />
                                    <p className="text-muted-foreground text-xs">All three are required and must total exactly 100%.</p>
                                </>
                            ) : (
                                <p className="text-muted-foreground text-xs">
                                    Core subjects use 25 / 50 / 25. Applied and specialized subjects use 25 / 45 / 30 in the Academic track, and 20 /
                                    60 / 20 in TVL, Sports and Arts &amp; Design.
                                </p>
                            )}
                        </div>

                        <div className="grid gap-1.5 sm:col-span-2">
                            <Label>Description</Label>
                            <Textarea rows={2} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />
                        </div>

                        <DialogFooter className="sm:col-span-2">
                            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing && <LoaderCircle className="size-4 animate-spin" />}
                                {editing ? 'Save changes' : 'Add subject'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
