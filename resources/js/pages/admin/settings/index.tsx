import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Pagination } from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { type Paginated } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle2, KeyRound, LoaderCircle, Lock, LockOpen, Save } from 'lucide-react';
import { FormEventHandler } from 'react';

interface QuarterRow {
    id: number;
    number: number;
    name: string;
    is_locked: boolean;
    locked_at: string | null;
    locked_by: { id: number; name: string } | null;
}

interface SemesterRow {
    id: number;
    term: number;
    name: string;
    is_active: boolean;
    quarters: QuarterRow[];
}

interface SchoolYearRow {
    id: number;
    name: string;
    is_active: boolean;
    semesters: SemesterRow[];
}

interface Props {
    school: Record<string, string>;
    grading: { passing_grade: number };
    schoolYears: SchoolYearRow[];
    transmutation: { min: number; max: number; grade: number }[];
    defaultWeights: { label: string; ww: number; pt: number; qa: number }[];
    users: Paginated<{ id: number; name: string; email: string; role: string; role_label: string; is_active: boolean }>;
}

export default function SettingsIndex({ school, grading, schoolYears, transmutation, defaultWeights, users }: Props) {
    const schoolForm = useForm({
        name: school.name ?? '',
        short_name: school.short_name ?? '',
        system_name: school.system_name ?? '',
        address: school.address ?? '',
        contact_number: school.contact_number ?? '',
        email: school.email ?? '',
        school_id: school.school_id ?? '',
    });

    const submitSchool: FormEventHandler = (e) => {
        e.preventDefault();
        schoolForm.put('/admin/settings/school', { preserveScroll: true });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Settings', href: '/admin/settings' },
            ]}
        >
            <Head title="Settings" />

            <PageHeader title="Settings" description="School profile, academic calendar, grading rules and portal accounts." />

            <Tabs defaultValue="calendar">
                <TabsList>
                    <TabsTrigger value="calendar">Academic Calendar</TabsTrigger>
                    <TabsTrigger value="grading">Grading</TabsTrigger>
                    <TabsTrigger value="school">School Profile</TabsTrigger>
                    <TabsTrigger value="users">Accounts</TabsTrigger>
                </TabsList>

                <TabsContent value="calendar" className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Closing a quarter freezes every class record in it — teachers can no longer edit those grades. Reopening it lets them encode
                        again.
                    </p>

                    {schoolYears.map((year) => (
                        <Card key={year.id}>
                            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-base">
                                    S.Y. {year.name}
                                    {year.is_active && (
                                        <Badge variant="secondary" className="ml-2">
                                            Active
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {year.semesters.map((semester) => (
                                    <div key={semester.id} className="border-border rounded-lg border p-3">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{semester.name}</span>
                                                {semester.is_active && (
                                                    <Badge variant="secondary" className="gap-1">
                                                        <CheckCircle2 className="size-3" /> Active term
                                                    </Badge>
                                                )}
                                            </div>
                                            {!semester.is_active && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        router.post(`/admin/settings/semesters/${semester.id}/activate`, {}, { preserveScroll: true })
                                                    }
                                                >
                                                    Make active
                                                </Button>
                                            )}
                                        </div>

                                        <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                                            {semester.quarters.map((quarter) => (
                                                <div
                                                    key={quarter.id}
                                                    className="border-border flex items-center justify-between gap-2 rounded-md border px-3 py-2"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium">{quarter.name}</div>
                                                        <div className="text-muted-foreground text-xs">
                                                            {quarter.is_locked ? 'Closed for encoding' : 'Open for encoding'}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant={quarter.is_locked ? 'outline' : 'default'}
                                                        onClick={() =>
                                                            router.post(
                                                                `/admin/settings/quarters/${quarter.id}/toggle-lock`,
                                                                {},
                                                                { preserveScroll: true },
                                                            )
                                                        }
                                                    >
                                                        {quarter.is_locked ? (
                                                            <>
                                                                <LockOpen className="size-3.5" /> Reopen
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock className="size-3.5" /> Close
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="grading" className="grid gap-4 lg:grid-cols-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Component Weights</CardTitle>
                            <p className="text-muted-foreground text-xs">
                                The DepEd Order No. 8, s. 2015 defaults. A subject can override them individually from the Subjects page.
                            </p>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Applies to</TableHead>
                                        <TableHead className="text-center">WW</TableHead>
                                        <TableHead className="text-center">PT</TableHead>
                                        <TableHead className="pr-6 text-center">QA</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {defaultWeights.map((row) => (
                                        <TableRow key={row.label}>
                                            <TableCell className="pl-6 text-sm">{row.label}</TableCell>
                                            <TableCell className="tabular text-center text-sm">{row.ww}%</TableCell>
                                            <TableCell className="tabular text-center text-sm">{row.pt}%</TableCell>
                                            <TableCell className="tabular pr-6 text-center text-sm">{row.qa}%</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="text-muted-foreground border-border border-t px-6 py-3 text-xs">
                                Passing grade: <strong className="text-foreground">{grading.passing_grade}</strong>. Descriptors: 90–100 Outstanding ·
                                85–89 Very Satisfactory · 80–84 Satisfactory · 75–79 Fairly Satisfactory · below 75 Did Not Meet Expectations.
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Transmutation Table</CardTitle>
                            <p className="text-muted-foreground text-xs">How an initial grade becomes the grade written on the report card.</p>
                        </CardHeader>
                        <CardContent className="px-0 pb-0">
                            <div className="max-h-96 overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="pl-6">Initial Grade</TableHead>
                                            <TableHead className="pr-6 text-right">Transmuted</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transmutation.map((row) => (
                                            <TableRow key={row.grade}>
                                                <TableCell className="tabular pl-6 text-sm">
                                                    {row.min === row.max ? row.min.toFixed(2) : `${row.min.toFixed(2)} – ${row.max.toFixed(2)}`}
                                                </TableCell>
                                                <TableCell className="tabular pr-6 text-right text-sm font-semibold">{row.grade}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="school">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">School Profile</CardTitle>
                            <p className="text-muted-foreground text-xs">This appears on the sidebar, the sign-in page and every printed form.</p>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={submitSchool} className="grid gap-3 sm:grid-cols-2">
                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label>School name</Label>
                                    <Input value={schoolForm.data.name} onChange={(e) => schoolForm.setData('name', e.target.value)} />
                                    <InputError message={schoolForm.errors.name} />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>Short name</Label>
                                    <Input value={schoolForm.data.short_name} onChange={(e) => schoolForm.setData('short_name', e.target.value)} />
                                    <InputError message={schoolForm.errors.short_name} />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>School ID</Label>
                                    <Input value={schoolForm.data.school_id} onChange={(e) => schoolForm.setData('school_id', e.target.value)} />
                                </div>
                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label>System name</Label>
                                    <Input value={schoolForm.data.system_name} onChange={(e) => schoolForm.setData('system_name', e.target.value)} />
                                    <InputError message={schoolForm.errors.system_name} />
                                </div>
                                <div className="grid gap-1.5 sm:col-span-2">
                                    <Label>Address</Label>
                                    <Input value={schoolForm.data.address} onChange={(e) => schoolForm.setData('address', e.target.value)} />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>Contact number</Label>
                                    <Input
                                        value={schoolForm.data.contact_number}
                                        onChange={(e) => schoolForm.setData('contact_number', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label>Email</Label>
                                    <Input type="email" value={schoolForm.data.email} onChange={(e) => schoolForm.setData('email', e.target.value)} />
                                    <InputError message={schoolForm.errors.email} />
                                </div>
                                <div className="sm:col-span-2">
                                    <Button type="submit" disabled={schoolForm.processing}>
                                        {schoolForm.processing ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                                        Save profile
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="users">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Portal Accounts</CardTitle>
                            <p className="text-muted-foreground text-xs">Resetting a password sets it back to "password".</p>
                        </CardHeader>
                        <CardContent className="px-0 pb-3">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="pl-6">Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="pr-6 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.data.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="pl-6 text-sm font-medium">{user.name}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{user.role_label}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.is_active ? 'secondary' : 'outline'}>
                                                    {user.is_active ? 'Active' : 'Disabled'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="pr-6">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.post(
                                                                `/admin/settings/users/${user.id}/reset-password`,
                                                                {},
                                                                { preserveScroll: true },
                                                            )
                                                        }
                                                    >
                                                        <KeyRound className="size-3.5" /> Reset
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.post(`/admin/settings/users/${user.id}/toggle`, {}, { preserveScroll: true })
                                                        }
                                                    >
                                                        {user.is_active ? 'Disable' : 'Enable'}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="px-6">
                                <Pagination meta={users} label="accounts" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
