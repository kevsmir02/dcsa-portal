import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Save } from 'lucide-react';
import { FormEventHandler, type ReactNode } from 'react';

interface Student {
    id: number;
    lrn: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    sex: string | null;
    birthdate: string | null;
    birthplace: string | null;
    address: string | null;
    contact_number: string | null;
    guardian_name: string | null;
    guardian_contact: string | null;
    guardian_relationship: string | null;
    status: string;
}

interface Props {
    student: Student | null;
    sections: { id: number; name: string; strand: { code: string } }[];
    currentSectionId?: number | null;
}

const NONE = 'none';

function Field({ label, error, children, className }: { label: string; error?: string; children: ReactNode; className?: string }) {
    return (
        <div className={`grid gap-1.5 ${className ?? ''}`}>
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

export default function StudentForm({ student, sections, currentSectionId }: Props) {
    const editing = Boolean(student);

    const { data, setData, post, put, processing, errors } = useForm({
        lrn: student?.lrn ?? '',
        first_name: student?.first_name ?? '',
        middle_name: student?.middle_name ?? '',
        last_name: student?.last_name ?? '',
        suffix: student?.suffix ?? '',
        sex: student?.sex ?? '',
        birthdate: student?.birthdate?.slice(0, 10) ?? '',
        birthplace: student?.birthplace ?? '',
        address: student?.address ?? '',
        contact_number: student?.contact_number ?? '',
        guardian_name: student?.guardian_name ?? '',
        guardian_contact: student?.guardian_contact ?? '',
        guardian_relationship: student?.guardian_relationship ?? '',
        status: student?.status ?? 'active',
        section_id: currentSectionId ? String(currentSectionId) : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        editing ? put(`/admin/students/${student!.id}`) : post('/admin/students');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Students', href: '/admin/students' },
                { title: editing ? 'Edit' : 'Add', href: '#' },
            ]}
        >
            <Head title={editing ? `Edit ${student!.first_name} ${student!.last_name}` : 'Add Student'} />

            <PageHeader
                title={editing ? 'Edit Student' : 'Add Student'}
                description={
                    editing
                        ? 'Update the learner record.'
                        : 'Register a new Grade 12 learner. A portal login is created automatically, with a one-time password shown once after saving.'
                }
            />

            <form onSubmit={submit} className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-4 lg:col-span-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Learner Information</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-2">
                            <Field label="LRN" error={errors.lrn}>
                                <Input
                                    value={data.lrn}
                                    onChange={(e) => setData('lrn', e.target.value.replace(/\D/g, '').slice(0, 12))}
                                    placeholder="12-digit Learner Reference Number"
                                    inputMode="numeric"
                                />
                            </Field>

                            <Field label="Status" error={errors.status}>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="dropped">Dropped</SelectItem>
                                        <SelectItem value="transferred">Transferred</SelectItem>
                                        <SelectItem value="graduated">Graduated</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="First Name" error={errors.first_name}>
                                <Input value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} />
                            </Field>

                            <Field label="Middle Name" error={errors.middle_name}>
                                <Input value={data.middle_name} onChange={(e) => setData('middle_name', e.target.value)} />
                            </Field>

                            <Field label="Last Name" error={errors.last_name}>
                                <Input value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} />
                            </Field>

                            <Field label="Suffix" error={errors.suffix}>
                                <Input value={data.suffix} onChange={(e) => setData('suffix', e.target.value)} placeholder="Jr., III" />
                            </Field>

                            <Field label="Sex" error={errors.sex}>
                                <Select value={data.sex || NONE} onValueChange={(value) => setData('sex', value === NONE ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NONE}>Not specified</SelectItem>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </Field>

                            <Field label="Birthdate" error={errors.birthdate}>
                                <Input type="date" value={data.birthdate} onChange={(e) => setData('birthdate', e.target.value)} />
                            </Field>

                            <Field label="Birthplace" error={errors.birthplace}>
                                <Input value={data.birthplace} onChange={(e) => setData('birthplace', e.target.value)} />
                            </Field>

                            <Field label="Contact Number" error={errors.contact_number}>
                                <Input
                                    value={data.contact_number}
                                    onChange={(e) => setData('contact_number', e.target.value)}
                                    placeholder="09XXXXXXXXX"
                                />
                            </Field>

                            <Field label="Address" error={errors.address} className="sm:col-span-2">
                                <Textarea value={data.address} onChange={(e) => setData('address', e.target.value)} rows={2} />
                            </Field>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Parent / Guardian</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 sm:grid-cols-3">
                            <Field label="Guardian Name" error={errors.guardian_name}>
                                <Input value={data.guardian_name} onChange={(e) => setData('guardian_name', e.target.value)} />
                            </Field>
                            <Field label="Relationship" error={errors.guardian_relationship}>
                                <Input
                                    value={data.guardian_relationship}
                                    onChange={(e) => setData('guardian_relationship', e.target.value)}
                                    placeholder="Mother"
                                />
                            </Field>
                            <Field label="Contact Number" error={errors.guardian_contact}>
                                <Input value={data.guardian_contact} onChange={(e) => setData('guardian_contact', e.target.value)} />
                            </Field>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Enrollment</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Field label="Section (current semester)" error={errors.section_id}>
                                <Select value={data.section_id || NONE} onValueChange={(value) => setData('section_id', value === NONE ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Not enrolled" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NONE}>Not enrolled</SelectItem>
                                        {sections.map((section) => (
                                            <SelectItem key={section.id} value={String(section.id)}>
                                                {section.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </Field>
                            <p className="text-muted-foreground text-xs">
                                Choosing a section enrols the learner for the active semester and gives them every subject that section takes.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing} className="flex-1">
                            {processing ? <LoaderCircle className="size-4 animate-spin" /> : <Save className="size-4" />}
                            {editing ? 'Save changes' : 'Add student'}
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href="/admin/students">Cancel</Link>
                        </Button>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
