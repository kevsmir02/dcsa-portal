import { GradeBadge } from '@/components/grade-badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/**
 * A class record as a teacher sees it, shrunk to fit the hero. The figures are one
 * consistent worked example, not live data: each initial grade is the 25/50/25
 * weighting of the three component scores, transmuted per Appendix B.
 */
const learners = [
    { name: 'Dela Cruz, Juan M.', ww: 95.0, pt: 92.0, qa: 86.6, initial: 91.4, grade: 94 },
    { name: 'Bautista, Maria C.', ww: 82.4, pt: 85.0, qa: 80.0, initial: 83.1, grade: 89 },
    { name: 'Reyes, Angelo P.', ww: 70.0, pt: 75.0, qa: 72.0, initial: 73.0, grade: 83 },
    { name: 'Santos, Liza F.', ww: 62.0, pt: 68.0, qa: 62.0, initial: 65.0, grade: 78 },
];

export function ClassRecordPreview() {
    return (
        <div className="bg-card border-border overflow-hidden rounded-lg border shadow-[0_18px_44px_-22px_rgba(24,16,16,0.32),0_2px_6px_-2px_rgba(24,16,16,0.08)]">
            <div className="border-border flex items-start justify-between gap-4 border-b px-4 py-3.5 lg:px-5 lg:py-4">
                <div className="grid gap-0.5">
                    <div className="text-sm font-semibold tracking-tight lg:text-[15px]">General Mathematics</div>
                    <div className="text-muted-foreground text-[11px] lg:text-xs">STEM 12-A · Second Quarter</div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[hsl(145,56%,27%)]/12 px-2.5 py-1 text-[10px] font-semibold text-[hsl(145,56%,24%)] lg:text-[11px] dark:bg-[hsl(145,45%,50%)]/15 dark:text-[hsl(145,45%,60%)]">
                    <span aria-hidden className="size-1.5 rounded-full bg-current" />
                    <span>
                        Open<span className="hidden lg:inline"> for encoding</span>
                    </span>
                </span>
            </div>

            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="px-4 lg:px-5">Learner</TableHead>
                        <TableHead className="hidden text-right sm:table-cell">WW</TableHead>
                        <TableHead className="hidden text-right sm:table-cell">PT</TableHead>
                        <TableHead className="hidden text-right sm:table-cell">QA</TableHead>
                        <TableHead className="text-right">Initial</TableHead>
                        <TableHead className="px-4 text-right lg:px-5">Grade</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {learners.map((learner) => (
                        <TableRow key={learner.name}>
                            <TableCell className="px-4 text-[13px] lg:px-5 lg:text-sm">{learner.name}</TableCell>
                            <TableCell className="tabular text-muted-foreground hidden text-right text-sm sm:table-cell">
                                {learner.ww.toFixed(2)}
                            </TableCell>
                            <TableCell className="tabular text-muted-foreground hidden text-right text-sm sm:table-cell">
                                {learner.pt.toFixed(2)}
                            </TableCell>
                            <TableCell className="tabular text-muted-foreground hidden text-right text-sm sm:table-cell">
                                {learner.qa.toFixed(2)}
                            </TableCell>
                            <TableCell className="tabular text-right text-[13px] font-medium lg:text-sm">{learner.initial.toFixed(2)}</TableCell>
                            <TableCell className="px-4 text-right lg:px-5">
                                <GradeBadge grade={learner.grade} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="bg-muted border-border text-muted-foreground border-t px-4 py-3 text-[11px] leading-relaxed lg:px-5 lg:text-xs">
                Weighted 25 / 50 / 25 for a core subject, then transmuted onto the 60–100 scale.
            </div>
        </div>
    );
}
