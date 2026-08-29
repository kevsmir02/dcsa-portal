import { ConfirmDelete } from '@/components/confirm-delete';
import { EmptyState } from '@/components/empty-state';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface StudentRow {
    id: number;
    lrn: string;
    full_name: string;
    sex: string | null;
    section: string | null;
    status: string;
}

interface Props {
    students: Paginated<StudentRow>;
    sections: { id: number; name: string }[];
    filters: { search?: string; status?: string; section_id?: string };
}

const ALL = 'all';

export default function StudentsIndex({ students, sections, filters }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');

    // Debounce the search box so each keystroke is not its own request.
    useEffect(() => {
        if (search === (filters.search ?? '')) return;

        const timer = setTimeout(() => {
            router.get('/admin/students', { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const applyFilter = (key: string, value: string) => {
        router.get(
            '/admin/students',
            { ...filters, search: search || undefined, [key]: value === ALL ? undefined : value },
            { preserveState: true, replace: true },
        );
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Students', href: '/admin/students' },
            ]}
        >
            <Head title="Students" />

            <PageHeader
                title="Students"
                description="Grade 12 learner records and their section assignment."
                actions={
                    <Button asChild>
                        <Link href="/admin/students/create">
                            <Plus className="size-4" /> Add Student
                        </Link>
                    </Button>
                }
            />

            <Card>
                <CardContent className="space-y-3 p-3">
                    <div className="flex flex-wrap gap-2">
                        <div className="relative min-w-56 flex-1">
                            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                            <Input placeholder="Search by LRN or name…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>

                        <Select value={filters.section_id ?? ALL} onValueChange={(value) => applyFilter('section_id', value)}>
                            <SelectTrigger className="w-44">
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
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="All statuses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>All statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="dropped">Dropped</SelectItem>
                                <SelectItem value="transferred">Transferred</SelectItem>
                                <SelectItem value="graduated">Graduated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {students.data.length === 0 ? (
                        <EmptyState
                            icon={Users}
                            title="No students found"
                            description="Adjust the filters, or add the first learner record."
                            action={
                                <Button asChild size="sm">
                                    <Link href="/admin/students/create">
                                        <Plus className="size-4" /> Add Student
                                    </Link>
                                </Button>
                            }
                        />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>LRN</TableHead>
                                    <TableHead>Full Name</TableHead>
                                    <TableHead>Sex</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.data.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="tabular text-muted-foreground text-xs">{student.lrn}</TableCell>
                                        <TableCell className="font-medium">
                                            <Link href={`/admin/students/${student.id}`} className="hover:text-primary hover:underline">
                                                {student.full_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell className="capitalize">{student.sex ?? '—'}</TableCell>
                                        <TableCell>{student.section ?? <span className="text-muted-foreground">Unassigned</span>}</TableCell>
                                        <TableCell>
                                            <Badge variant={student.status === 'active' ? 'secondary' : 'outline'} className="capitalize">
                                                {student.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                    <Link href={`/admin/students/${student.id}`} title="View">
                                                        <Eye className="size-4" />
                                                    </Link>
                                                </Button>
                                                <Button variant="ghost" size="icon" className="size-8" asChild>
                                                    <Link href={`/admin/students/${student.id}/edit`} title="Edit">
                                                        <Pencil className="size-4" />
                                                    </Link>
                                                </Button>
                                                <ConfirmDelete
                                                    url={`/admin/students/${student.id}`}
                                                    title={`Remove ${student.full_name}?`}
                                                    description="This deletes the learner record, their portal login and every grade attached to it. This cannot be undone."
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

                    <Pagination meta={students} label="students" />
                </CardContent>
            </Card>
        </AppLayout>
    );
}
