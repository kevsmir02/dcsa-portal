import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { ClipboardList, FileText, Printer, Users } from 'lucide-react';
import { useState } from 'react';

interface Props {
    sections: { id: number; name: string; strand: string; enrolled: number }[];
    classes: { id: number; label: string; section: string }[];
    quarters: { id: number; name: string; number: number }[];
    semester: { id: number; name: string } | null;
}

export default function ReportsIndex({ sections, classes, quarters, semester }: Props) {
    const { activeSemester } = usePage<SharedData>().props;
    const [sectionId, setSectionId] = useState<string>(sections[0] ? String(sections[0].id) : '');
    const [classId, setClassId] = useState<string>(classes[0] ? String(classes[0].id) : '');
    const [quarterId, setQuarterId] = useState<string>(quarters[0] ? String(quarters[0].id) : '');
    const [reportCardSection, setReportCardSection] = useState<string>(sections[0] ? String(sections[0].id) : '');

    const open = (url: string) => window.open(url, '_blank', 'noopener');

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Reports', href: '/reports' },
            ]}
        >
            <Head title="Reports" />

            <PageHeader
                title="Reports"
                description={
                    activeSemester
                        ? `Printable DepEd forms for ${activeSemester.name}, S.Y. ${activeSemester.school_year.name}.`
                        : 'Printable DepEd forms.'
                }
            />

            <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <div className="bg-primary/8 text-primary mb-1 flex size-10 items-center justify-center rounded-lg">
                            <FileText className="size-5" />
                        </div>
                        <CardTitle className="text-base">Report Card (SF9)</CardTitle>
                        <p className="text-muted-foreground text-xs">
                            The Learner's Progress Report Card: quarterly grades, semestral final grades and the general average.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Select value={reportCardSection} onValueChange={setReportCardSection}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a section" />
                            </SelectTrigger>
                            <SelectContent>
                                {sections.map((section) => (
                                    <SelectItem key={section.id} value={String(section.id)}>
                                        {section.name} ({section.enrolled} learners)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-muted-foreground text-xs">
                            Open a section's master list below, or a learner's profile, to print an individual report card.
                        </p>
                        <Button
                            variant="outline"
                            className="w-full"
                            disabled={!reportCardSection}
                            onClick={() => open(`/admin/students?section_id=${reportCardSection}`)}
                        >
                            <Users className="size-4" /> Browse learners
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-[hsl(240,43%,29%)]/10 text-[hsl(240,43%,29%)]">
                            <ClipboardList className="size-5" />
                        </div>
                        <CardTitle className="text-base">Class Record</CardTitle>
                        <p className="text-muted-foreground text-xs">
                            One subject class for one quarter: every assessment column with the DepEd computation worked out beside it.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Select value={classId} onValueChange={setClassId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((row) => (
                                    <SelectItem key={row.id} value={String(row.id)}>
                                        {row.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={quarterId} onValueChange={setQuarterId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a quarter" />
                            </SelectTrigger>
                            <SelectContent>
                                {quarters.map((quarter) => (
                                    <SelectItem key={quarter.id} value={String(quarter.id)}>
                                        {quarter.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            className="w-full"
                            disabled={!classId || !quarterId}
                            onClick={() => open(`/reports/class-record/${classId}?quarter=${quarterId}`)}
                        >
                            <Printer className="size-4" /> Generate
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-[hsl(145,56%,27%)]/10 text-[hsl(145,56%,27%)]">
                            <Users className="size-5" />
                        </div>
                        <CardTitle className="text-base">Master List &amp; Grade Sheet</CardTitle>
                        <p className="text-muted-foreground text-xs">
                            Every learner in a section with their final grade in each subject and their general average.
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Select value={sectionId} onValueChange={setSectionId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a section" />
                            </SelectTrigger>
                            <SelectContent>
                                {sections.map((section) => (
                                    <SelectItem key={section.id} value={String(section.id)}>
                                        {section.name} — {section.strand} ({section.enrolled})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            className="w-full"
                            disabled={!sectionId}
                            onClick={() => open(`/reports/master-list/${sectionId}?semester=${semester?.id ?? ''}`)}
                        >
                            <Printer className="size-4" /> Generate
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
